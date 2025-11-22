# MultiVault Backend

Quickly scaffolded backend structure with **Telegram bot integration**. Steps to run locally:

1. Copy environment template and set values:

```powershell
copy .env.example .env
```

**Important:** Add your Telegram bot token to `.env`:

```
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
```

2. Install dependencies:

```powershell
npm install
```

3. Start in development mode (requires `nodemon`):

```powershell
npm run dev
```

4. Example endpoints:

**User API:**

- `GET /api/users` - list users
- `POST /api/users` - create user (JSON body)

**Telegram API:**

- `GET /api/telegram/status` - check bot status
- `POST /api/telegram/send` - send message via bot (JSON: `{"chatId": "123456", "message": "Hello"}`)

**Bot Commands (in Telegram):**

- `/start` - Start the bot
- `/help` - View available commands

Files added:

- `src/config/config.js` — centralizes env config
- `src/routes/user.routes.js` — user routes
- `src/routes/telegram.routes.js` — telegram bot routes
- `src/controllers/user.controller.js` — controller layer
- `src/controllers/telegram.controller.js` — telegram controller
- `src/services/user.service.js` — simple in-memory service
- `src/services/telegram.service.js` — telegram bot service
- `src/models/user.model.js` — placeholder model

**DB**

Fill the TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN environment variables.
Run the "pushDB" script from package.json