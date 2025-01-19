#!/bin/bash

# 現在のディレクトリに移動
cd "$(dirname "$0")"

# Pythonスクリプトを実行してJSONを生成
python generate_initial_posts.py

# データベースにfixtureを読み込む
cd ../..
python manage.py loaddata posts/fixtures/initial_posts.json 