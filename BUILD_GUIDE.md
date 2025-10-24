# Руководство по сборке Avito Hunter LLM расширения

## 📋 Требования

### Обязательные:
- **Linux, macOS или Windows (Git Bash / WSL)**
- **zip утилита** (обычно установлена по умолчанию)

### Опциональные:
- **jq** - для проверки валидности JSON (рекомендуется)

## 🔧 Установка зависимостей

### Ubuntu/Debian:
```bash
sudo apt-get install zip
sudo apt-get install jq  # опционально
```

### macOS (Homebrew):
```bash
brew install zip
brew install jq  # опционально
```

### Windows (через Git Bash):
```bash
# zip обычно уже установлен в Git Bash
# Для jq:
choco install jq  # если установлен Chocolatey
```

## 🚀 Использование

### Основное использование:

```bash
# Перейти в папку расширения
cd /path/to/Avito_Hunter_LT_LLM

# Дать скрипту права на выполнение
chmod +x build.sh

# Запустить сборку
./build.sh
```

### С пользовательским названием:

```bash
./build.sh Avito_Hunter_Custom
# Создаст файл: Avito_Hunter_Custom.xpi
```

## 📊 Процесс сборки

Скрипт выполняет следующие шаги:

```
[1/5] Проверка необходимых файлов...
  ✓ Проверяет наличие всех 9 обязательных файлов
  
[2/5] Проверка валидности manifest.json...
  ✓ Проверяет корректность JSON (если установлен jq)
  
[3/5] Подготовка к сборке...
  ✓ Удаляет старый .xpi файл если существует
  ✓ Создает временную директорию
  
[4/5] Копирование файлов...
  ✓ Копирует все необходимые файлы в временную папку
  
[5/5] Создание .xpi архива...
  ✓ Создает ZIP архив и переименовывает в .xpi
  ✓ Удаляет временную директорию
```

## 📦 Необходимые файлы

Скрипт проверяет наличие следующих файлов:

```
✓ manifest.json       - манифест расширения
✓ background.js       - фоновый скрипт
✓ content.js          - скрипт парсинга Avito
✓ popup.html          - интерфейс
✓ popup.js            - логика интерфейса
✓ sysPrompt           - системный промпт для LLM
✓ icon16.png          - иконка 16x16
✓ icon48.png          - иконка 48x48
✓ icon128.png         - иконка 128x128
```

Если какой-либо файл отсутствует, сборка будет остановлена.

## 🎨 Цветной вывод

Скрипт использует цвета для удобства:

```
🔵 СИНИЙ    - заголовки и информация
🟢 ЗЕЛЁНЫЙ  - успешные операции (✓)
🟡 ЖЁЛТЫЙ   - шаги процесса
🔴 КРАСНЫЙ  - ошибки (✗)
```

## ✅ Примеры выполнения

### Успешная сборка:

```
╔════════════════════════════════════════════════════╗
║   Firefox Extension Builder - Avito Hunter LLM    ║
╚════════════════════════════════════════════════════╝

[1/5] Проверка необходимых файлов...
✓ manifest.json
✓ background.js
✓ content.js
✓ popup.html
✓ popup.js
✓ sysPrompt
✓ icon16.png
✓ icon48.png
✓ icon128.png

✓ Все необходимые файлы найдены

[2/5] Проверка валидности manifest.json...
✓ manifest.json валиден

[3/5] Подготовка к сборке...
✓ Временная директория создана

[4/5] Копирование файлов...
✓ Скопирован: manifest.json
✓ Скопирован: background.js
✓ Скопирован: content.js
✓ Скопирован: popup.html
✓ Скопирован: popup.js
✓ Скопирован: sysPrompt
✓ Скопирован: icon16.png
✓ Скопирован: icon48.png
✓ Скопирован: icon128.png

[5/5] Создание .xpi архива...
✓ .xpi архив создан успешно

╔════════════════════════════════════════════════════╗
║               СБОРКА ЗАВЕРШЕНА                     ║
╚════════════════════════════════════════════════════╝

📦 Файл: Avito_Hunter_LLM.xpi
📊 Размер: 18.9K
📍 Путь: /home/user/Avito_Hunter_LT_LLM/Avito_Hunter_LLM.xpi

🚀 Для установки:
  1. Откройте Firefox
  2. Перейдите в about:addons
  3. Нажмите на шестеренку → Установить дополнение из файла
  4. Выберите Avito_Hunter_LLM.xpi
```

## 🔧 Решение проблем

### Проблема: `Permission denied`

**Решение:**
```bash
chmod +x build.sh
./build.sh
```

### Проблема: `zip: command not found`

**Решение:**
```bash
# Ubuntu/Debian
sudo apt-get install zip

# macOS
brew install zip

# Windows - используйте 7-Zip или встроенный архиватор
```

### Проблема: `manifest.json содержит ошибки JSON`

**Решение:**
1. Откройте `manifest.json`
2. Проверьте синтаксис JSON
3. Убедитесь, что все скобки и кавычки правильные
4. Используйте онлайн-валидатор: https://jsonlint.com/

### Проблема: Отсутствуют необходимые файлы

**Решение:**
1. Убедитесь, что вы в правильной директории
2. Проверьте наличие всех файлов:
```bash
ls -la manifest.json background.js content.js popup.html popup.js sysPrompt icon*.png
```

## 📝 Примеры использования

### Пример 1: Стандартная сборка

```bash
cd ~/Avito_Hunter_LT_LLM
chmod +x build.sh
./build.sh
```

Создаст: `Avito_Hunter_LLM.xpi`

### Пример 2: Сборка с версией

```bash
./build.sh Avito_Hunter_v1.2.3
```

Создаст: `Avito_Hunter_v1.2.3.xpi`

### Пример 3: Сборка для разных брендов

```bash
./build.sh MyExtension_LLM
./build.sh CustomName_Firefox
```

## 🔄 Автоматизация

### Создание алиаса (Linux/macOS):

```bash
# Добавить в ~/.bashrc или ~/.zshrc
alias build-avito='cd ~/Avito_Hunter_LT_LLM && ./build.sh'

# Затем используйте:
build-avito
build-avito MyCustomName
```

### Создание Makefile:

```makefile
.PHONY: build clean

build:
	./build.sh

build-custom:
	./build.sh $(NAME)

clean:
	rm -f *.xpi

help:
	@echo "Available targets:"
	@echo "  make build              - Build default .xpi"
	@echo "  make build-custom NAME= - Build with custom name"
	@echo "  make clean              - Remove .xpi files"
```

Использование:
```bash
make build
make build-custom NAME=MyExtension
```

## 📦 Результат

После успешной сборки:
- Создается файл `.xpi`
- Выводится информация о размере
- Показывается инструкция по установке
- Временные файлы автоматически удаляются

## 🚀 Следующие шаги

1. **Установить расширение:**
   - Откройте Firefox
   - Перейдите в `about:addons`
   - Нажмите шестеренку → "Установить дополнение из файла"
   - Выберите созданный `.xpi` файл

2. **Поделиться расширением:**
   - Загрузите `.xpi` на свой сайт
   - Отправьте пользователям
   - Опубликуйте на addons.mozilla.org

3. **Обновление версии:**
   - Измените версию в `manifest.json`
   - Запустите `./build.sh` снова
   - Создаст новый `.xpi` файл
