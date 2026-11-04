# 統計手法ナビ

研究の目的とデータの形から、統計手法の候補と確認事項を選ぶ日本語の静的Webアプリです。

## 使い方

公開URL、または `index.html` をブラウザで開きます。HTML・CSS・JavaScriptが1ファイルにまとまっており、実行時の外部ライブラリやバックエンドは不要です。参考資料へのリンクはオンラインで開きます。

4つのタブがあります。

- **手法を選ぶ**：目的とデータの形を選び、候補となる手法を確認します。
- **早見表**：手法を一覧で参照できます。
- **前提を確認**：何の分布を見るか、統計ソフトで出す図、正規性検定の読み方を案内します。結果カードから該当箇所を開き、選択条件を保って戻れます。
- **考え方と出典**：選択ガイドの考え方と参考資料を確認できます。

データ入力や統計計算、正規性の自動判定は行いません。

## GitHub Pagesで公開

このフォルダの中身をリポジトリの最上位に配置します。`index.html` と空の `.nojekyll` ファイルを含めてください。

GitHubで、リポジトリの **Settings → Pages** を開き、次の設定で保存します。

| 項目 | 設定 |
| --- | --- |
| Source | Deploy from a branch |
| Branch | main |
| Folder | / (root) |

ブランチ名が `main` 以外の場合は、ファイルをプッシュしたブランチを選びます。公開が完了すると、同じ画面にサイトのURLが表示されます。以後、そのブランチの `index.html` を更新すると公開内容も更新されます。

この設定を行う前は、プッシュだけでWebサイトが公開されるわけではありません。GitHub Pagesの利用条件は、リポジトリの公開範囲とGitHubのプランによって異なります。

公式手順：<https://docs.github.com/ja/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>

## 編集とビルド

Node.jsを使用します。パッケージのインストールは不要です。

```sh
node build.mjs
node test.mjs
```

`src/` のファイルを編集したら `node build.mjs` を実行し、生成された最上位の `index.html` も一緒にコミット・プッシュしてください。

| ファイル | 役割 |
| --- | --- |
| `src/guide.js` | 質問・選択ロジック・説明・出典 |
| `src/ui.js` | 画面の操作 |
| `src/styles.css` / `src/help.css` | 画面のスタイル |
| `src/template.html` | HTMLのひな形 |
| `build.mjs` | 最上位の `index.html` を生成 |
| `test.mjs` | 選択ロジックの検証 |

## バージョン

v1.1：「前提を確認」タブを追加した版です。
