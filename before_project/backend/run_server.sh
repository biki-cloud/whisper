#!/bin/bash

# 仮想環境をアクティベート
source venv/bin/activate

# ポート8080が使用中かチェック
if lsof -i:8080 > /dev/null 2>&1; then
    echo "ポート8080は既に使用されています。プロセスを終了します..."
    lsof -ti:8080 | xargs kill -9
fi

# サーバーを起動
echo "Djangoサーバーを起動します..."
python manage.py runserver 8080 2>&1 | tee server.log

# エラーチェック
if [ ! -s server.log ]; then
    echo "エラー: サーバーログが空です。"
    exit 1
fi

# 最後の出力を確認
tail -n 1 server.log | grep -q "Quit the server with CONTROL-C"
if [ $? -ne 0 ]; then
    echo "エラー: サーバーが正常に起動していない可能性があります。"
    echo "ログの最後の数行:"
    tail -n 5 server.log
    exit 1
fi 