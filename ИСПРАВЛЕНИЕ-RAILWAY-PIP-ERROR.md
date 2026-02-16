# Исправление ошибки "pip: command not found" в Railway

Если видишь ошибку:
```
/bin/bash: line 1: pip: command not found
"pip install -r requirements.txt" did not complete successfully: exit code: 127
```

Это значит, что Railway не определил проект как Python или использует неправильный buildpack.

---

## Решение 1: Убедись, что есть все нужные файлы

В репозитории должны быть:

1. ✅ `bot.py` — код бота
2. ✅ `requirements.txt` — зависимости Python
3. ✅ `runtime.txt` — версия Python (ВАЖНО!)

### Создай `runtime.txt`:

1. В GitHub репозитории нажми "creating a new file"
2. Имя: `runtime.txt`
3. Содержимое:
```
python-3.11.0
```
4. Commit changes

---

## Решение 2: Удали railway.json (если создавал)

Если создавал файл `railway.json` и получаешь ошибку:

1. В GitHub репозитории найди файл `railway.json`
2. Открой его
3. Нажми "Delete file" (или кнопку удаления)
4. Commit changes

Railway должен автоматически определить проект как Python после этого.

---

## Решение 3: Настрой в Railway Settings

1. В Railway открой проект `tg-wishlist-backend-bot`
2. Нажми **Settings** → **Deploy**
3. В секции **"Build & Deploy"**:
   - **Builder:** выбери **"Nixpacks"** (если есть выбор)
   - **Build Command:** **ОСТАВЬ ПУСТЫМ** (Railway сам определит)
   - **Start Command:** `python bot.py`
4. Сохрани изменения
5. Нажми **Deployments** → выбери последний → **Redeploy**

---

## Решение 4: Проверь файлы в репозитории

Убедись, что в репозитории есть:

- `bot.py` — есть?
- `requirements.txt` — есть?
- `runtime.txt` — есть? (если нет — создай!)
- `Procfile` — опционально, но может помочь
- `railway.json` — лучше удалить, если есть

---

## Решение 5: Пересоздать проект в Railway

Если ничего не помогает:

1. В Railway удали текущий проект
2. Создай новый проект: **New Project** → **Deploy from GitHub repo**
3. Выбери репозиторий `tg-wishlist-backend-bot`
4. Railway должен автоматически определить Python проект
5. Добавь переменные окружения `BOT_TOKEN` и `WEB_APP_URL`
6. Деплой должен пройти успешно

---

## Проверка после исправления

После применения решения:

1. В Railway открой **Deployments**
2. Выбери последний деплой
3. Нажми **View Logs**
4. Должно быть:
   ```
   Installing dependencies...
   Successfully installed pyTelegramBotAPI...
   Бот запущен!
   ```

Если видишь это — всё работает! ✅

---

## Если всё равно не работает

Попробуй альтернативный хостинг:

### Render.com (проще для Python)

1. Зарегистрируйся на https://render.com
2. **New** → **Web Service**
3. Подключи GitHub репозиторий `tg-wishlist-backend-bot`
4. Настройки:
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python bot.py`
5. Добавь переменные: `BOT_TOKEN` и `WEB_APP_URL`
6. Deploy

Render обычно лучше определяет Python проекты.
