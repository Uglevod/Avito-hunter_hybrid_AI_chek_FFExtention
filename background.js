// Background script для управления таймером и отправки в Telegram

class AvitoHunter {
  constructor() {
    this.timers = new Map(); // Хранит таймеры для каждой вкладки
    this.initializeStorage();
  }

  // Инициализация хранилища с настройками по умолчанию
  async initializeStorage() {
    const defaultSettings = {
      telegramBotToken: '',
      telegramChatId: '',
      llmApiUrl: '',
      llmApiToken: '',
      llmModel: 'z-ai/glm-4.5-air',
      systemPrompt: '',
      maxTokens: 100,
      refreshInterval: 5, // минуты
      isEnabled: false,
      trackedTabs: new Map(), // Вкладки под отслеживанием
      telegramMessagesSent: 0 // Счетчик отправленных сообщений в Telegram
    };

    const result = await browser.storage.local.get(['settings']);
    if (!result.settings) {
      await browser.storage.local.set({ settings: defaultSettings });
    }
  }

  // Получение настроек
  async getSettings() {
    const result = await browser.storage.local.get(['settings']);
    return result.settings || {};
  }

  // Сохранение настроек
  async saveSettings(settings) {
    await browser.storage.local.set({ settings });
  }

  // Запуск отслеживания для вкладки
  async startTracking(tabId) {
    const settings = await this.getSettings();
    
    console.log('Avito Hunter: Получены настройки для запуска:', settings);
    
    if (!settings.isEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
      console.log('Avito Hunter: Настройки неполные, отслеживание не запущено');
      console.log('Avito Hunter: isEnabled:', settings.isEnabled, 'botToken:', !!settings.telegramBotToken, 'chatId:', !!settings.telegramChatId);
      return;
    }

    // Останавливаем предыдущий таймер если есть
    await this.stopTracking(tabId);

    // Выполняем первичное сканирование сразу после запуска
    try {
      console.log('Avito Hunter: Выполняется первичное сканирование...');
      await this.refreshAndCheck(tabId);
    } catch (error) {
      console.error('Avito Hunter: Ошибка при первичном сканировании:', error);
    }

    const intervalMs = settings.refreshInterval * 60 * 1000; // конвертируем минуты в миллисекунды
    
    console.log(`Avito Hunter: Установлен интервал ${settings.refreshInterval} минут (${intervalMs} мс)`);
    console.log(`Avito Hunter: Таймер будет срабатывать каждые ${settings.refreshInterval} минут`);
    
    const timer = setInterval(async () => {
      try {
        console.log(`Avito Hunter: Сработал таймер для вкладки ${tabId} - обновляем страницу`);
        await this.refreshAndCheck(tabId);
      } catch (error) {
        console.error('Avito Hunter: Ошибка при обновлении:', error);
      }
    }, intervalMs);

    this.timers.set(tabId, timer);
    
    // Сохраняем информацию о отслеживаемой вкладке
    settings.trackedTabs = settings.trackedTabs || {};
    settings.trackedTabs[tabId] = {
      url: (await browser.tabs.get(tabId)).url,
      startTime: Date.now()
    };
    await this.saveSettings(settings);

    console.log(`Avito Hunter: Отслеживание запущено для вкладки ${tabId} с интервалом ${settings.refreshInterval} минут`);
    console.log(`Avito Hunter: trackedTabs после запуска:`, settings.trackedTabs);
    console.log(`Avito Hunter: Количество отслеживаемых вкладок: ${Object.keys(settings.trackedTabs).length}`);
  }

  // Остановка отслеживания для вкладки
  async stopTracking(tabId) {
    console.log(`Avito Hunter: Начинаем остановку отслеживания для вкладки ${tabId}`);
    
    // Останавливаем таймер
    if (this.timers.has(tabId)) {
      clearInterval(this.timers.get(tabId));
      this.timers.delete(tabId);
      console.log(`Avito Hunter: Таймер остановлен для вкладки ${tabId}`);
    } else {
      console.log(`Avito Hunter: Таймер для вкладки ${tabId} не найден`);
    }
    
    // Удаляем информацию о вкладке из настроек
    const settings = await this.getSettings();
    if (settings.trackedTabs && settings.trackedTabs[tabId]) {
      console.log(`Avito Hunter: Удаляем информацию о вкладке ${tabId} из настроек`);
      delete settings.trackedTabs[tabId];
      await this.saveSettings(settings);
      console.log(`Avito Hunter: Настройки обновлены, вкладка ${tabId} удалена`);
    } else {
      console.log(`Avito Hunter: Информация о вкладке ${tabId} в настройках не найдена`);
    }
    
    console.log(`Avito Hunter: Отслеживание полностью остановлено для вкладки ${tabId}`);
  }

