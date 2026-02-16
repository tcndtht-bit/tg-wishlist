# Исправление ошибки "/bot.py": not found

Dockerfile не может найти файл `bot.py`. Это значит, что файл либо не закоммичен в репозиторий, либо находится не в корне.

---

## Шаг 1: Проверь, есть ли `bot.py` в репозитории

1. Открой GitHub репозиторий `tg-wishlist-backend-bot`
2. Посмотри список файлов в корне репозитория
3. Есть ли файл `bot.py`? Если нет — нужно его добавить!

---

## Шаг 2: Если файла нет — добавь его

1. В GitHub репозитории нажми **"Add file"** → **"Create new file"**
2. Имя файла: `bot.py` (точно так!)
3. Скопируй содержимое из файла `bot-files/bot.py` (если у тебя есть локальная копия)
4. Или используй этот код:

```python
import telebot
from telebot import types
import urllib.parse
import os

# Токен бота из переменной окружения (Railway установит его)
BOT_TOKEN = os.getenv('BOT_TOKEN')

# URL мини-приложения из переменной окружения (или укажи напрямую)
WEB_APP_URL = os.getenv('WEB_APP_URL', 'https://your-app.netlify.app')

if not BOT_TOKEN:
    print("ОШИБКА: BOT_TOKEN не установлен!")
    exit(1)

bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, 
                 f"Привет! Я бот для управления вишлистами.\n\n"
                 f"Отправь мне фото товара, и я помогу создать карточку желания!")

@bot.message_handler(content_types=['photo'])
def handle_photo(message):
    try:
        # Получаем информацию о фото
        file_info = bot.get_file(message.photo[-1].file_id)
        file_path = file_info.file_path
        
        # Формируем URL изображения
        image_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"
        
        # Кодируем URL для передачи в start_param
        encoded_url = urllib.parse.quote(image_url, safe='')
        
        # Формируем start_param для мини-приложения
        start_param = f"img_url_{encoded_url}"
        
        # Создаём кнопку для открытия мини-приложения
        keyboard = types.InlineKeyboardMarkup()
        button = types.InlineKeyboardButton(
            text="Открыть мини-приложение",
            web_app=types.WebAppInfo(url=f"{WEB_APP_URL}?start_param={start_param}")
        )
        keyboard.add(button)
        
        bot.reply_to(message, 
                    "Отлично! Я получил фото. Нажми кнопку ниже, чтобы открыть мини-приложение и создать карточку желания.",
                    reply_markup=keyboard)
        
        # Автоматически открываем мини-приложение
        try:
            bot.send_message(message.chat.id, 
                           "Открываю мини-приложение...",
                           reply_markup=types.InlineKeyboardMarkup().add(
                               types.InlineKeyboardButton(
                                   text="Открыть",
                                   web_app=types.WebAppInfo(url=f"{WEB_APP_URL}?start_param={start_param}")
                               )
                           ))
        except Exception as e:
            print(f"Ошибка при автоматическом открытии: {e}")
            
    except Exception as e:
        bot.reply_to(message, f"Ошибка при обработке фото: {str(e)}")
        print(f"Ошибка: {e}")

@bot.message_handler(func=lambda message: True)
def handle_all(message):
    bot.reply_to(message, 
                 "Отправь мне фото товара, и я помогу создать карточку желания!")

if __name__ == '__main__':
    print("Бот запущен!")
    print(f"WEB_APP_URL: {WEB_APP_URL}")
    bot.polling(none_stop=True)
```

5. Внизу страницы нажми **"Commit changes"**

---

## Шаг 3: Проверь, что файл в корне репозитория

Файл `bot.py` должен быть в **корне** репозитория, на одном уровне с:
- `requirements.txt`
- `Dockerfile`
- `README.md`

**НЕ должно быть:**
- `bot.py` внутри папки `bot-files/` или другой папки
- `bot.py` в подпапке

---

## Шаг 4: Проверь структуру репозитория

В корне репозитория должны быть файлы:

```
tg-wishlist-backend-bot/
├── bot.py          ← Должен быть здесь!
├── requirements.txt
├── Dockerfile
├── README.md
└── (другие файлы)
```

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

## Если файл есть, но всё равно ошибка

### Проверь Dockerfile

Убедись, что в `Dockerfile` правильный путь:

```dockerfile
COPY bot.py .
```

**НЕ должно быть:**
- `COPY bot-files/bot.py .` (если файл в папке)
- `COPY ./bot.py .` (лишний слэш)

### Альтернатива: Используй полный путь

Если файл находится в подпапке, измени Dockerfile:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY bot-files/bot.py ./bot.py  # Если файл в папке bot-files
CMD ["python", "bot.py"]
```

Но лучше переместить `bot.py` в корень репозитория!
