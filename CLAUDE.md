# CLAUDE.md

Astro 製の個人アカデミックサイト（GitHub Pages: ichiroex.github.io）。
コンテンツは `src/data/*.yaml` で管理し、ページはビルド時に静的生成される。

## News の運用ルール（重要）

`src/data/news.yaml` の `pinned` は NEW バッジの表示フラグ。以下を厳守すること：

- **pinned は「日付から3ヶ月以内」のニュースのみ `true` にする**
- 新しいニュースを追加する際は、3ヶ月を過ぎた古いエントリの `pinned` を `false` に直すこと
- トップページの News 欄は最新5件が自動表示される（`index.astro` の `<News limit={5} />`）。
  `news.yaml` から古いエントリを削除する必要はなく、全履歴を残してよい

## 論文採択時の更新手順

プレプリントが会議・ジャーナルに採択されたら：

1. `publications.yaml`: エントリをプレプリントセクションから該当セクションへ移動。
   `id` は `<会議名><年>-<略称>` 形式（例: `emnlp2026-humor`）、`venue`・`month`・`type` を更新。
   arXiv リンクは `links.arxiv` として維持する（プレプリントと採択版の重複掲載はしない）
2. `research.yaml`: 旧 `id` を参照している場合は新 `id` に更新
3. `news.yaml`: 採択のお知らせを先頭に追加（`pinned: true`、上記3ヶ月ルールに従い古いものを整理）

## 検証

- 変更後は `npm run build` でビルドが通ることを確認する
- ローカルプレビューは `npm run dev`（http://localhost:4321/）
