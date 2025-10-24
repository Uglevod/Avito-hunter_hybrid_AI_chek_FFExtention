# Решение проблемы CORS для LLM API

## Проблема
Ошибка: `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://192.168.0.116:1234/v1/chat/completions`

## Причина
Браузер блокирует запросы к серверу LLM API из-за политики CORS (Cross-Origin Resource Sharing).

## Решения

### 1. Настройка CORS на сервере LLM API (Рекомендуется)

Сервер LLM API должен добавить заголовки CORS для разрешения запросов от расширения браузера.

#### Для Python сервера (Flask/FastAPI):
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["*"])  # Разрешить все источники

# Или более безопасно - только для расширения:
CORS(app, origins=["chrome-extension://*", "moz-extension://*"])
```

#### Для Node.js сервера (Express):
```javascript
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: ['chrome-extension://*', 'moz-extension://*'],
  credentials: true
}));
```

#### Для других серверов:
Добавьте заголовки HTTP:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 2. Обновление manifest.json

Расширение уже обновлено для разрешения запросов к локальным серверам:
- `http://*/v1/*` - разрешает HTTP запросы к любому серверу на порту v1
- `http://192.168.0.116:1234/*` - разрешает запросы к конкретному серверу

### 3. Проверка настроек сервера

Убедитесь, что сервер LLM API:
1. Запущен и доступен по адресу `http://192.168.0.116:1234`
2. Имеет настроенные CORS заголовки
3. Принимает POST запросы на `/v1/chat/completions`

### 4. Тестирование подключения

Для проверки работы API можно использовать curl:
```bash
curl -X POST http://192.168.0.116:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "test"}]
  }'
```

### 5. Альтернативные решения

#### Использование HTTPS
Если возможно, используйте HTTPS вместо HTTP для сервера LLM API.

#### Прокси-сервер
Можно настроить прокси-сервер с правильными CORS заголовками.

#### Локальный сервер с CORS
Запустите LLM API сервер с настроенными CORS заголовками.

## Проверка решения

После настройки CORS на сервере:
1. Перезагрузите расширение в браузере
2. Проверьте консоль браузера на наличие ошибок
3. Протестируйте анализ объявления через LLM

## Логирование

Расширение теперь логирует CORS ошибки для отладки:
- Проверяет тип ошибки
- Выводит понятное сообщение о проблеме
- Предлагает решение

## Контакты

Если проблема не решается, проверьте:
1. Настройки CORS на сервере LLM API
2. Доступность сервера по указанному адресу
3. Правильность URL в настройках расширения
