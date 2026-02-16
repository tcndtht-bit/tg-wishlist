# Как включить DevTools для отладки Telegram Mini App в Telegram Desktop (Windows)

## Способ 1: Через настройки Telegram Desktop

1. **Открой Telegram Desktop**
2. **Нажми `Ctrl + ,`** (или меню → Settings)
3. **Перейди в раздел "Advanced"** (Дополнительно)
4. **Найди опцию "Enable WebView DevTools"** или "Включить инструменты разработчика WebView"
5. **Включи эту опцию**
6. **Перезапусти Telegram Desktop**

## Способ 2: Через переменную окружения

1. **Закрой Telegram Desktop полностью**
2. **Создай ярлык Telegram Desktop** (если его нет)
3. **Правой кнопкой на ярлык → Свойства**
4. **В поле "Объект" добавь в конец:**
   ```
   --enable-webview-devtools
   ```
   Пример:
   ```
   "C:\Users\ТвойПользователь\AppData\Roaming\Telegram Desktop\Telegram.exe" --enable-webview-devtools
   ```
5. **Сохрани изменения**
6. **Запусти Telegram через этот ярлык**

## Способ 3: Через командную строку

1. **Открой командную строку (cmd) или PowerShell**
2. **Выполни команду:**
   ```powershell
   & "C:\Users\$env:USERNAME\AppData\Roaming\Telegram Desktop\Telegram.exe" --enable-webview-devtools
   ```
   Или если Telegram установлен в другом месте:
   ```powershell
   & "C:\Program Files\Telegram Desktop\Telegram.exe" --enable-webview-devtools
   ```

## Как открыть DevTools после включения

1. **Открой Mini App в Telegram Desktop**
2. **Правой кнопкой мыши на область Mini App**
3. **Выбери "Inspect" или "Inspect Element"** (Проверить элемент)
4. **Откроется окно DevTools с вкладками:**
   - **Console** — логи и ошибки JavaScript
   - **Network** — сетевые запросы
   - **Elements** — DOM дерево
   - **Sources** — исходный код

## Альтернативный способ: Горячие клавиши

После включения DevTools можно открывать их через:
- **F12** — открыть/закрыть DevTools
- **Ctrl + Shift + I** — открыть DevTools
- **Ctrl + Shift + J** — открыть Console

## Что смотреть в Console

После открытия Mini App и DevTools, в консоли будут видны:
- `=== loadAll() ===` — загрузка приложения
- `Start param received:` — получение параметра от бота
- `Пробую анализ через tesseract...` — начало анализа
- `✓ Анализ успешен через tesseract` — успешный анализ
- Ошибки, если они есть

## Если DevTools не открываются

1. **Убедись, что Telegram Desktop обновлен** до последней версии
2. **Попробуй перезапустить Telegram Desktop**
3. **Проверь, что опция включена в настройках**
4. **Попробуй открыть Mini App в браузере напрямую** (если есть возможность) для отладки

## Отладка в браузере (альтернатива)

Если DevTools в Telegram не работают, можно:
1. **Открой Mini App URL напрямую в браузере** (Chrome/Edge)
2. **Открой DevTools (F12)**
3. **Имей в виду:** некоторые функции Telegram Web App могут не работать вне Telegram

---

**Примечание:** В мобильной версии Telegram (Android/iOS) DevTools недоступны. Для отладки используй Telegram Desktop или веб-версию Telegram.
