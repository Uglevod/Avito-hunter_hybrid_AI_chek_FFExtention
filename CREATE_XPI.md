# Создание .xpi файла для Firefox расширения

## 📦 Что такое .xpi файл

.xpi (eXtension Package Installer) - это формат архива для расширений Firefox. По сути это обычный ZIP файл с расширением .xpi.

## 🔧 Способы создания .xpi файла

### Способ 1: Через командную строку (Linux/macOS)

```bash
# Перейти в папку с расширением
cd /path/to/Avito_Hunter_LT_LLM

# Создать .xpi файл
zip -r Avito_Hunter_LLM.xpi manifest.json background.js content.js popup.html popup.js sysPrompt icon16.png icon48.png icon128.png
```

### Способ 2: Через командную строку (Windows)

```cmd
# Перейти в папку с расширением
cd C:\path\to\Avito_Hunter_LT_LLM

# Создать .xpi файл
powershell Compress-Archive -Path manifest.json,background.js,content.js,popup.html,popup.js,sysPrompt,icon16.png,icon48.png,icon128.png -DestinationPath Avito_Hunter_LLM.xpi
```

### Способ 3: Через графический интерфейс

1. **Выберите все файлы расширения:**
   - manifest.json
   - background.js
   - content.js
   - popup.html
   - popup.js
   - sysPrompt
   - icon16.png
   - icon48.png
   - icon128.png

2. **Создайте ZIP архив:**
   - Правой кнопкой → "Создать архив" или "Add to archive"
   - Назовите файл `Avito_Hunter_LLM.zip`

3. **Переименуйте в .xpi:**
   - Переименуйте `Avito_Hunter_LLM.zip` в `Avito_Hunter_LLM.xpi`

## 📋 Необходимые файлы для .xpi

### Обязательные файлы:
- ✅ `manifest.json` - манифест расширения
- ✅ `background.js` - фоновый скрипт
- ✅ `content.js` - скрипт для парсинга
- ✅ `popup.html` - интерфейс
- ✅ `popup.js` - логика интерфейса
- ✅ `icon16.png` - иконка 16x16
- ✅ `icon48.png` - иконка 48x48
- ✅ `icon128.png` - иконка 128x128

### Дополнительные файлы:
- ✅ `sysPrompt` - системный промпт для LLM
- 📄 `README.md` - документация (опционально)
- 📄 `*.md` - другие документы (опционально)

## 🚀 Установка .xpi файла

### В Firefox:
1. Откройте Firefox
2. Перейдите в `about:addons`
3. Нажмите на шестеренку → "Установить дополнение из файла"
4. Выберите созданный .xpi файл
5. Подтвердите установку

### Альтернативный способ:
1. Перетащите .xpi файл в окно Firefox
2. Подтвердите установку

## 🔍 Проверка .xpi файла

### Проверить содержимое:
```bash
# Посмотреть содержимое .xpi
unzip -l Avito_Hunter_LLM.xpi

# Распаковать для проверки
unzip Avito_Hunter_LLM.xpi -d test_extraction
```

### Проверить структуру:
```
Avito_Hunter_LLM.xpi
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── sysPrompt
├── icon16.png
├── icon48.png
└── icon128.png
```

## ⚠️ Важные моменты

### 1. Не включайте лишние файлы:
- ❌ Не включайте папки с документацией
- ❌ Не включайте временные файлы
- ❌ Не включайте файлы .git

### 2. Проверьте манифест:
- ✅ Убедитесь, что manifest.json корректен
- ✅ Проверьте версию и название
- ✅ Убедитесь, что все пути к файлам правильные

### 3. Тестирование:
- ✅ Установите .xpi файл в Firefox
- ✅ Проверьте работу всех функций
- ✅ Убедитесь, что нет ошибок в консоли

## 📤 Публикация

### Для Firefox Add-ons:
1. Зайдите на [addons.mozilla.org](https://addons.mozilla.org)
2. Нажмите "Submit a New Add-on"
3. Загрузите .xpi файл
4. Заполните описание и скриншоты
5. Отправьте на проверку

### Для локального распространения:
1. Создайте .xpi файл
2. Поделитесь файлом с пользователями
3. Пользователи могут установить через "Установить дополнение из файла"

## 🛠️ Автоматизация

### Скрипт для автоматического создания:
```bash
#!/bin/bash
# create_xpi.sh

# Очистка предыдущих версий
rm -f Avito_Hunter_LLM.xpi

# Создание .xpi
zip -r Avito_Hunter_LLM.xpi \
    manifest.json \
    background.js \
    content.js \
    popup.html \
    popup.js \
    sysPrompt \
    icon16.png \
    icon48.png \
    icon128.png

echo "✅ .xpi файл создан: Avito_Hunter_LLM.xpi"
```

### Запуск скрипта:
```bash
chmod +x create_xpi.sh
./create_xpi.sh
```

## 📊 Размер файла

Типичный размер .xpi файла для Avito Hunter LLM:
- **Без изображений**: ~50-100 KB
- **С иконками**: ~100-200 KB
- **С документацией**: ~200-500 KB

## ✅ Готово!

После создания .xpi файла вы можете:
1. **Установить локально** для тестирования
2. **Поделиться с пользователями** для установки
3. **Загрузить на addons.mozilla.org** для публикации
4. **Распространять через свой сайт**