  // Обновление страницы и проверка изменений
  async refreshAndCheck(tabId) {
    try {
      console.log(`Avito Hunter: Начинаем обновление вкладки ${tabId}`);
      
      // Обновляем страницу
      await browser.tabs.reload(tabId);
      console.log(`Avito Hunter: Страница ${tabId} перезагружена`);
      
      // Ждем загрузки страницы
      console.log(`Avito Hunter: Ждем загрузки страницы ${tabId} (3 секунды)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Запрашиваем парсинг элементов
      console.log(`Avito Hunter: Запрашиваем парсинг элементов для вкладки ${tabId}`);
      const response = await browser.tabs.sendMessage(tabId, {
        action: 'parseAndCheck'
      });

      console.log(`Avito Hunter: Получен ответ от content script:`, response);

      if (response && response.newItems && response.newItems.length > 0) {
        console.log(`Avito Hunter: Найдено ${response.newItems.length} новых элементов, отправляем в Telegram`);
        console.log(`Avito Hunter: Список новых элементов:`, response.newItems.map(item => item.title));
        await this.sendTelegramNotification(response.newItems);
      } else {
        console.log(`Avito Hunter: Новых элементов не найдено`);
        if (response) {
          console.log(`Avito Hunter: Ответ получен, но newItems пустой или отсутствует:`, response);
        } else {
          console.log(`Avito Hunter: Ответ не получен от content script`);
        }
      }
    } catch (error) {
      console.error('Avito Hunter: Ошибка при обновлении вкладки:', error);
    }
  }

  // Анализ объявления через LLM API
  async analyzeItemWithLLM(item) {
    const settings = await this.getSettings();
    
    if (!settings.llmApiUrl || !settings.systemPrompt) {
      console.log('Avito Hunter: LLM API не настроен, пропускаем анализ');
      return { shouldSend: true, analysis: null }; // Если LLM не настроен, отправляем все
    }

    try {
      console.log(`Avito Hunter: Анализируем объявление через LLM: ${item.title}`);
      console.log(`Avito Hunter: Используемая модель: ${settings.llmModel || "z-ai/glm-4.5-air"}`);
      console.log(`Avito Hunter: Данные объявления:`, item);
      
      const requestBody = {
        model: settings.llmModel || "z-ai/glm-4.5-air", // Используем выбранную модель
        messages: [
          {
            role: "system",
            content: settings.systemPrompt
          },
          {
            role: "user",
            content: `Проанализируй это объявление:\n\nID: ${item.id}\nЗаголовок: ${item.title}\nОписание: ${item.description}\nЦена: ${item.price}₽\nСсылка: ${item.url}\nОригинальная ссылка: ${item.originalHref}\nВремя: ${new Date(item.timestamp).toLocaleString()}`
          }
        ],
        temperature: 0.1,
        max_tokens: settings.maxTokens || 100,
        // Параметры для структурированного вывода JSON
        response_format: {
          type: "json_object"
        },
        structured_outputs: true
      };

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (settings.llmApiToken) {
        headers['Authorization'] = `Bearer ${settings.llmApiToken}`;
      }

      console.log(`Avito Hunter: Отправляем запрос к LLM API:`, {
        url: `${settings.llmApiUrl}/chat/completions`,
        headers: headers,
        body: requestBody
      });

      const response = await fetch(`${settings.llmApiUrl}/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let analysisText = data.choices[0].message.content?.trim() || '';
      
      // Проверяем альтернативные поля для LLM ответа
      // Поддержка reasoning_details для моделей с расширенной логикой
      if (!analysisText && data.choices[0].message.reasoning) {
        analysisText = data.choices[0].message.reasoning.trim();
        console.log(`Avito Hunter: LLM ответ найден в reasoning`);
      }
      
      if (!analysisText && data.choices[0].message.reasoning_details && 
          Array.isArray(data.choices[0].message.reasoning_details) &&
          data.choices[0].message.reasoning_details.length > 0) {
        // Проверяем массив reasoning_details
        const reasoningDetail = data.choices[0].message.reasoning_details.find(r => r.text);
        if (reasoningDetail && reasoningDetail.text) {
          analysisText = reasoningDetail.text.trim();
          console.log(`Avito Hunter: LLM ответ найден в reasoning_details`);
        }
      }
      
      console.log(`Avito Hunter: LLM ответ: ${analysisText}`);
      
      if (!analysisText) {
        console.warn(`Avito Hunter: Не удалось найти ответ LLM ни в одном из поддерживаемых полей`);
        return { shouldSend: true, analysis: 'Пустой ответ от LLM', llmApproved: false };
      }
      
      // Парсим JSON ответ
      try {
        const analysis = JSON.parse(analysisText);
        if (analysis.good === true) {
          console.log(`Avito Hunter: LLM рекомендует отправить объявление: ${item.title}`);
          return { shouldSend: true, analysis: analysisText, llmApproved: true };
        } else if (analysis.good === false) {
          console.log(`Avito Hunter: LLM НЕ рекомендует отправить объявление: ${item.title}`);
          console.log(`Avito Hunter: Объявление "${item.title}" будет ИСКЛЮЧЕНО из отправки в Telegram`);
          return { shouldSend: false, analysis: analysisText, llmApproved: false };
        } else {
          // Если формат не соответствует ожидаемому, отправляем весь ответ
          console.log(`Avito Hunter: LLM вернул неожиданный формат, отправляем весь ответ: ${item.title}`);
          console.log(`Avito Hunter: Полная длина текста ответа: ${analysisText.length} символов`);
          return { shouldSend: true, analysis: analysisText, llmApproved: false };
        }
      } catch (parseError) {
        // Если не удалось распарсить JSON напрямую, ищем JSON внутри текста (для reasoning_details)
        console.log(`Avito Hunter: Ошибка парсинга JSON на верхнем уровне, ищем JSON внутри текста: ${item.title}`);
        
        // Ищем JSON паттерн {"good": true/false} внутри текста
        const jsonPatterns = [
          /\{\s*"good"\s*:\s*true\s*\}/gi,     // {"good":true} и варианты с пробелами
          /\{\s*"good"\s*:\s*false\s*\}/gi,    // {"good":false} и варианты с пробелами
          /\{\s*'good'\s*:\s*true\s*\}/gi,     // {'good':true} с одинарными кавычками
          /\{\s*'good'\s*:\s*false\s*\}/gi     // {'good':false} с одинарными кавычками
        ];
        
        for (const pattern of jsonPatterns) {
          const match = analysisText.match(pattern);
          if (match) {
            console.log(`Avito Hunter: Найден JSON паттерн внутри текста: ${match[0]}`);
            try {
              // Парсим найденный JSON
              const foundJson = JSON.parse(match[0]);
              if (foundJson.good === true) {
                console.log(`Avito Hunter: LLM рекомендует отправить объявление (найдено в reasoning_details): ${item.title}`);
                return { shouldSend: true, analysis: analysisText, llmApproved: true };
              } else if (foundJson.good === false) {
                console.log(`Avito Hunter: LLM НЕ рекомендует отправить объявление (найдено в reasoning_details): ${item.title}`);
                console.log(`Avito Hunter: Объявление "${item.title}" будет ИСКЛЮЧЕНО из отправки в Telegram`);
                return { shouldSend: false, analysis: analysisText, llmApproved: false };
              }
            } catch (innerParseError) {
              console.error(`Avito Hunter: Ошибка парсинга найденного JSON: ${match[0]}`);
            }
          }
        }
        
        // Если JSON не найден, отправляем весь текст ответа
        console.log(`Avito Hunter: Не найден JSON паттерн {"good": true/false} внутри reasoning_details, отправляем весь ответ: ${item.title}`);
        console.log(`Avito Hunter: Полная длина текста ответа: ${analysisText.length} символов`);
        console.log(`Avito Hunter: Первые 200 символов: ${analysisText.substring(0, 200)}`);
        return { shouldSend: true, analysis: analysisText, llmApproved: false };
      }

    } catch (error) {
      console.error('Avito Hunter: Ошибка анализа через LLM:', error);
      
      // Проверяем тип ошибки
      if (error.message.includes('CORS') || error.message.includes('Cross-Origin')) {
        console.error('Avito Hunter: CORS ошибка - сервер не разрешает запросы от расширения');
        return { shouldSend: true, analysis: `CORS ошибка: сервер не настроен для работы с расширением браузера`, llmApproved: false };
      }
      
      // В случае ошибки отправляем объявление
      return { shouldSend: true, analysis: `Ошибка анализа: ${error.message}`, llmApproved: false };
    }
  }

  // Отправка уведомления в Telegram
  async sendTelegramNotification(newItems) {
    console.log(`Avito Hunter: Вызвана функция sendTelegramNotification с ${newItems ? newItems.length : 'undefined'} элементами`);
    
    const settings = await this.getSettings();
    
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      console.log('Avito Hunter: Настройки Telegram не заданы');
      return;
    }

    if (!newItems || newItems.length === 0) {
      console.log('Avito Hunter: Нет новых элементов для отправки');
      return;
    }

    // Анализируем каждый элемент через LLM и фильтруем
    const filteredItems = [];
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      const analysis = await this.analyzeItemWithLLM(item);
      
      if (analysis.shouldSend) {
        // Добавляем информацию о том, что объявление было одобрено LLM
        const itemWithLLMInfo = {
          ...item,
          llmApproved: analysis.llmApproved || false,
          llmAnalysis: analysis.analysis || ''  // Сохраняем полный текст анализа LLM
        };
        filteredItems.push(itemWithLLMInfo);
        console.log(`Avito Hunter: Объявление "${item.title}" прошло LLM фильтр (одобрено: ${analysis.llmApproved})`);
        if (analysis.analysis && analysis.analysis.length > 0) {
          console.log(`Avito Hunter: Анализ LLM сохранен (${analysis.analysis.length} символов)`);
        }
      } else {
        console.log(`Avito Hunter: Объявление "${item.title}" НЕ прошло LLM фильтр`);
      }
      
      // Задержка в 1 секунду между запросами к LLM
      if (i < newItems.length - 1) {
        console.log('Avito Hunter: Ожидание 1 секунда перед следующим запросом к LLM...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (filteredItems.length === 0) {
      console.log('Avito Hunter: После LLM фильтрации не осталось элементов для отправки');
      console.log(`Avito Hunter: Все ${newItems.length} объявлений были отклонены LLM или произошла ошибка`);
      return;
    }

    console.log(`Avito Hunter: После LLM фильтрации осталось ${filteredItems.length} из ${newItems.length} элементов`);
    console.log(`Avito Hunter: Отклонено LLM: ${newItems.length - filteredItems.length} объявлений`);

    // Формируем одно сообщение для отфильтрованных элементов
    const message = this.formatTelegramMessage(filteredItems);
    
    // Валидация данных перед отправкой
    console.log(`Avito Hunter: Отправляем сообщение в Telegram:`);
    console.log(`- Bot Token: ${settings.telegramBotToken ? 'задан' : 'НЕ ЗАДАН'}`);
    console.log(`- Chat ID: ${settings.telegramChatId}`);
    console.log(`- Длина сообщения: ${message.length} символов`);
    console.log(`- Количество элементов: ${newItems.length}`);
    
    // Проверяем длину сообщения (лимит Telegram: 4096 символов)
    if (message.length > 4096) {
      console.warn(`Avito Hunter: Сообщение слишком длинное (${message.length} символов), обрезаем до 4096`);
      const truncatedMessage = message.substring(0, 4090) + '...';
      console.log(`Avito Hunter: Обрезанное сообщение: ${truncatedMessage}`);
    }
    
    try {
      const requestBody = {
        chat_id: settings.telegramChatId,
        text: message.length > 4096 ? message.substring(0, 4090) + '...' : message,
        parse_mode: 'HTML'
      };
      
      console.log(`Avito Hunter: Тело запроса:`, requestBody);
      
      const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.description || errorData.error_code || `HTTP error! status: ${response.status}`;
        console.error('Avito Hunter: Детали ошибки Telegram API:', errorData);
        throw new Error(`Telegram API error: ${errorMessage} (status: ${response.status})`);
      }

      // Увеличиваем счетчик отправленных сообщений
      settings.telegramMessagesSent = (settings.telegramMessagesSent || 0) + 1;
      await this.saveSettings(settings);

      console.log(`Avito Hunter: Отправлено уведомление о ${filteredItems.length} новых элементах в Telegram (из ${newItems.length} проанализированных)`);
      console.log(`Avito Hunter: Всего отправлено сообщений: ${settings.telegramMessagesSent}`);
    } catch (error) {
      console.error('Avito Hunter: Ошибка отправки в Telegram:', error);
    }
  }

