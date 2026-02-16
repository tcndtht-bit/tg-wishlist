# Настройка Git для автоматических коммитов бота

## Текущая конфигурация

Репозиторий бота находится в: `bot-repo/`

### Remote URL
Настроен с токеном в URL для автоматической аутентификации:
```
https://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@github.com/tcndtht-bit/tg-wishlist-backend-bot.git
```

### Git User
- **Name:** Cursor Bot
- **Email:** cursoragent@cursor.com

## Как работает автоматический push

Когда я делаю изменения в `bot-repo/bot.py`:

1. **Добавление файлов:** `git add bot.py`
2. **Создание коммита:** `git commit -m "описание изменений"`
3. **Push:** `git push origin main`

Токен встроен в remote URL, поэтому дополнительная аутентификация не требуется.

## Проверка статуса

Чтобы проверить текущий статус репозитория:
```powershell
cd "c:\Users\tcndt\Documents\Cursor Projects\TG mini app\bot-repo"
git status
git log --oneline -5
```

## Если push не работает

1. Проверь, что remote настроен правильно:
   ```powershell
   git remote -v
   ```

2. Если нужно обновить remote:
   ```powershell
   git remote set-url origin https://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@github.com/tcndtht-bit/tg-wishlist-backend-bot.git
   ```

3. Проверь права токена на GitHub:
   - Должны быть отмечены все права `repo` (repo:status, repo_deployment, public_repo, repo:invite)

## Важно

- Токен встроен в remote URL для удобства автоматических коммитов
- Если токен истечет или будет отозван, нужно будет обновить remote URL
- Локальные изменения всегда должны быть закоммичены перед push
