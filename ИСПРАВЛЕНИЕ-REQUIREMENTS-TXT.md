# Исправление ошибки "Invalid requirement" в requirements.txt

Ошибка `Invalid requirement: '''' (from line 1 of requirements.txt)` означает, что в файле `requirements.txt` есть лишние кавычки.

---

## Шаг 1: Проверь содержимое `requirements.txt`

1. Открой GitHub репозиторий `tg-wishlist-backend-bot`
2. Открой файл `requirements.txt`
3. Проверь первую строку

**Правильный формат:**
```
pyTelegramBotAPI==4.14.0
```

**Неправильный формат (с кавычками):**
```
''''pyTelegramBotAPI==4.14.0
```
или
```
'pyTelegramBotAPI==4.14.0'
```
или
```
"pyTelegramBotAPI==4.14.0"
```

---

## Шаг 2: Исправь файл `requirements.txt`

1. В GitHub репозитории открой файл `requirements.txt`
2. Нажми кнопку редактирования (карандаш)
3. Убедись, что содержимое **БЕЗ кавычек**:
```
pyTelegramBotAPI==4.14.0
```

**ВАЖНО:**
- Нет кавычек в начале или конце
- Нет пробелов в начале строки
- Только одна строка с именем пакета и версией

4. Внизу страницы нажми **"Commit changes"**

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
Step 4/5 : RUN pip install --no-cache-dir -r requirements.txt
Collecting pyTelegramBotAPI==4.14.0
Successfully installed pyTelegramBotAPI-4.14.0
```

Если видишь это — всё работает! ✅

---

## Правильный формат requirements.txt

Файл `requirements.txt` должен содержать только имена пакетов и версии, **БЕЗ кавычек**:

```
pyTelegramBotAPI==4.14.0
```

Если нужно несколько пакетов, каждый на новой строке:

```
pyTelegramBotAPI==4.14.0
requests==2.31.0
python-dotenv==1.0.0
```

**НЕ должно быть:**
- Кавычек вокруг имён пакетов
- Пустых строк с кавычками
- Комментариев с кавычками в начале
