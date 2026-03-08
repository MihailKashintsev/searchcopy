#!/bin/bash
# ══════════════════════════════════════════
#  SearchCopy — RENDERGAMES
#  Использование: ./release.sh 1.2.0 "Что добавилось"
# ══════════════════════════════════════════

set -e

VERSION=$1
CHANGELOG=$2

if [ -z "$VERSION" ]; then
  echo "Укажи версию: ./release.sh 1.2.0 \"Что нового\""
  exit 1
fi

if [ -z "$CHANGELOG" ]; then
  echo "Укажи что изменилось: ./release.sh 1.2.0 \"Что нового\""
  exit 1
fi

echo ""
echo "SearchCopy — RENDERGAMES"
echo "Версия:    v$VERSION"
echo "Что нового: $CHANGELOG"
echo ""

echo "Обновляю package.json..."
npm version $VERSION --no-git-tag-version

echo "Обновляю tauri.conf.json..."
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" src-tauri/tauri.conf.json

echo "Обновляю ui/index.html..."
sed -i '' "s/const VERSION = \".*\"/const VERSION = \"$VERSION\"/" ui/index.html

echo "Обновляю Cargo.toml..."
sed -i '' "s/^version = \".*\"/version = \"$VERSION\"/" src-tauri/Cargo.toml

echo "$CHANGELOG" > .changelog

echo "Коммит..."
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml ui/index.html .changelog
git commit -m "chore: release v$VERSION"

echo "Создаю тег v$VERSION..."
git tag -a "v$VERSION" -m "$CHANGELOG"

echo "Пушу в GitHub..."
git push origin main
git push origin "v$VERSION"

echo ""
echo "Готово! https://github.com/MihailKashintsev/searchcopy/releases"
echo ""
