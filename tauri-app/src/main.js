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

// DOM の読み込み完了時にイベントリスナーを設定します
window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
