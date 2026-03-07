#!/bin/bash
# ══════════════════════════════════════════
#  SearchCopy — RENDERGAMES
#  Использование: ./release.sh 1.2.0 "Что добавилось"
# ══════════════════════════════════════════

set -e

VERSION=$1
CHANGELOG=$2

if [ -z "$VERSION" ]; then
  echo "❌  Укажи версию: ./release.sh 1.2.0 \"Что нового\""
  exit 1
fi

if [ -z "$CHANGELOG" ]; then
  echo "❌  Укажи что изменилось: ./release.sh 1.2.0 \"Что нового\""
  exit 1
fi

echo ""
echo "🚀  SearchCopy — RENDERGAMES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  Версия:  v$VERSION"
echo "📝  Что нового: $CHANGELOG"
echo ""

# Обновить версию в package.json
echo "📝  Обновляю package.json..."
npm version $VERSION --no-git-tag-version

# Обновить версию в tauri.conf.json
echo "📝  Обновляю tauri.conf.json..."
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" src-tauri/tauri.conf.json

# Сохранить changelog во временный файл (его прочитает GitHub Actions)
echo "$CHANGELOG" > .changelog

# Коммит
echo "💾  Коммит..."
git add package.json src-tauri/tauri.conf.json .changelog
git commit -m "chore: release v$VERSION"

# Тег с changelog в сообщении
echo "🏷   Создаю тег v$VERSION..."
git tag -a "v$VERSION" -m "$CHANGELOG"

# Push
echo "⬆️   Пушу в GitHub..."
git push origin main
git push origin "v$VERSION"

echo ""
echo "✅  Готово! GitHub Actions собирает релиз."
echo "🔗  https://github.com/MihailKashintsev/searchcopy/releases"
echo ""