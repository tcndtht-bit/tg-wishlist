# ПРИНУДИТЕЛЬНО переключить Railway на Nixpacks

Railway всё ещё пытается использовать Docker. Нужно явно указать использовать Nixpacks.

---

## Шаг 1: Создай файл `railway.json` в репозитории

1. В GitHub репозитории `tg-wishlist-backend-bot` нажми **"Add file"** → **"Create new file"**
2. Имя файла: `railway.json` (точно так!)
3. Содержимое:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python bot.py"
  }
}
```
4. Внизу страницы нажми **"Commit changes"**

---

## Шаг 2: Создай файл `nixpacks.toml` в репозитории

1. В GitHub репозитории нажми **"Add file"** → **"Create new file"**
2. Имя файла: `nixpacks.toml` (точно так!)
3. Содержимое:
```toml
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = ["pip install -r requirements.txt"]

[start]
cmd = "python bot.py"
```
4. Внизу страницы нажми **"Commit changes"**

---

## Шаг 3: Настрой Railway Settings (КРИТИЧНО!)

1. В Railway открой проект `tg-wishlist-backend-bot`
2. Нажми **Settings** → **Deploy**
3. В секции **"Build & Deploy"**:

   **ОБЯЗАТЕЛЬНО:**
   - **Builder:** выбери **"Nixpacks"** (если есть выбор между Docker и Nixpacks)
   - **Build Command:** **ОСТАВЬ ПУСТЫМ** (не пиши ничего!)
   - **Start Command:** `python bot.py`

4. Прокрути вниз и нажми **Save**

**ВАЖНО:** Если не видишь выбора Builder, попробуй:
- Удалить проект в Railway и создать заново
- Или использовать альтернативу (Render.com)

---

## Шаг 4: Убедись, что есть все файлы

В репозитории должны быть:

- ✅ `bot.py` — код бота
- ✅ `requirements.txt` — зависимости
- ✅ `runtime.txt` — версия Python (`python-3.11.0`)
- ✅ `Procfile` — команда запуска (`web: python bot.py`)
- ✅ `railway.json` — конфигурация Railway (только что создали)
- ✅ `nixpacks.toml` — конфигурация Nixpacks (только что создали)

---

## Шаг 5: Перезапусти деплой

1. В Railway открой **Deployments**
2. Выбери последний деплой
3. Нажми **"Redeploy"**
4. Подожди 1-2 минуты

---

## Шаг 6: Проверь логи

После перезапуска открой **View Logs** и должно быть:

```
Detected Python project
Installing dependencies...
Successfully installed pyTelegramBotAPI...
Бот запущен!
```

**НЕ должно быть:**
- `Dockerfile:19` или любые упоминания Dockerfile
- `pip: command not found`

Если видишь это — всё работает! ✅

---

## Если Railway всё равно использует Docker

### Решение: Пересоздать проект в Railway

1. В Railway удали текущий проект `tg-wishlist-backend-bot`
2. Создай новый проект: **New Project** → **Deploy from GitHub repo**
3. Выбери репозиторий `tg-wishlist-backend-bot`
4. Railway должен автоматически определить Python проект (благодаря `nixpacks.toml` и `railway.json`)
5. Добавь переменные окружения `BOT_TOKEN` и `WEB_APP_URL`
6. Деплой должен пройти успешно

---

## Альтернатива: Render.com (рекомендуется)

Если Railway продолжает использовать Docker, используй Render.com — он проще для Python:

1. Зарегистрируйся на https://render.com (бесплатно)
2. **New** → **Web Service**
3. Подключи GitHub репозиторий `tg-wishlist-backend-bot`
4. Настройки:
   - **Name:** `tg-wishlist-bot`
   - **Environment:** **Python 3**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python bot.py`
5. Добавь переменные:
   - `BOT_TOKEN` = твой токен
   - `WEB_APP_URL` = URL мини-приложения
6. Нажми **Create Web Service**
7. Render автоматически задеплоит

Render обычно лучше определяет Python проекты и работает быстрее.
