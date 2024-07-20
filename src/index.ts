import { Bot } from 'grammy/out/bot';
import { connectDB, closeConnection } from './db';

import error from './middlewares/error';
// Import other middlewares

// Import commands

const bot: Bot = new Bot(process.env.BOT_API_TOKEN);

bot.use(error);
// Use other middlewares

// Bind commands

process.once('SIGINT', () => {
  closeConnection()
    .then(() => console.log('SIGINT occurred, exiting'))
    .catch(() => console.log('SIGINT occurred, exiting with no db connection closed'));
});
process.once('SIGTERM', () => {
  closeConnection()
    .then(() => console.log('SIGTERM occurred, exiting'))
    .catch(() => console.log('SIGTERM occurred, exiting with no db connection closed'));
});

connectDB()
  .then(() => bot.start())
  .catch((err) => console.log(err));
