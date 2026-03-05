#!/bin/bash
# Run this from the iBay folder so login and sessions work.
# Then open: http://127.0.0.1:3000/frontend/html/index.html

cd "$(dirname "$0")"
echo "Starting PHP server at http://127.0.0.1:3000"
echo "Open: http://127.0.0.1:3000/frontend/html/index.html"
php -S 127.0.0.1:3000
