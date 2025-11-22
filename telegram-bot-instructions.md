# Инструкция по настройке Telegram Bot для DuckCasino

## Шаг 1: Создание бота через @BotFather

1. Откройте Telegram и найдите бота **@BotFather**
2. Отправьте команду `/newbot`
3. Введите имя бота (например: `DuckCasino`)
4. Введите username бота (например: `duckcasino_bot`)
5. Сохраните полученный **Bot Token**

## Шаг 2: Настройка Mini App

1. Отправьте боту @BotFather команду `/newapp`
2. Выберите своего бота
3. Введите название приложения: `DuckCasino`
4. Введите описание: `Казино с играми Сапёр и Лесенка`
5. Загрузите иконку 640x360 (можно создать в любом редакторе)
6. Загрузите GIF превью (опционально)
7. Введите URL вашего приложения: `https://ваш-домен.poehali.dev`

## Шаг 3: Настройка меню бота

Отправьте @BotFather команду `/setmenu` и выберите своего бота.
Затем отправьте:

```
🎮 Играть - launch_app
```

## Шаг 4: Настройка Telegram Stars (платежи)

1. В @BotFather выберите команду `/setpayments`
2. Выберите своего бота
3. Включите Telegram Stars как способ оплаты

## Шаг 5: Webhook для обработки платежей (опционально)

Если хотите автоматически обрабатывать платежи, создайте простой скрипт:

```python
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

PAYMENT_PROVIDER_TOKEN = ""  # Для Stars оставить пустым

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[InlineKeyboardButton("🎮 Играть", web_app=WebAppInfo(url="https://ваш-домен.poehali.dev"))]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text('Добро пожаловать в DuckCasino! 🦆', reply_markup=reply_markup)

async def buy_stars(update: Update, context: ContextTypes.DEFAULT_TYPE):
    stars = int(context.args[0]) if context.args else 10
    
    await update.message.reply_invoice(
        title=f"Пополнение баланса",
        description=f"Купить {stars} звёзд = {stars * 10} монет в казино",
        payload=f"stars_{stars}",
        provider_token=PAYMENT_PROVIDER_TOKEN,
        currency="XTR",  # XTR = Telegram Stars
        prices=[LabeledPrice(label=f"{stars} звёзд", amount=stars)]
    )

async def successful_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    payment = update.message.successful_payment
    payload = payment.invoice_payload
    stars = int(payload.split('_')[1])
    user_id = update.effective_user.id
    
    # Отправляем запрос на ваш backend
    import requests
    requests.post('https://functions.poehali.dev/b946a71a-3088-4938-8ccc-972fcdaac1c0', json={
        'telegram_id': user_id,
        'stars_amount': stars
    })
    
    await update.message.reply_text(f'Спасибо! Ваш баланс пополнен на {stars * 10} монет! 🎉')

app = ApplicationBuilder().token("ВАШ_BOT_TOKEN").build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("buy", buy_stars))
app.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment))

app.run_polling()
```

## Шаг 6: Тестирование

1. Откройте вашего бота в Telegram
2. Нажмите "Играть"
3. Mini App должен открыться и показать казино
4. ID пользователя будет автоматически взят из Telegram
5. Баланс сохраняется в базе данных

## Структура базы данных

### Таблица `users`:
- `telegram_id` - ID пользователя в Telegram (PRIMARY KEY)
- `username` - username пользователя
- `first_name` - имя
- `last_name` - фамилия
- `balance` - текущий баланс (начинается с 0)
- `created_at` - дата регистрации
- `updated_at` - последнее обновление

### Таблица `transactions`:
- `id` - ID транзакции
- `telegram_id` - ID пользователя
- `amount` - сумма изменения баланса
- `transaction_type` - тип: 'payment', 'game', 'bonus'
- `description` - описание транзакции
- `created_at` - дата транзакции

## Backend API Endpoints

### 1. User Management
**URL**: `https://functions.poehali.dev/64460411-3489-48dc-8b81-a5b4f3f2f6aa`

- **GET** `?telegram_id=123456` - получить данные пользователя
- **POST** - создать/обновить пользователя
  ```json
  {
    "telegram_id": 123456,
    "username": "user",
    "first_name": "John",
    "last_name": "Doe"
  }
  ```
- **PUT** - изменить баланс
  ```json
  {
    "telegram_id": 123456,
    "balance_change": 100,
    "transaction_type": "game",
    "description": "Выигрыш"
  }
  ```

### 2. Payment Processing
**URL**: `https://functions.poehali.dev/b946a71a-3088-4938-8ccc-972fcdaac1c0`

- **POST** - обработать платеж
  ```json
  {
    "telegram_id": 123456,
    "stars_amount": 10
  }
  ```

## Обмен: 1 звезда = 10 монет в казино

Настройка завершена! 🎉
