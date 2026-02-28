# Tauri App リリース手順

このドキュメントでは、GitHub Actions を使用して Tauri アプリケーションをビルドし、リリースを作成する手順を説明します。

## 前提条件

- GitHub Actions のワークフロー (`.github/workflows/release.yml`) がリポジトリに存在すること
- `v*` (例: `v1.0.0`) の形式のタグがプッシュされたときにワークフローが実行されるように設定されていること

## リリース作成手順

1. **バージョンの更新**
   リリースの前に、プロジェクトのバージョンを更新します。
   `tauri-app/package.json` と `tauri-app/src-tauri/tauri.conf.json` の `version` フィールドを新しいバージョン番号に更新し、コミットして main ブランチにプッシュします。

   ```bash
   git add tauri-app/package.json tauri-app/src-tauri/tauri.conf.json
   git commit -m "chore: update version to v1.0.0"
   git push origin main
   ```

2. **タグの作成とプッシュ**
   新しいバージョン番号で Git タグを作成し、GitHub にプッシュします。タグ名は必ず `v` から始めてください (例: `v1.0.0`)。

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **ワークフローの実行の確認**
   タグがプッシュされると、GitHub Actions の `Release` ワークフローが自動的にトリガーされます。
   GitHub リポジトリの **Actions** タブに移動し、ビルドプロセスが正常に進行していることを確認します。

   このワークフローでは以下のプラットフォーム向けにビルドが行われます:
   - Windows (`windows-latest`)
   - macOS (`macos-latest`)
   - Linux (`ubuntu-22.04`)

4. **リリースの公開**
   ワークフローが正常に完了すると、GitHub リポジトリの **Releases** ページに新しいリリースが「Draft (下書き)」状態で作成されます。

   1. GitHub リポジトリの右側にある **Releases** をクリックします。
   2. 新しく作成された Draft リリースを開きます。
   3. 必要に応じてリリースノート (変更履歴など) を編集します。
   4. ビルドされた各 OS 向けのインストーラやバイナリが Assets に添付されていることを確認します。
   5. **Publish release** ボタンをクリックして、リリースを公開します。

## トラブルシューティング

- **ビルドエラーが発生した場合**: Actions タブから失敗したジョブのログを確認してください。
- **Release が作成されない場合**: `GITHUB_TOKEN` の権限が正しく設定されているか (`contents: write` 権限) 確認してください。ワークフローファイル内で権限設定は行われています。
