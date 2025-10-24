#!/bin/bash

# Скрипт для сборки Firefox расширения Avito Hunter LLM в .xpi файл
# Использование: ./build.sh [output_name]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры
EXTENSION_NAME="Avito_Hunter_LLM"
OUTPUT_NAME="${1:-$EXTENSION_NAME}"
XPI_FILE="${OUTPUT_NAME}.xpi"
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${CURRENT_DIR}/build"

# Необходимые файлы
REQUIRED_FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "popup.html"
    "popup.js"
    "sysPrompt"
    "icon16.png"
    "icon48.png"
    "icon128.png"
)

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Firefox Extension Builder - Avito Hunter LLM    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Проверка необходимых файлов
echo -e "${YELLOW}[1/5]${NC} Проверка необходимых файлов..."
echo ""

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$CURRENT_DIR/$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (ОТСУТСТВУЕТ)"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Ошибка: Отсутствуют необходимые файлы:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "${RED}  - $file${NC}"
    done
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Все необходимые файлы найдены${NC}"
echo ""

# 2. Проверка валидности manifest.json
echo -e "${YELLOW}[2/5]${NC} Проверка валидности manifest.json..."
if command -v jq &> /dev/null; then
    if jq empty "$CURRENT_DIR/manifest.json" 2>/dev/null; then
        echo -e "${GREEN}✓ manifest.json валиден${NC}"
    else
        echo -e "${RED}✗ manifest.json содержит ошибки JSON${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ jq не установлен, пропуск проверки JSON${NC}"
fi
echo ""

# 3. Удаление старого файла .xpi если существует
echo -e "${YELLOW}[3/5]${NC} Подготовка к сборке..."
if [ -f "$CURRENT_DIR/$XPI_FILE" ]; then
    echo -e "${YELLOW}  Удаление старого файла: $XPI_FILE${NC}"
    rm -f "$CURRENT_DIR/$XPI_FILE"
fi

# Создание временной директории для сборки
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
fi
mkdir -p "$BUILD_DIR"
echo -e "${GREEN}✓ Временная директория создана${NC}"
echo ""

# 4. Копирование файлов в временную директорию
echo -e "${YELLOW}[4/5]${NC} Копирование файлов..."
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$CURRENT_DIR/$file" ]; then
        cp "$CURRENT_DIR/$file" "$BUILD_DIR/"
        echo -e "${GREEN}✓${NC} Скопирован: $file"
    fi
done
echo ""

# 5. Создание .xpi архива
echo -e "${YELLOW}[5/5]${NC} Создание .xpi архива..."
cd "$BUILD_DIR"

if command -v zip &> /dev/null; then
    zip -r -q "$CURRENT_DIR/$XPI_FILE" .
    ZIP_SUCCESS=$?
else
    echo -e "${RED}✗ Утилита 'zip' не установлена${NC}"
    exit 1
fi

cd "$CURRENT_DIR"

# Очистка временной директории
rm -rf "$BUILD_DIR"

if [ $ZIP_SUCCESS -eq 0 ]; then
    FILE_SIZE=$(du -h "$XPI_FILE" | cut -f1)
    echo -e "${GREEN}✓ .xpi архив создан успешно${NC}"
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║               СБОРКА ЗАВЕРШЕНА                     ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "📦 Файл: ${GREEN}$XPI_FILE${NC}"
    echo -e "📊 Размер: ${GREEN}$FILE_SIZE${NC}"
    echo -e "📍 Путь: ${GREEN}$CURRENT_DIR/$XPI_FILE${NC}"
    echo ""
    echo -e "🚀 Для установки:"
    echo -e "  1. Откройте Firefox"
    echo -e "  2. Перейдите в ${YELLOW}about:addons${NC}"
    echo -e "  3. Нажмите на шестеренку → ${YELLOW}Установить дополнение из файла${NC}"
    echo -e "  4. Выберите ${GREEN}$XPI_FILE${NC}"
    echo ""
else
    echo -e "${RED}✗ Ошибка при создании архива${NC}"
    exit 1
fi
