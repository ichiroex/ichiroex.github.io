---
title: "displaCyで固有表現抽出の結果を可視化する"
date: "2021-06-22"
excerpt: "この記事では、固有表現抽出の結果を可視化する方法を紹介します。spaCyで利用可能なdisplaCyを利用し、GiNZAで固有表現抽出した結果の可視化方法と、自作の固有表現抽出器の結果を可視化する方法を紹介します。"
tags: ["tool", "spacy", "NER"]
---

## はじめに

この記事では、固有表現抽出の結果を可視化する方法を紹介します。
可視化のためのライブラリとして、spaCyで利用可能な[displaCy](https://explosion.ai/demos/displacy)を利用します

本記事は基本編と応用編の二構成となっています。
基本編では、spaCy上で動作する日本語自然言語処理のライブラリ「[GiNZA](https://github.com/megagonlabs/ginza)」で固有表現抽出した結果を可視化する方法を紹介します。  
応用編として、自作の固有表現抽出器の結果をdisplayCyで可視化する方法を紹介します。

## 環境

最近ではちょっとした実験はGoogle Colaboratoryを使っています。  
環境をすぐに立ち上げることができて便利ですね。  

本記事でもGoogle Colaboratory上での作業を例に紹介していきます。  
作成したNotebookは[こちら](https://colab.research.google.com/drive/1d67Hd4hB0TnIBT_5WrHMiCvSD8F55Gi8?usp=sharing)に公開しました。

まずは、`pip`で今回使用するginzaをインストールします。  
※spaCyも依存ライブラリとしてインストールされます。

```bash
!pip install -U ginza
```

インストール後は、下記のようにパッケージをリロードしましょう。
これをしないとインストールしたもモデルを読むことができず、ランタイムの再起動が必要になります。

```python
import pkg_resources, imp
imp.reload(pkg_resources)
```


## ginzaによる固有表現抽出

インストール後、モデルを読み込みます。
```python
import spacy

nlp = spacy.load('ja_ginza')
```

### 動作確認
例文「銀座線渋谷駅から銀座に向かう.」を銀座で解析してみます。

```python
doc = nlp("銀座線渋谷駅から銀座に向かう.")

for sent in doc.sents:
    for token in sent:
        print(token.i, token.orth_, token.lemma_, token.pos_, token.tag_, token.dep_, token.head.i)
```

このような結果が得られればOKです。
```txt
0 銀座 銀座 PROPN 名詞-固有名詞-地名-一般 compound 2
1 線 線 NOUN 名詞-普通名詞-一般 compound 2
2 渋谷駅 渋谷駅 PROPN 名詞-固有名詞-一般 obl 6
3 から から ADP 助詞-格助詞 case 2
4 銀座 銀座 PROPN 名詞-固有名詞-地名-一般 obl 6
5 に に ADP 助詞-格助詞 case 4
6 向かう 向かう VERB 動詞-一般 ROOT 6
7 . . PUNCT 補助記号-句点 punct 6
```

## 【基本編】 ginzaによる固有表現抽出の結果をdisplayCyで可視化

では早速displaCyで固有表現を可視化します。 
コードはかなりシンプルです。

ginzaの解析結果（`doc`）を`displacy.render`に渡すだけでOKです。  
`jupyter`オプションを`True`にすることで、Notebook上でそのまま結果を確認できます。

```python
from spacy import displacy

doc = nlp("銀座線渋谷駅から銀座に向かう")
displacy.render(doc, style="ent", jupyter=True)
```


**Tips: 固有表現ラベルや色のカスタムも可能**  

displaCyでは、固有表現の各ラベルごとに色を設定することもできます。  
ラベルごとに色を設定して、視覚的に分かりやすくしてみましょう。

```python
# 各ラベルに任意の色を設定する
colors = {}
colors["RAILROAD"] = "lightpink"
colors["STATION"] = "lavender"
colors["CITY"] = "mediumaquamarine"
options = {"colors": colors}

doc = nlp("銀座線渋谷駅から銀座に向かう")
displacy.render(doc, style="ent", jupyter=True, options=options) # 色オプションを設定
```


## 【応用編】 自作の固有表現抽出器の結果をdisplayCyで可視化

基本編では、ginza (spaCy)による固有表現抽出の結果をdisplaCyで可視化する方法を紹介しましたが、
その他のライブラリによる固有表現抽出の結果もdisplaCyで可視化することができます。

ここでは、自作の固有表現抽出器の結果をdisplayCyで可視化する方法を紹介します。  
自作の固有表現抽出器のモデルは何でも良いのですが、先ほどと同じ例文「**銀座線渋谷駅から銀座に向かう**」に対する固有表現抽出の結果が下記となることを想定します。  

```python
ents = [
    {"start": 0, "end": 3, "label": "路線名"}, # 銀座線
    {"start": 3, "end": 6, "label": "駅名"},  # 渋谷駅
    {"start": 8, "end": 10, "label": "地名"},  # 銀座
]
```

ここで、`start`, `end`は固有表現の開始・終了位置（文字単位）で、`label`はその固有表現のラベル名称を表しています。
下記の例では、例文中の「銀座線」、「渋谷駅」、「銀座」がそれぞれ、「路線名」、「駅名」、「地名」というラベルの固有表現として認識されたことを意味します。  


固有表現抽出の結果は、下記のように`displacy.render`で可視化することができます。
この時、`manual`オプションを`True`にして下さい。


```python
# 日本語のラベル名称も設定可能です。
colors = {}
colors["路線名"] = "lightpink"
colors["駅名"] = "lavender"
colors["地名"] = "mediumaquamarine"
options = {"colors": colors}

ex = [{
    "text": "銀座線渋谷駅から銀座に向かう",
    "ents": ents # 固有表現抽出の結果
}]
displacy.render(ex, style="ent", manual=True, jupyter=True, options=options)
```

このように、自作の固有表現抽出器の結果もdisplaCyで可視化することができました。  
今回の例では、ラベル名を日本語にしてみましたが、色の設定や表示もうまくできています。  


## おわりに

今回の記事では、spaCyの可視化ライブラリであるdisplaCyを使って固有表現抽出の結果を色付けして可視化する方法を紹介しました。  
spaCyの固有表現抽出器を使えば数行で結果を可視化することができます。  
また、自作の固有表現抽出器による抽出結果もdisplaCyで簡単に可視化することができました。  

このような可視化ツールを活用することで、固有表現抽出器の結果が見えやすくなり、分析も捗ることでしょう。  
実験結果をプレゼンしたり、論文を書く際にも分かりやすく結果を示すことができるため大いに役に立ちそうです。

## 参考ページ
- [GiNZAを使って固有表現のマスキングをやってみる](https://www.nogawanogawa.com/entry/ginzaa)
- https://notebook.community/rishuatgithub/MLPy/nlp/UPDATED_NLP_COURSE/02-Parts-of-Speech-Tagging/03-Visualizing-NER
