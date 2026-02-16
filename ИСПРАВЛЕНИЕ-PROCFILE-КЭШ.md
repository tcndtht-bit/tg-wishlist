# Исправление: Railway продолжает использовать Procfile после удаления

Railway может использовать кэш или старые настройки. Нужно принудительно обновить конфигурацию.

---

## Шаг 1: Проверь, что Procfile удалён из GitHub

1. Открой GitHub репозиторий `tg-wishlist-backend-bot`
2. Проверь список файлов в корне
3. **НЕ должно быть** файла `Procfile`
4. Если файл всё ещё есть — удали его и сделай commit

---

## Шаг 2: Очисти кэш Railway

1. В Railway открой проект `tg-wishlist-backend-bot`
2. Нажми **Settings** → **Deploy**
3. В секции **"Build & Deploy"**:

   **ВАЖНО:**
   - **Builder:** выбери **"Dockerfile"** (если есть выбор)
   - **Build Command:** **ОСТАВЬ ПУСТЫМ**
   - **Start Command:** **ОСТАВЬ ПУСТЫМ** (Dockerfile сам всё сделает через CMD)

4. Прокрути вниз и нажми **Save**

---

## Шаг 3: Убедись, что Dockerfile правильный

В репозитории должен быть файл `Dockerfile` с содержимым:

```
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY bot.py .

CMD ["python", "bot.py"]
```

Команда `CMD ["python", "bot.py"]` в Dockerfile уже указывает, как запускать бота.

---

## Шаг 4: Пересоздай деплой (если не помогает)

Если Railway всё равно использует Procfile:

1. В Railway открой **Deployments**
2. Выбери последний деплой
3. Нажми **"..."** (три точки) → **"Redeploy"**
4. Или создай новый деплой: нажми **"..."** → **"Redeploy"** → **"Clear build cache"** (если есть опция)

---

## Шаг 5: Если всё равно не работает — пересоздай проект

1. В Railway удали текущий проект `tg-wishlist-backend-bot`
2. Создай новый проект: **New Project** → **Deploy from GitHub repo**
3. Выбери репозиторий `tg-wishlist-backend-bot`
4. Railway должен автоматически использовать Dockerfile (так как Procfile удалён)
5. Добавь переменные `BOT_TOKEN` и `WEB_APP_URL`
6. Деплой должен пройти успешно

---

## Почему это происходит?

Railway может кэшировать старую конфигурацию или использовать Procfile по умолчанию, если он был в репозитории ранее. После удаления Procfile нужно:

1. Убедиться, что файл удалён из GitHub
2. Очистить кэш Railway
3. Перезапустить деплой

---

## Проверка после исправления

После перезапуска открой **View Logs** и должно быть:

```
Step 5/5 : COPY bot.py .
Бот запущен!
WEB_APP_URL: https://...
```

**НЕ должно быть:**
- Упоминаний Procfile
- Ошибок про `web: python bot.py`

Если видишь это — всё работает! ✅
