# 🏗️ Сборка Avito Hunter LLM расширения

## 📚 Содержание

1. [Быстрый старт](#быстрый-старт)
2. [С помощью build.sh](#с-помощью-buildsh)
3. [С помощью Makefile](#с-помощью-makefile)
4. [Тестирование](#тестирование)

## 🚀 Быстрый старт

### Вариант 1: build.sh (простой способ)

```bash
cd ~/Avito_Hunter_LT_LLM
chmod +x build.sh
./build.sh
```

**Результат**: `Avito_Hunter_LLM.xpi`

### Вариант 2: Makefile (удобный способ)

```bash
cd ~/Avito_Hunter_LT_LLM
make build
```

**Результат**: `Avito_Hunter_LLM.xpi`

## 🛠️ С помощью build.sh

### Установка

```bash
chmod +x build.sh
```

### Использование

#### Стандартная сборка

```bash
./build.sh
```

Создает: `Avito_Hunter_LLM.xpi`

#### Сборка с пользовательским названием

```bash
./build.sh MyExtension
```

Создает: `MyExtension.xpi`

#### Сборка версии

```bash
./build.sh Avito_Hunter_v1.2.3
```

Создает: `Avito_Hunter_v1.2.3.xpi`

### Процесс

```
[1/5] Проверка необходимых файлов...     ✓ 9 файлов
[2/5] Проверка валидности manifest.json   ✓ Валиден
[3/5] Подготовка к сборке...              ✓ Готово
[4/5] Копирование файлов...               ✓ 9 файлов скопировано
[5/5] Создание .xpi архива...             ✓ Создано
```

## 🔨 С помощью Makefile

### Основные команды

```bash
# Показать справку
make help

# Стандартная сборка
make build

# Сборка dev версии
make build-dev

# Сборка с пользовательским названием
make build-custom NAME=MyExtension_v1.0

# Очистить все .xpi файлы
make clean

# Проверить наличие файлов
make check

# Показать информацию о файле
make info

# Список всех .xpi файлов
make list
```

### Примеры

```bash
# Создать основной файл
make build
# → Avito_Hunter_LLM.xpi

# Создать dev версию
make build-dev
# → Avito_Hunter_LLM_dev.xpi

# Создать с версией
make build-custom NAME=Avito_Hunter_v2.0.0
# → Avito_Hunter_v2.0.0.xpi

# Просмотреть информацию
make info
# → Информация о файле и его содержимое

# Очистить
make clean
# → Удалены все .xpi файлы
```

## ✅ Тестирование

### Проверить содержимое .xpi

```bash
# Список файлов в архиве
unzip -l Avito_Hunter_LLM.xpi

# Информация через make
make info
```

### Ожидаемое содержимое

```
manifest.json          (955 bytes)
background.js          (27 KB)
content.js             (10 KB)
popup.html             (9 KB)
popup.js               (16 KB)
sysPrompt              (813 bytes)
icon16.png             (182 bytes)
icon48.png             (388 bytes)
icon128.png            (1 KB)
```

### Общий размер

```
19 KB - стандартный размер .xpi файла
```

## 🔧 Решение проблем

### Проблема: Permission denied

```bash
chmod +x build.sh
./build.sh
```

### Проблема: zip: command not found

**Linux:**
```bash
sudo apt-get install zip
```

**macOS:**
```bash
brew install zip
```

### Проблема: make: command not found

**Linux:**
```bash
sudo apt-get install make
```

**macOS:**
```bash
brew install make
```

## 📋 Требования

### Обязательные

- ✅ Linux, macOS или Windows (Git Bash / WSL)
- ✅ Утилита `zip`
- ✅ Скрипт `build.sh` (для bash)
- ✅ `Makefile` (для make команд)

### Опциональные

- ⚠️ `jq` - для проверки JSON (рекомендуется)
- ⚠️ `make` - для использования Makefile

## 📦 Результаты

После успешной сборки:

1. **Создается .xpi файл**
   ```
   Avito_Hunter_LLM.xpi (19K)
   ```

2. **Выводится информация**
   ```
   📦 Файл: Avito_Hunter_LLM.xpi
   📊 Размер: 19K
   📍 Путь: /home/user/Avito_Hunter_LT_LLM/Avito_Hunter_LLM.xpi
   ```

3. **Удаляются временные файлы**
   ```
   Директория build/ - удалена
   ```

## 🚀 Установка в Firefox

После сборки:

1. Откройте Firefox
2. Перейдите в `about:addons`
3. Нажмите шестеренку → "Установить дополнение из файла"
4. Выберите созданный `.xpi` файл
5. Подтвердите установку

## 📚 Подробнее

- 📖 `BUILD_GUIDE.md` - подробное руководство по build.sh
- 🚀 `QUICK_START.md` - быстрый старт
- 📋 `README.md` - основная документация
