# Soichiro Murakami's Personal Website

研究者ポートフォリオサイト（Astro + Tailwind CSS）

## サイト構成

- **トップページ**: プロフィール、News、研究分野、最新論文
- **Publications**: 論文一覧（種類別・年度別）
- **CV**: 職歴・学歴・受賞歴・スキル
- **Blog**: 技術記事

## データの編集方法

全てのデータは `src/data/` ディレクトリ内のYAMLファイルで管理されています。

### 論文を追加する

`src/data/publications.yaml` を編集：

```yaml
# 新しい論文を追加（ファイルの該当セクションに追加）
- title: "論文タイトル"
  authors: "著者1, 著者2, 著者3"
  venue: "会議名 or ジャーナル名"
  year: 2026
  month: 3
  type: international  # journal / international / domestic / preprint / technical
  award: "Best Paper Award"  # 受賞がある場合のみ
  links:
    pdf: "https://..."
    arxiv: "https://arxiv.org/abs/..."
    github: "https://github.com/..."
    slides: "https://..."
    huggingface: "https://huggingface.co/..."
```

**type の種類:**
| type | 説明 |
|------|------|
| `journal` | 学術誌（査読あり） |
| `international` | 国際会議（査読あり） |
| `domestic` | 国内発表（査読なし） |
| `preprint` | プレプリント（arXiv等） |
| `technical` | テクニカルレポート |

### お知らせを追加する

`src/data/news.yaml` を編集：

```yaml
# 新しいお知らせを追加（ファイルの先頭に追加すると最新として表示）
- title: "ACL 2026 に論文が採択されました"
  date: "2026-01-15"
  content: "論文タイトル が ACL 2026 に採択されました。"
  pinned: true   # トップに固定する場合は true
  link: "/papers"  # リンク先（省略可）
```

### CVを編集する

`src/data/cv.yaml` を編集：

```yaml
# 職歴を追加
experiences:
  - company: "会社名"
    time: "開始年月 - 終了年月"
    title: "役職"
    location: "場所"
    description: "説明"

# 学歴を追加
education:
  - school: "学校名"
    time: "期間"
    degree: "学位"
    location: "場所"
    description: "説明"

# 受賞を追加
awards:
  - title: "受賞名"
    year: 2026
    month: 3

# スキルを編集
skills:
  - title: "スキルカテゴリ"
    description: "詳細"
```

### サイト設定を変更する

`src/data/settings.yaml` を編集：

```yaml
profile:
  fullName: "名前"
  title: "肩書き"
  institute: "所属"
  author_name: "論文で強調表示する名前"

social:
  linkedin: "URL"
  github: "URL"
  scholar: "URL"
  orcid: "URL"

seo:
  default_title: "サイトタイトル"
  default_description: "サイトの説明"
```

### ブログ記事を追加する

`src/content/BlogPosts/` に新しい `.md` ファイルを作成：

```markdown
---
title: "記事タイトル"
date: "2026-01-15"
excerpt: "記事の概要（一覧に表示される）"
tags: ["tag1", "tag2"]
---

記事の本文をここに書く...
```

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（http://localhost:4321）
npm run dev

# ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## デプロイ

mainブランチにpushすると、GitHub Actionsが自動でビルド・デプロイします。

```bash
# 変更をコミット
git add .
git commit -m "Add new publication"

# pushでデプロイ開始
git push origin main
```

デプロイ状況は GitHub リポジトリの Actions タブで確認できます。

### 初回セットアップ（GitHub Pages）

1. GitHubにリポジトリを作成（例: `ichiroex.github.io`）
2. リポジトリの Settings > Pages > Source を "GitHub Actions" に設定
3. mainブランチにpush

## ディレクトリ構成

```
src/
├── data/                    # データファイル（YAML）
│   ├── settings.yaml        # サイト設定
│   ├── publications.yaml    # 論文データ
│   ├── cv.yaml              # CV（職歴・学歴等）
│   └── news.yaml            # お知らせ
├── content/
│   └── BlogPosts/           # ブログ記事（Markdown）
├── components/              # UIコンポーネント
├── pages/                   # ページ
├── lib/                     # ユーティリティ
└── settings.ts              # YAML読み込み用
```

## 技術スタック

- [Astro](https://astro.build/) - 静的サイトジェネレーター
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [DaisyUI](https://daisyui.com/) - Tailwindコンポーネント
- GitHub Pages - ホスティング
- GitHub Actions - CI/CD

## ライセンス

MIT License
