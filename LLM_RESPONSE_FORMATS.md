# Поддержка различных форматов ответов LLM API

## Обзор

Расширение теперь поддерживает различные форматы ответов от LLM API, так как разные провайдеры возвращают ответы в разных структурах.

## Поддерживаемые форматы ответов

### 1. Стандартный OpenAI формат

Самый распространенный формат:

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "{\"good\": true}"
      }
    }
  ]
}
```

**Путь к тексту**: `data.choices[0].message.content`

### 2. Формат с reasoning полем

Для моделей, которые возвращают ответ в reasoning:

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "",
        "reasoning": "{\"good\": false}"
      }
    }
  ]
}
```

**Путь к тексту**: `data.choices[0].message.reasoning`

### 3. Формат с reasoning_details

Для некоторых расширенных моделей (например, Z.AI GLM-4.5):

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "",
        "reasoning_details": [
          {
            "type": "reasoning.text",
            "text": "{\"good\": false}",
            "format": "unknown",
            "index": 0
          }
        ]
      }
    }
  ]
}
```

**Путь к тексту**: `data.choices[0].message.reasoning_details[0].text`

## Логика обработки

Функция анализа проверяет поля в следующем порядке:

1. **Сначала** проверяет `message.content`
2. **Затем** проверяет `message.reasoning` (если content пустой)
3. **Потом** проверяет `message.reasoning_details[].text` (если reasoning пустой)
4. **Если ничего не найдено** - возвращает ошибку

## Примеры использования

### OpenAI API
Ответ содержит `content` → автоматически обнаружится

### Локальный LM Studio
Ответ может содержать `reasoning` → автоматически обнаружится

### Z.AI GLM-4.5
Ответ содержит `reasoning_details` → автоматически обнаружится

## Совместимость

Теперь расширение совместимо со следующими LLM провайдерами:

✅ **OpenAI** - chatGPT, GPT-4
✅ **Anthropic** - Claude
✅ **Ollama** - локальные модели
✅ **LM Studio** - локальные модели  
✅ **Z.AI** - GLM-4.5 и другие
✅ **Другие OpenAI-compatible API**
