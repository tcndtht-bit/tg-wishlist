# Удалить Procfile (не нужен при использовании Dockerfile)

Если используешь Dockerfile, Procfile не нужен и может вызывать конфликты.

---

## Шаг 1: Удали Procfile из репозитория

1. Открой GitHub репозиторий `tg-wishlist-backend-bot`
2. Найди файл `Procfile`
3. Открой его
4. Нажми кнопку **"Delete file"** (или иконку корзины)
5. Внизу страницы напиши commit message: `Remove Procfile - using Dockerfile instead`
6. Нажми **"Commit changes"**

---

## Шаг 2: Убедись, что Dockerfile правильный

В `Dockerfile` должна быть команда запуска:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY bot.py .

CMD ["python", "bot.py"]
```

Команда `CMD ["python", "bot.py"]` в Dockerfile уже указывает, как запускать бота.

---

## Шаг 3: Перезапусти деплой

1. В Railway открой **Deployments**
2. Выбери последний деплой
3. Нажми **"Redeploy"**
4. Подожди 1-2 минуты

---

## Шаг 4: Проверь логи

После перезапуска открой **View Logs** и должно быть:

```
Бот запущен!
WEB_APP_URL: https://...
```

Если видишь это — всё работает! ✅

---

## Почему Procfile не нужен?

- **Dockerfile** уже содержит команду запуска: `CMD ["python", "bot.py"]`
- **Procfile** используется для Heroku и других платформ без Dockerfile
- При наличии Dockerfile Railway использует его, а Procfile может вызывать конфликты

---

## Если всё равно крашится

Проверь, что в Railway Settings → Deploy:
- **Start Command:** **ОСТАВЬ ПУСТЫМ** (Dockerfile сам всё сделает)
- **Builder:** выбери **"Dockerfile"**

Если Start Command заполнен — очисти его, чтобы Railway использовал CMD из Dockerfile.
