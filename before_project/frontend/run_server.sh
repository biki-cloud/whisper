#!/bin/bash

# ポート5174が使用中かチェック
if lsof -i:5174 > /dev/null 2>&1; then
    echo "ポート5174は既に使用されています。プロセスを終了します..."
    lsof -ti:5174 | xargs kill -9
fi

# サーバーを起動
echo "Viteサーバーを起動します..."
npm run dev -- --port 5174 2>&1 | tee server.log

# エラーチェック
if [ ! -s server.log ]; then
    echo "エラー: サーバーログが空です。"
    exit 1
fi

# エラーの有無を確認
if grep -i "error" server.log > /dev/null; then
    echo "エラーが検出されました:"
    grep -i "error" server.log
    exit 1
fi 