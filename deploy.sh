#!/usr/bin/env bash
set -x
set -Eeuo pipefail
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
alembic upgrade head
npm ci
npm run build
pkill gunicorn || true
gunicorn --daemon --workers=1 --worker-class=gevent --bind=0.0.0.0:20684 'app:create_app()'
