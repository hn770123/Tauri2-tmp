// Tauri のコア機能から invoke 関数をインポートします
const { invoke } = window.__TAURI__.core;

/**
 * 挨拶入力欄の要素
 */
let greetInputEl;

/**
 * 挨拶メッセージ表示エリアの要素
 */
let greetMsgEl;

/**
 * Rust の greet コマンドを呼び出し、結果を表示します
 */
async function greet() {
  // Tauri コマンドについては https://tauri.app/develop/calling-rust/ を参照してください
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

const BACKEND_URL = 'http://localhost:3000';

/**
 * トークンを localStorage に保存する
 */
function saveToken(token) {
  localStorage.setItem('jwt_token', token);
  updateUI();
}

/**
 * トークンを localStorage から取得する
 */
function getToken() {
  return localStorage.getItem('jwt_token');
}

/**
 * ログアウト処理 (トークンの削除)
 */
function logout() {
  localStorage.removeItem('jwt_token');
  updateUI();
}

/**
 * ログイン状態に応じてUIを切り替える
 */
function updateUI() {
  const token = getToken();
  const authForms = document.getElementById('auth-forms');
  const authContent = document.getElementById('auth-content');
  const mainAppContent = document.getElementById('main-app-content');

  if (token) {
    // ログイン済み
    if (authForms) authForms.style.display = 'none';
    if (authContent) authContent.style.display = 'block';
    if (mainAppContent) mainAppContent.style.display = 'block';
  } else {
    // 未ログイン
    if (authForms) authForms.style.display = 'flex';
    if (authContent) authContent.style.display = 'none';
    if (mainAppContent) mainAppContent.style.display = 'none';
  }
}

/**
 * ユーザー登録処理
 */
async function registerUser(username, password) {
  const msgEl = document.getElementById('register-msg');
  try {
    const response = await fetch(`${BACKEND_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      msgEl.textContent = '登録に成功しました。ログインしてください。';
      msgEl.style.color = 'green';
    } else {
      msgEl.textContent = data.error || '登録に失敗しました';
      msgEl.style.color = 'red';
    }
  } catch (error) {
    msgEl.textContent = 'サーバーとの通信に失敗しました';
    msgEl.style.color = 'red';
  }
}

/**
 * ログイン処理
 */
async function loginUser(username, password) {
  const msgEl = document.getElementById('login-msg');
  try {
    const response = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      msgEl.textContent = 'ログインに成功しました';
      msgEl.style.color = 'green';
      saveToken(data.token);
    } else {
      msgEl.textContent = data.error || 'ログインに失敗しました';
      msgEl.style.color = 'red';
    }
  } catch (error) {
    msgEl.textContent = 'サーバーとの通信に失敗しました';
    msgEl.style.color = 'red';
  }
}

// DOM の読み込み完了時にイベントリスナーを設定します
window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");

  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });

  // 初期UIの状態設定
  updateUI();

  // 新規登録フォームの送信イベント
  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameEl = document.getElementById('register-username');
    const passwordEl = document.getElementById('register-password');
    registerUser(usernameEl.value, passwordEl.value);
  });

  // ログインフォームの送信イベント
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameEl = document.getElementById('login-username');
    const passwordEl = document.getElementById('login-password');
    loginUser(usernameEl.value, passwordEl.value);
  });

  // ログアウトボタンのクリックイベント
  document.getElementById('logout-btn').addEventListener('click', () => {
    logout();
  });
});