  // Отправка тестового сообщения в Telegram
  async sendTestTelegramMessage() {
    const settings = await this.getSettings();
    
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      console.log('Avito Hunter: Настройки Telegram не заданы для тестового сообщения');
      return { success: false, error: 'Настройки Telegram не заданы' };
    }

    const testMessage = `🧪 <b>Тестовое сообщение от Avito Hunter</b>\n\n` +
                       `✅ Расширение работает корректно!\n` +
                       `⏰ Время: ${new Date().toLocaleString()}\n` +
                       `🔧 Версия: 1.0.0\n\n` +
                       `Если вы видите это сообщение, значит настройки Telegram настроены правильно.`;

    try {
      console.log('Avito Hunter: Отправка тестового сообщения в Telegram...');
      
      const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: testMessage,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, description: ${errorData.description || 'Unknown error'}`);
      }

      // Увеличиваем счетчик отправленных сообщений
      settings.telegramMessagesSent = (settings.telegramMessagesSent || 0) + 1;
      await this.saveSettings(settings);

      console.log('Avito Hunter: Тестовое сообщение отправлено успешно');
      console.log(`Avito Hunter: Всего отправлено сообщений: ${settings.telegramMessagesSent}`);
      
      return { success: true };
    } catch (error) {
      console.error('Avito Hunter: Ошибка отправки тестового сообщения:', error);
      return { success: false, error: error.message };
    }
  }

  // Форматирование сообщения для Telegram
  // Экранирование HTML для Telegram
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatTelegramMessage(items) {
    if (!Array.isArray(items)) {
      items = [items]; // Для обратной совместимости
    }

    if (items.length === 0) {
      return 'Нет новых объявлений';
    }

    if (items.length === 1) {
      // Одно объявление - подробный формат
      const item = items[0];
      const price = item.price ? `${item.price} ₽` : 'Цена не указана';
      const description = this.escapeHtml(item.description || 'Описание отсутствует');
      const url = item.url ? `https://www.avito.ru${item.url}` : '';
      const title = this.escapeHtml(item.title || 'Без названия');
      
      // Добавляем пометку "(LLM checked)" если объявление было одобрено LLM
      const llmCheck = item.llmApproved ? ' (LLM checked)' : '';
      
      let message = `🆕 <b>Новое объявление на Avito!${llmCheck}</b>\n\n` +
             `💰 <b>Цена:</b> ${price}\n` +
             `📝 <b>Описание:</b> ${description}\n` +
             `🔗 <b>Ссылка:</b> ${url}`;
      
      // Добавляем анализ LLM если он есть
      if (item.llmAnalysis && item.llmAnalysis.length > 0) {
        const llmAnalysisEscaped = this.escapeHtml(item.llmAnalysis.substring(0, 1000)); // Ограничиваем 1000 символов для TG
        message += `\n\n🤖 <b>LLM Анализ:</b>\n${llmAnalysisEscaped}`;
      }
      
      return message;
    } else {
      // Несколько объявлений - компактный формат
      let message = `🆕 <b>Найдено ${items.length} новых объявлений на Avito!</b>\n\n`;
      
      items.forEach((item, index) => {
        const price = item.price ? `${item.price} ₽` : 'Цена не указана';
        const url = item.url ? `https://www.avito.ru${item.url}` : '';
        const description = item.description ? 
          (item.description.length > 100 ? 
            this.escapeHtml(item.description.substring(0, 100)) + '...' : 
            this.escapeHtml(item.description)) : 
          'Описание отсутствует';
        const title = this.escapeHtml(item.title || 'Без названия');
        
        // Добавляем пометку "(LLM checked)" если объявление было одобрено LLM
        const llmCheck = item.llmApproved ? ' (LLM checked)' : '';
        
        message += `${index + 1}. <b>${title}${llmCheck}</b>\n` +
                  `💰 ${price} | 📝 ${description}\n` +
                  `🔗 ${url}\n`;
        
        // Добавляем анализ LLM если он есть
        if (item.llmAnalysis && item.llmAnalysis.length > 0) {
          const llmAnalysisShort = item.llmAnalysis.substring(0, 500); // Ограничиваем для компактности
          const llmAnalysisEscaped = this.escapeHtml(llmAnalysisShort);
          message += `🤖 <i>LLM:</i> ${llmAnalysisEscaped}\n`;
        }
        
        message += '\n';
      });
      
      return message;
    }
  }

  // Обработка сообщений от content script
  async handleMessage(message, sender) {
    switch (message.action) {
      case 'startTracking':
        await this.startTracking(sender.tab.id);
        return { success: true };
        
      case 'stopTracking':
        const stopTabId = message.tabId || sender.tab?.id;
        if (stopTabId) {
          await this.stopTracking(stopTabId);
          console.log(`Avito Hunter: Остановка отслеживания для вкладки ${stopTabId}`);
        } else {
          console.error('Avito Hunter: Не удалось определить ID вкладки для остановки');
        }
        return { success: true };
        
      case 'getSettings':
        const settings = await this.getSettings();
        return { settings };
        
      case 'saveSettings':
        console.log('Background: Получены настройки для сохранения:', message.settings);
        console.log('Background: Интервал в настройках:', message.settings.refreshInterval);
        await this.saveSettings(message.settings);
        console.log('Background: Настройки успешно сохранены');
        return { success: true };
        
      case 'pageReady':
        console.log(`Avito Hunter: Страница готова, найдено ${message.itemCount} элементов`);
        
        // Проверяем, есть ли новые элементы при любой загрузке
        if (message.newItems && message.newItems.length > 0) {
          console.log(`Avito Hunter: При загрузке найдено ${message.newItems.length} новых элементов, отправляем в Telegram`);
          console.log(`Avito Hunter: Список новых элементов:`, message.newItems.map(item => item.title));
          await this.sendTelegramNotification(message.newItems);
        } else {
          console.log(`Avito Hunter: При загрузке новых элементов не найдено`);
        }
        
        return { success: true };
        
      case 'testTelegramMessage':
        return await this.sendTestTelegramMessage();
        
      case 'parseAndCheck':
        // Этот запрос обрабатывается в content script
        return { success: true };
    }
  }
}

// Инициализация
const avitoHunter = new AvitoHunter();

// Обработка сообщений
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Если сообщение содержит tabId (от popup), используем его
  if (message.tabId) {
    avitoHunter.handleMessage(message, { tab: { id: message.tabId } }).then(response => {
      sendResponse(response || { success: true });
    }).catch(error => {
      console.error('Avito Hunter: Ошибка обработки сообщения:', error);
      sendResponse({ success: false, error: error.message });
    });
  } else {
    // Обычная обработка для сообщений от content script
    avitoHunter.handleMessage(message, sender).then(response => {
      sendResponse(response || { success: true });
    }).catch(error => {
      console.error('Avito Hunter: Ошибка обработки сообщения:', error);
      sendResponse({ success: false, error: error.message });
    });
  }
  return true; // Асинхронный ответ
});

// Очистка таймеров при закрытии вкладок
browser.tabs.onRemoved.addListener(async (tabId) => {
  await avitoHunter.stopTracking(tabId);
});

// Очистка таймеров при обновлении вкладок
browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    // Вкладка начала загружаться, можно остановить старый таймер
    await avitoHunter.stopTracking(tabId);
  }
});
