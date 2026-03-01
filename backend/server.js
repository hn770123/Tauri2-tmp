const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;
const SECRET_KEY = 'your_super_secret_key'; // 本番環境では環境変数などから取得するようにしてください

// ミドルウェアの設定
app.use(cors());
app.use(express.json());

/**
 * データベースの初期化
 * SQLiteデータベースを作成し、usersテーブルが存在しない場合は作成します。
 */
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('データベースの接続に失敗しました:', err.message);
  } else {
    console.log('SQLiteデータベースに接続しました。');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);
  }
});

/**
 * ユーザー登録API
 * 新しいユーザーを作成し、パスワードをハッシュ化してデータベースに保存します。
 */
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
  }

  try {
    // パスワードのハッシュ化 (コスト: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(query, [username, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'このユーザー名は既に使用されています' });
        }
        return res.status(500).json({ error: 'ユーザーの登録に失敗しました' });
      }
      res.status(201).json({ message: 'ユーザー登録が完了しました', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

/**
 * ログインAPI
 * ユーザー名とパスワードを検証し、成功した場合にJWTを発行します。
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  db.get(query, [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'データベースエラーが発生しました' });
    }

    if (!user) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }

    // パスワードの照合
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }

    // JWTの生成 (有効期限: 1時間)
    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: 'ログインに成功しました', token });
  });
});

/**
 * サーバーの起動
 */
app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動しました`);
});
