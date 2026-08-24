# CLAUDE.md

Astro 製の個人アカデミックサイト（GitHub Pages: ichiroex.github.io）。
コンテンツは `src/data/*.yaml` で管理し、ページはビルド時に静的生成される。

## デプロイフロー（重要）

- **main への push = 本番公開**。GitHub Actions（`.github/workflows/deploy.yml`）が GitHub Pages へ自動デプロイする
- 作業は必ず feature ブランチで行い、ローカルプレビュー（`npm run dev`）で確認してから main へマージする
- Node バージョンは `.nvmrc` で管理（CI も同ファイルを参照）

## データファイル構成

| ファイル | 内容 |
|---|---|
| `src/data/settings.yaml` | プロフィール・SNSリンク・GA4測定ID・著者名強調リスト（`author_names`） |
| `src/data/publications.yaml` | 論文データ（学術誌・国際会議・国内会議・プレプリント） |
| `src/data/news.yaml` | お知らせ |
| `src/data/research.yaml` | 研究プロジェクト（publications の id を参照） |
| `src/data/cv.yaml` | 経歴・学歴 |
| `src/content/BlogPosts/` | ブログ記事（Markdown） |

## ID参照の整合性（重要）

`publications.yaml` の `id` は以下から参照されている。**id を変更・削除したら必ず横断的に更新すること**（壊れてもビルドエラーにならず、静かに表示が消える）：

- `research.yaml` の `publications:` リスト → researchページのバッジ表示
- `news.yaml` の `link: "/papers/#<id>"` → papersページへのアンカーリンク

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

## 論文エントリの記法

- `links` で使えるキーは `pdf` / `arxiv` / `github` / `slides` / `poster` / `bibtex` / `huggingface`
  （`src/types/publication.ts` の `PublicationLinks` で定義）
- ACL Anthology や J-STAGE の論文ページは `pdf` キーで登録する（このサイトの慣習）
- 受賞論文には `award: "賞名"` を付けると 🏆 バッジが表示される（例: `award: "Best Paper Award"`）

## 検証

- 変更後は `npm run build` でビルドが通ることを確認する
- ローカルプレビューは `npm run dev`（http://localhost:4321/）
