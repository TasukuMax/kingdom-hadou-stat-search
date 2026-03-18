# キングダム覇道 SSR ステータス検索

`index.html` を開くとローカルで使えます。

魅力は戦力計算の対象外として、検索・表示・順位判定から除外しています。

## 一時公開

1. `python start_public.py` を実行
2. 表示された `trycloudflare.com` の URL を共有
3. 停止するときは `python stop_public.py` を実行

この公開 URL は一時的なものです。PC を落とす、プロセスを止める、ネットワークが切れると無効になります。

## ファイル

- `index.html`: 画面
- `app.js`: 検索ロジック
- `data.js`: SSR 武将データ
