---
title: "Optunaを用いた文書分類モデルのハイパラ最適化"
date: "2021-09-19"
excerpt: "ニュース記事のカテゴリを分類する文書分類モデルのハイパラ最適化について解説します。BERTを使用し、ファインチューニング時のハイパラ最適化方法をOptunaを用いて実装します。"
tags: ["tool", "Optuna", "PyTorch", "BERT"]
---

# はじめに

より良い機械学習モデルの構築のために, Batch sizeやDropout率といったハイパーパラメータ（ハイパラ）の調整は大きな課題の1つです.   
**本記事では, ニュース記事のカテゴリを分類する文書分類モデルのハイパラ最適化について解説します.** 具体的には, モデルとして事前学習済みの[BERT](https://arxiv.org/abs/1810.04805)を使用し, ファインチューニング時のハイパラ最適化方法を扱います.  
ハイパラ最適化には, 機械学習モデルのハイパーパラメータ自動最適化フレームワークの1つである[Optuna](https://github.com/optuna/optuna)を使用します.   

# 実験環境


本記事の実験環境, ソースコードは下記のNotebookで公開しています. 
- [Optunaで文書分類モデルのハイパラチューニング (Google Colab Notebook) ](https://colab.research.google.com/drive/1ff97_tVm_pxLzCzjfnvwWgbPq5SgV4qs?usp=sharing)


# 参考記事

本記事で実装した文書分類モデルやOptunaを用いたハイパラ最適化のコードは下記の記事を参考にさせていただきました. 

- [【PyTorch】BERTを用いた日本語文書分類入門](https://qiita.com/yamaru/items/527ca7d814534beca56a)
- [Optunaでハイパーパラメータの自動チューニング -Pytorch Lightning編-](https://venoda.hatenablog.com/entry/2021/06/06/131004)
- [optuna/optuna-examples (github)](https://github.com/optuna/optuna-examples/blob/main/pytorch/pytorch_lightning_simple.py)
- [PyTorch Lightningによる多クラス分類の実装](https://cpp-learning.com/optuna-pytorch/)


# Livedoorニュースコーパスの取得

Livedoorニュースコーパスは「livedoorニュース」の下記9種類のニュース記事からなるコーパスです. 

- トピックニュース
- Sports Watch
- ITライフハック
- 家電チャンネル
- MOVIE ENTER
- 独女通信
- エスマックス
- livedoor HOMME
- Peachy

本記事では, Livedoorニュースコーパスを用いて、ある記事のニュースカテゴリ（上記9種類のうちいずれか）を分類する文書分類モデルを構築します.  
[こちらのサイト](https://www.rondhuit.com/download.html)で配布されているため, ダウンロードおよび前処理を行います. 


# 文書分類モデルの構築

今回は, PyTorchの軽量ラッパーである[PyTorch Lightning](https://www.pytorchlightning.ai/)を使って文書分類モデルを実装していきます.   
PyTorch Lightningを使うことで, PyTorchを用いたモデルの実装において煩雑になりがちなtrain/testループ等をシンプルに書くことができます.  

PyTorch Ligntningの詳細は[こちらの記事](https://qiita.com/ground0state/items/c1d705ca2ee329cdfae4)が参考になります. 

## モデル構築の流れ

PyTorch Lightningを使ったモデル構築の流れはおおまかに以下の3つです.   
LightningModuleとは, `torch.nn.Module`を拡張したようなクラスになっていて, モデルの定義だけでなく, lossの計算やoptimizerの定義などをまとめることができます. 

- データの読み込み
- Datasetの定義
- LightningModuleの定義

## データの読み込み

まずはさきほどダウンロード・前処理したlivedoorニュースコーパスをDataFrameに読み込みます.

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from tabulate import tabulate

# データの読込
df = pd.read_csv('./text/livedoor.tsv', sep='\t')

# データの分割
categories = ['dokujo-tsushin', 'it-life-hack', 'kaden-channel', 'livedoor-homme', 'movie-enter', 'peachy', 'smax', 'sports-watch', 'topic-news']
train, valid_test = train_test_split(df, test_size=0.2, shuffle=True, random_state=123, stratify=df[categories])
valid, test = train_test_split(valid_test, test_size=0.5, shuffle=True, random_state=123, stratify=valid_test[categories])
train.reset_index(drop=True, inplace=True)
valid.reset_index(drop=True, inplace=True)
test.reset_index(drop=True, inplace=True)
```



## Datasetの定義

学習・検証時に使用するデータセットを定義します.   
具体的には, PyTorchの `Dataset` クラスを継承させた `MyDataset` クラスを作ります.  
`__getitem__`には, indexを引数として, データを返す処理を記述します. 


また, 作成した `MyDataset` クラス内で テキストデータのトークンid化やPaddingといった前処理を行うことができます. 


```python
# Datasetの定義
class MyDataset(Dataset):
    def __init__(self, X, y, tokenizer, max_len):
        self.X = X
        self.y = y
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):  # len(Dataset)で返す値を指定
        return len(self.y)

    def __getitem__(self, index):  # Dataset[index]で返す値を指定
        text = self.X[index]
        inputs = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            pad_to_max_length=True
        )
        ids = inputs['input_ids']
        mask = inputs['attention_mask']

        return {
            'ids': torch.LongTensor(ids),
            'mask': torch.LongTensor(mask),
            'labels': torch.Tensor(self.y[index])
        }
```


## LightningModule(モデル)の定義

次に, LightningModule（モデル）を定義するために,  `pl.LightningModule` を継承したクラスを作成します. PyTorch Lightningでは, LightningModule内にネットワークやloss関数, optimizerを定義します.  
今回は, BERTを用いた文書分類モデルを作成するため,  `BERTClassifier` というクラス名のLightnignModuleを作成しました. 


```python
class BERTClassifier(pl.LightningModule):
    def __init__(self, pretrained, drop_rate, output_size, lr):
        super().__init__()
        self.bert = BertModel.from_pretrained(pretrained)
        self.drop = torch.nn.Dropout(drop_rate)
        self.fc = torch.nn.Linear(768, output_size)  # BERTの出力に合わせて768次元を指定
        self.lr = lr
        self.criterion = torch.nn.BCEWithLogitsLoss()

    def forward(self, ids, mask):
        outputs = self.bert(ids, attention_mask=mask, return_dict=True)
        out = self.fc(self.drop(outputs["last_hidden_state"][:, 0, :]))
        return out
        
    def training_step(self, batch, batch_idx):
        # ... 省略 ...
        
    def configure_optimizers(self):
        optimizer = torch.optim.Adam(self.parameters(), lr=self.lr)
        return optimizer
```

## モデルの学習/検証

これまで定義した `MyDataset` から`Dataloder`を作成し,  `BERTClassifier`の学習します.  
PyTorch Lightningでは, 下記のように `trainer` を作成し, `trainer.fit` で定義したモデルの学習・検証ループを実行することができます. 

```python
trainer = pl.Trainer(
    logger=True,
    max_epochs=epochs,
    checkpoint_callback=False,
    gpus=1,
)

trainer.fit(model, dataloader_train, dataloader_valid)
```

これで, 文書分類モデルの学習・検証ループまでを実装することができました.   
それでは, 次にこのモデルに対するハイパラ最適化を行います. 

# ハイパラ最適化

## ハイパラ最適化の流れ

さきほど作成したモデルの学習/検証のコードを参考に, Optunaによるハイパラ最適化を行います.  
Optunaでは主に下記2ステップによりハイパラ最適化を行います.  

まず, 目的関数の定義では, 最適化したいスコア（loss, 精度 等）を返す `objective` 関数を作成します.  
次に最適化の実行により, lossであれば最小化, 精度であれば最大化を行います. 　　

今回実装したコードでは, 検証データ（`valid`）に対する分類精度(`F1`)を最大化するようにハイパラ最適化を行います. 


- 目的関数（`objective`）の定義
- 最適化の実行

## 目的関数の定義

こちらが作成した目的関数（`objective`）です. 今回調整する対象のハイパーパラメータは, 学習率(`lr`)とドロップアウト確率（`drop_rate`）としました.   
Optunaでは, `trial.suggest_float`のように調整したいパラメータとその範囲を指定することができます.  


```python
def objective(trial):
    MAX_LEN = 128
    batch_size = 32
    epochs = 5

    # 学習率（lr）とドロップアウト確率（drop_rate）を最適化
    lr = trial.suggest_float("lr", 2e-5, 2e-4)
    drop_rate = trial.suggest_float("drop_rate", 0.1, 0.5)

    # ... モデルの作成と学習 ...

    return trainer.callback_metrics["val_f1"].item() # val_f1を（最適化）最大化する
```

## 最適化の実行

最後に定義した目的関数を用いて, Studyにより最適化（スコア最大化）を実行します.  
`optuna.create_study`を`direction="maximize"`とすることで, スコア最大化をすることができます.   


```python
pruner = optuna.pruners.MedianPruner()

study = optuna.create_study(direction="maximize", pruner=pruner)
study.optimize(objective, n_trials=10)

print("Number of finished trials: {}".format(len(study.trials)))

print("Best trial:")
trial = study.best_trial

print("  Value: {}".format(trial.value))

print("  Params: ")
for key, value in trial.params.items():
    print("    {}: {}".format(key, value))
```

ハイパラ最適化が完了すると下記のように結果を表示します.  
`Value`は, 試行回数10回のうち, 最もスコアが良かった検証データ（`valid`）に対する`F1`スコアを表しています. 

```bash
Number of finished trials: 10
Best trial:
  Value: 0.9065759778022766
  Params: 
    lr: 2.4313051844385965e-05
    drop_rate: 0.34326517678045065
```

# おわりに

ニュース記事のカテゴリを分類する文書分類モデルのハイパラ最適化について解説しました. 文書分類モデルとしてBERTを使用し, 分類タスクのファインチューニング時のハイパラ最適化を行いました.  

PyTorchやPytorch Lightningでモデルを実装する際には, はじめからOptunaの`objective`関数を意識してコーディングすることで比較的容易にハイパラ最適化の導入が実現できそうです.
