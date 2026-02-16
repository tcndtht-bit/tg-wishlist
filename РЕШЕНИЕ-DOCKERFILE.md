# Решение: Railway использует Dockerfile вместо Nixpacks

Railway помечает Nixpacks как устаревший и переходит на Dockerfile. Нужно создать правильный Dockerfile для Python проекта.

---

## Шаг 1: Создай файл `Dockerfile` в репозитории

1. В GitHub репозитории `tg-wishlist-backend-bot` нажми **"Add file"** → **"Create new file"**
2. Имя файла: `Dockerfile` (точно так, без расширения!)
3. Содержимое:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Копируем requirements.txt и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код бота
COPY bot.py .

# Запускаем бота
CMD ["python", "bot.py"]
```
4. Внизу страницы нажми **"Commit changes"**
5. Railway автоматически перезапустит деплой

---

## Шаг 2: Настрой Railway Settings

1. В Railway открой проект `tg-wishlist-backend-bot`
2. Нажми **Settings** → **Deploy**
3. В секции **"Build & Deploy"**:

   **ВАЖНО:**
   - **Builder:** выбери **"Dockerfile"** (или оставь автоматическое определение)
   - **Build Command:** **ОСТАВЬ ПУСТЫМ** (Dockerfile сам всё сделает)
   - **Start Command:** **ОСТАВЬ ПУСТЫМ** (CMD в Dockerfile уже указан)

4. Прокрути вниз и нажми **Save**

---

## Шаг 3: Убедись, что есть все файлы

В репозитории должны быть:

- ✅ `bot.py` — код бота
- ✅ `requirements.txt` — зависимости
- ✅ `Dockerfile` — конфигурация Docker (только что создали)

**Можно удалить (не нужны для Dockerfile):**
- ❌ `runtime.txt` — не нужен для Dockerfile
- ❌ `Procfile` — не нужен для Dockerfile
- ❌ `nixpacks.toml` — не нужен для Dockerfile
- ❌ `railway.json` — можно оставить, но не обязателен

---

## Шаг 4: Перезапусти деплой

1. В Railway открой **Deployments**
2. Выбери последний деплой
3. Нажми **"Redeploy"**
4. Подожди 1-2 минуты

---

## Шаг 5: Проверь логи

После перезапуска открой **View Logs** и должно быть:

```
Step 1/5 : FROM python:3.11-slim
Step 2/5 : WORKDIR /app
Step 3/5 : COPY requirements.txt .
Step 4/5 : RUN pip install --no-cache-dir -r requirements.txt
Successfully installed pyTelegramBotAPI...
Step 5/5 : COPY bot.py .
Бот запущен!
```

Если видишь это — всё работает! ✅

---

## Если всё равно не работает

### Альтернатива: Render.com (рекомендуется)

Если Railway продолжает вызывать проблемы, используй Render.com — он проще для Python:

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

---

## Объяснение Dockerfile

- `FROM python:3.11-slim` — базовый образ с Python 3.11
- `WORKDIR /app` — рабочая директория
- `COPY requirements.txt .` — копируем файл зависимостей
- `RUN pip install ...` — устанавливаем зависимости
- `COPY bot.py .` — копируем код бота
- `CMD ["python", "bot.py"]` — команда запуска

Это стандартный Dockerfile для Python приложений.
