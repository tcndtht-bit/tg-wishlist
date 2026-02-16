# Исправление ошибки "Nixpacks was unable to generate a build plan"

Nixpacks не может автоматически определить Python проект. Нужно добавить явную конфигурацию.

---

## Шаг 1: Создай файл `nixpacks.toml` в репозитории

1. В GitHub репозитории `tg-wishlist-backend-bot` нажми **"Add file"** → **"Create new file"**
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
5. Railway автоматически перезапустит деплой

---

## Шаг 2: Проверь формат `runtime.txt`

Убедись, что файл `runtime.txt` содержит **только одну строку** без пробелов:

```
python-3.11.0
```

**НЕ должно быть:**
- Пустых строк после
- Пробелов в начале или конце
- Других символов

---

## Шаг 3: Проверь `Procfile`

Убедись, что файл `Procfile` содержит:

```
web: python bot.py
```

**Важно:** 
- Нет пробелов в начале строки
- Точное имя файла `bot.py`

---

## Шаг 4: Убедись, что есть все файлы

В репозитории должны быть:

- ✅ `bot.py` — код бота
- ✅ `requirements.txt` — зависимости
- ✅ `runtime.txt` — версия Python (`python-3.11.0`)
- ✅ `Procfile` — команда запуска (`web: python bot.py`)
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
Installing Python dependencies...
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

---

## Альтернатива 2: Использовать Dockerfile

Если Nixpacks не работает, можно создать простой Dockerfile:

1. В GitHub репозитории создай файл `Dockerfile`
2. Содержимое:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY bot.py .

CMD ["python", "bot.py"]
```
3. В Railway Settings → Deploy выбери **Builder: Dockerfile**
4. Redeploy

Но лучше сначала попробовать `nixpacks.toml` — это проще.
