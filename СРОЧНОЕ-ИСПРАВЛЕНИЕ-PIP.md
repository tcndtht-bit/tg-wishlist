# СРОЧНО: Исправление ошибки "pip: not found"

Railway не видит Python проект. Нужно исправить **прямо сейчас**.

---

## Шаг 1: Проверь файлы в GitHub репозитории

Открой свой репозиторий `tg-wishlist-backend-bot` в GitHub и проверь:

### ✅ Должны быть эти файлы:

1. **`bot.py`** — код бота
2. **`requirements.txt`** — зависимости
3. **`runtime.txt`** — **ОБЯЗАТЕЛЬНО!** (содержимое: `python-3.11.0`)

### ❌ НЕ должно быть:

- **`railway.json`** — если есть, **УДАЛИ ЕГО!**

---

## Шаг 2: Если нет `runtime.txt` — создай СЕЙЧАС

1. В GitHub репозитории нажми **"Add file"** → **"Create new file"**
2. Имя файла: `runtime.txt` (точно так!)
3. Содержимое (только одна строка):
   ```
   python-3.11.0
   ```
4. Внизу страницы нажми **"Commit changes"** (или "Commit new file")
5. Railway автоматически перезапустит деплой

---

## Шаг 3: Если есть `railway.json` — удали его

1. В GitHub репозитории найди файл `railway.json`
2. Открой его
3. Нажми кнопку **"Delete file"** (или иконку корзины)
4. Внизу страницы напиши commit message: `Remove railway.json`
5. Нажми **"Commit changes"**
6. Railway автоматически перезапустит деплой

---

## Шаг 4: Настрой Railway вручную

1. В Railway открой проект `tg-wishlist-backend-bot`
2. Нажми **Settings** (вверху справа)
3. Выбери вкладку **Deploy**
4. В секции **"Build & Deploy"**:

   **ВАЖНО:** Убедись, что:
   - **Builder:** выбери **"Nixpacks"** (если есть выбор)
   - **Build Command:** **ОСТАВЬ ПУСТЫМ** (не пиши ничего!)
   - **Start Command:** `python bot.py`

5. Прокрути вниз и нажми **Save**

---

## Шаг 5: Перезапусти деплой

1. В Railway открой вкладку **Deployments**
2. Выбери последний (провалившийся) деплой
3. Нажми кнопку **"Redeploy"** (или три точки → Redeploy)
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

---

## Быстрая проверка

После исправления в логах должно быть:
- ✅ `Detected Python project` или `Installing Python dependencies`
- ✅ `Successfully installed...`
- ✅ `Бот запущен!`

Если видишь `pip: not found` — значит что-то не так с файлами или настройками.
