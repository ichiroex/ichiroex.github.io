---
title: "論文紹介: A Neural Layered Model for Nested Named Entity Recognition (Ju+,NAACL2018)"
date: "2021-07-24"
excerpt: "Nested Named Entity Recognitionについて調べる機会があり、いくつかの論文をサーベイしました。今回はA Neural Layered Model for Nested Named Entity Recognition (Ju+,NAACL2018)について簡単に中身を記録します。"
tags: ["paper", "NER", "NLP"]
---

# はじめに

Nested Named Entity Recognitionについて調べる機会があり, いくつかの論文をサーベイしたのでその記録としてまとめていきます.
今回は調査した論文のうち, 下記の1つをピックアップして, 簡単に中身を記録します.

- **A Neural Layered Model for Nested Named Entity Recognition (Ju+,NAACL2018)**
- Deep Exhaustive Model for Nested Named Entity Recognition (Sohrab+,EMNLP2018)
- A Boundary-aware Neural Model for Nested Named Entity Recognition (Zhen+,EMNLP2019)
- Boundary Enhanced Neural SpanClassification for Nested Named Entity Recognition (Tan+,AAAI2020)
- HIT: Nested Named Entity Recognition via Head-Tail Pairand Token Interaction (Wamg+,EMNLP2020)
- A Boundary Assembling Method for NestedBiomedical Named Entity Recognition (Chen+,IEEE Access,2020)
- Locate and Label: A Two-stage Identifier for Nested Named EntityRecognition (Shen+,ACL2021)


# Nested Named Entity Recognitionとは

固有表現抽出（Named Entity Recogniton; NER）とは, 人名や組織名などの固有名詞や日付, 時間, 価格などに関する表現をテキストから抽出するタスクのことです. 自然言語処理の分野で長年取り組まれているタスクの1つであり, Entity Linkingや関係抽出, イベント抽出などの前段処理として広く用いられています.  

自然言語の特性から多くの固有表現（Named Entity）には, 他の固有表現を含むものが多く存在しています. 
たとえば, 「東京工業大学」という固有表現（組織名）には, 「東京」といった固有表現（地名）が含まれています. 

このように, 固有表現の中に別の固有表現が含まれているような構造は **入れ子（Nest）** と呼ばれています. 
（プログラミングでも入れ子というワードはよく出てきますね）

以上の背景から, 入れ子の固有表現も考慮した固有表現抽出のことを特に **Nested Named Entity Recognition**, または, **Nested NER**  と呼ばれています. 
このNestedというキーワードに対比して, Nested NERに関する論文では, 入れ子を考慮しない一般的な固有表現抽出のことを **Flat-NER** と呼んでいます.  

Nested NERでは, 固有表現の入れ子構造を考慮する必要があるため, 通常のFlat-NERにおける手法では不十分なケースが多々あります. 
そのため, Nested NERタスクでは, 固有表現の入れ子構造を考慮した手法が多く提案されています.  

本記事では, 数多くあるNested NERに関する論文の中から1つピックアップして手法を紹介していきます. 

# 論文紹介

それでは, 今回紹介する論文について簡単にまとめていきます. 
本記事では, [arXivTimes](https://github.com/arXivTimes/arXivTimes)を参考に, 簡潔に論文をまとめることを心がけています.
手法の詳細が気になる方はぜひ論文も合わせて読んでみると良いでしょう. 

**タイトル**  
A Neural Layered Model for Nested Named Entity Recognition (Ju+,NAACL2018)

**著者**  
Meizhi Ju, Makoto Miwa, Sophia Ananiadou

**論文リンク**  
https://aclanthology.org/N18-1131/


※ 本記事の図の一部は紹介した論文より引用しています. 

## 一言でいうと

- NERで一般的に使われているBiLSTMとCRFからなる **flat-NER layer** を動的に重ねていくことで, ネスト構造の固有表現を抽出する手法を提案しています.
- 提案モデルでは, flat-NER layerを重ねてながら, テキスト中の固有表現を内側から外側に向かって段階的に判定しています.
- 実験結果では, Nested NERのベンチマークであるGENIAとACE2005において, SOTAを達成しました.


## 手法
本研究では, Flat NERタスクで一般的に広く用いられているBiLSTMとCRFを組み合わせたモデル（BiLSTM-CRF）を階層的に重ねることで異なるレイヤー（ネスト）の固有表現を段階的に抽出する手法を提案しています. (ちなみに提案モデルは, Layered-BiLSTM-CRFと名付けられています.)  
各層で固有表現が抽出されると, 新たなFlat NER layerが導入され, 次の階層で固有表現抽出が行われます.  

例えば, 入力テキスト `Mouse interleukin-2 receptor alpha gene expression` に対して, まずは1層目で `interleukin-2`が`Protein`であると判定されています. 次に2層目では, `interleukin-2 receptor alpha gene` に対して, `DNA`であることが判定されています. これらの結果からこの入力テキストには, `interleukin-2 receptor alpha gene`という固有表現が含まれていて, その中に `interleukin-2`という他の固有表現が含まれていることが分かります.  

以上のように, 提案モデルでは各階層の固有表現を内側から外側へFlat NER layerを動的に導入しながら判定していくことができます. 

また, 各階層で抽出された固有表現は, 結合および平均化され, 新たな表現ベクトルとして次の階層に渡されます.


## 結果
実験では, Nested NERのベンチマークとして用いられているGENIAとACEというデータセットを使用しています. 

実験結果によると, 提案モデルでは（当時の）SOTAモデルであるMuis and Lu (2017)を含めて, 関連研究との比較によると, 提案モデルでは最も高い精度を達成しています. 

提案モデルではGENIAよりもACE2005においてお大きく性能を改善することができています. この要因として, ACE2005の方がGENIAよりもネスト構造の固有表現の事例が多く, 提案モデルにより改善できた事例が多かったためであると論文では考察されています. （ACE2005は37.45%, GENIAには21.56%のnested entityが含まれているようです. ）  


加えて, 実験では, ネスト構造の固有表現の層ごとの抽出精度も評価しています. これらの結果によると, ネスト構造がより深くなるほど（上位の層になるほど）抽出精度が落ちていることが伺えます. これは, 正解の固有表現の事例数から分かるように, ネスト構造が深い固有表現の事例数が少ないことも要因の1つとして考えられます. 


## コメント
flat-NER layerを動的に重ねることでネスト構造の固有表現を段階的に抽出するというアイデアは面白かったです. しかし, 下位の層の予測を間違えてしまうと, 上位の層の予測性能に影響することが考えられるため, 段階的に予測するよりも全ての階層を同時に考慮しながら予測したほうが良さそうな気もしました. 

# おわりに

今回の記事では, Nested NERタスクの概要, および, 関連する論文を1つピックアップして紹介しました.  
今後も自分の勉強記録およびアウトプットの機会として, 論文紹介ができればと思います. 


# 参考文献
- [Wikipedia - 固有表現抽出](https://ja.wikipedia.org/wiki/%E5%9B%BA%E6%9C%89%E8%A1%A8%E7%8F%BE%E6%8A%BD%E5%87%BA)
- [実務で使う固有表現抽出 / Practical Use of Named Entity Recognition](https://speakerdeck.com/sansandsoc/practical-use-of-named-entity-recognition)
