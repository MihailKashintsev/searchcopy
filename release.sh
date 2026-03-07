#!/bin/bash
# ══════════════════════════════════════════
#  SearchCopy — RENDERGAMES
#  Использование: ./release.sh 1.2.0
# ══════════════════════════════════════════

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❌  Укажи версию: ./release.sh 1.2.0"
  exit 1
fi

echo ""
echo "🚀  SearchCopy — RENDERGAMES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  Версия: v$VERSION"
echo ""

# Обновить версию в package.json
echo "📝  Обновляю package.json..."
npm version $VERSION --no-git-tag-version

# Обновить версию в tauri.conf.json
echo "📝  Обновляю tauri.conf.json..."
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" src-tauri/tauri.conf.json

# Коммит
echo "💾  Коммит..."
git add package.json src-tauri/tauri.conf.json
git commit -m "chore: release v$VERSION"

# Тег
echo "🏷   Создаю тег v$VERSION..."
git tag -a "v$VERSION" -m "SearchCopy v$VERSION"

# Push
echo "⬆️   Пушу в GitHub..."
git push origin main
git push origin "v$VERSION"

echo ""
echo "✅  Готово! GitHub Actions собирает релиз."
echo "🔗  https://github.com/MihailKashintsev/searchcopy/releases"
echo ""