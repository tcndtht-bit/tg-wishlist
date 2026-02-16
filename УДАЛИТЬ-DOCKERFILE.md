# КРИТИЧНО: Удали Dockerfile из репозитория!

Railway пытается использовать Dockerfile вместо Nixpacks, поэтому проект не определяется как Python.

---

## Шаг 1: Проверь, есть ли Dockerfile в репозитории

1. Открой свой GitHub репозиторий `tg-wishlist-backend-bot`
2. Посмотри список файлов
3. Есть ли файл `Dockerfile`? Если да — **УДАЛИ ЕГО!**

---

## Шаг 2: Удали Dockerfile

1. В GitHub репозитории найди файл `Dockerfile`
2. Открой его
3. Нажми кнопку **"Delete file"** (или иконку корзины справа вверху)
4. Внизу страницы напиши commit message: `Remove Dockerfile - use Nixpacks instead`
5. Нажми **"Commit changes"**

---

## Шаг 3: Настрой Railway использовать Nixpacks

1. В Railway открой проект `tg-wishlist-backend-bot`
2. Нажми **Settings** → **Deploy**
3. В секции **"Build & Deploy"**:

   **ВАЖНО:**
   - **Builder:** выбери **"Nixpacks"** (если есть выбор между Docker и Nixpacks)
   - **Build Command:** **ОСТАВЬ ПУСТЫМ** (не пиши ничего!)
   - **Start Command:** `python bot.py`

4. Прокрути вниз и нажми **Save**

---

## Шаг 4: Убедись, что есть нужные файлы

В репозитории должны быть:

- ✅ `bot.py` — код бота
- ✅ `requirements.txt` — зависимости
- ✅ `runtime.txt` — версия Python (содержимое: `python-3.11.0`)
- ❌ **НЕ должно быть:** `Dockerfile` или `railway.json`

---

## Шаг 5: Перезапусти деплой

1. В Railway открой **Deployments**
2. Выбери последний (провалившийся) деплой
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

### Альтернатива: Render.com

1. Зарегистрируйся на https://render.com
2. **New** → **Web Service**
3. Подключи GitHub репозиторий `tg-wishlist-backend-bot`
4. Настройки:
   - **Environment:** **Python 3**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python bot.py`
5. Добавь переменные `BOT_TOKEN` и `WEB_APP_URL`
6. Deploy

Render обычно лучше определяет Python проекты.
