# Исправление: NameError в bot.py на первой строке

Ошибка `NameError: name 'python' is not defined` означает, что в файле `bot.py` на первой строке написано просто `python` вместо правильного кода.

---

## Шаг 1: Проверь первую строку bot.py в GitHub

1. Открой GitHub репозиторий `tg-wishlist-backend-bot`
2. Открой файл `bot.py`
3. Посмотри на первую строку

**Неправильно (вызывает ошибку):**
```
python
import telebot
```

**Правильно (должно быть):**
```
import telebot
```

---

## Шаг 2: Исправь файл bot.py

1. В GitHub репозитории открой файл `bot.py`
2. Нажми кнопку редактирования (карандаш)
3. Убедись, что первая строка — это `import telebot` (БЕЗ слова `python` перед ним)
4. Полный правильный код:

```python
import telebot
from telebot import types
import urllib.parse
import os

BOT_TOKEN = os.getenv('BOT_TOKEN')
WEB_APP_URL = os.getenv('WEB_APP_URL', 'https://your-app.netlify.app')

if not BOT_TOKEN:
    print("ОШИБКА: BOT_TOKEN не установлен!")
    exit(1)

bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, 
                 "Привет! 👋\n\n"
                 "Отправь мне фотографию товара, и я помогу создать карточку желания.\n\n"
                 "Просто отправь фото — я открою мини-приложение для анализа.")

@bot.message_handler(content_types=['photo'])
def handle_photo(message):
    try:
        photo = message.photo[-1]
        file_id = photo.file_id
        file_info = bot.get_file(file_id)
        file_url = f"https://api.telegram.org/file/bot{bot.token}/{file_info.file_path}"
        encoded_url = urllib.parse.quote(file_url, safe='')
        start_param = f"img_url_{encoded_url}"
        
        keyboard = types.InlineKeyboardMarkup()
        button = types.InlineKeyboardButton(
            text="📸 Анализировать изображение",
            web_app=types.WebAppInfo(url=f"{WEB_APP_URL}?startapp={start_param}")
        )
        keyboard.add(button)
        
        bot.reply_to(message, 
            "Открываю мини-приложение для анализа изображения...\n\n"
            "Нажми кнопку ниже 👇",
            reply_markup=keyboard
        )
    except Exception as e:
        print(f"Ошибка при обработке фото: {e}")
        bot.reply_to(message, "Произошла ошибка. Попробуй отправить фото еще раз.")

@bot.message_handler(func=lambda message: True)
def handle_all(message):
    bot.reply_to(message, 
        "Отправь мне фотографию товара, и я помогу создать карточку желания! 📸"
    )

if __name__ == '__main__':
    print("Бот запущен!")
    print(f"WEB_APP_URL: {WEB_APP_URL}")
    bot.polling(none_stop=True)
```

5. Внизу страницы нажми **"Commit changes"**

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

## Важно:

- Файл `bot.py` должен начинаться с `import telebot`, а НЕ с `python`
- Слово `python` используется только в командной строке для запуска файла: `python bot.py`
- Внутри самого файла `bot.py` слова `python` быть не должно
