# Решение проблемы без Dockerfile

Если в репозитории нет Dockerfile, но Railway всё равно использует Docker — нужно явно указать использовать Nixpacks.

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
5. Railway автоматически перезапустит деплой

---

## Шаг 2: Убедись, что есть `runtime.txt`

1. В GitHub репозитории проверь, есть ли файл `runtime.txt`
2. Если нет — создай его:
   - **"Add file"** → **"Create new file"**
   - Имя: `runtime.txt`
   - Содержимое (одна строка): `python-3.11.0`
   - Commit changes

---

## Шаг 3: Настрой Railway Settings

1. В Railway открой проект `tg-wishlist-backend-bot`
2. Нажми **Settings** → **Deploy**
3. В секции **"Build & Deploy"**:

   **ВАЖНО:**
   - **Builder:** выбери **"Nixpacks"** (если есть выбор)
   - **Build Command:** **ОСТАВЬ ПУСТЫМ** (не пиши ничего!)
   - **Start Command:** `python bot.py`

4. Прокрути вниз и нажми **Save**

---

## Шаг 4: Проверь файлы в репозитории

В репозитории должны быть:

- ✅ `bot.py` — код бота
- ✅ `requirements.txt` — зависимости
- ✅ `runtime.txt` — версия Python (`python-3.11.0`)
- ✅ `railway.json` — конфигурация Railway (только что создали)

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

Если видишь это — всё работает! ✅

---

## Если всё равно не работает

### Альтернатива: Render.com (проще для Python)

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
