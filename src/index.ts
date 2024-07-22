import { Bot } from "grammy";
import { Menu } from "@grammyjs/menu";
import { connectDB, closeConnection } from "./db";

import error from "./middlewares/error";
// Import other middlewares

// Import commands

const bot: Bot = new Bot(process.env.BOT_API_TOKEN || "");

bot.use(error);
// Use other middlewares

const menu = new Menu("movements")
  .text("^", (ctx) => ctx.reply("Forward!"))
  .row()
  .text("<", (ctx) => ctx.reply("Left!"))
  .text(">", (ctx) => ctx.reply("Right!"))
  .row()
  .text("v", (ctx) => ctx.reply("Backwards!"));

bot.use(menu);

// Bind commands
bot.command("start", async (ctx) => {
  // Send the menu.
  await ctx.reply("Check out this menu:", { reply_markup: menu });
});

process.once("SIGINT", () => {
  closeConnection()
    .then(() => console.log("SIGINT occurred, exiting"))
    .catch(() => console.log("SIGINT occurred, exiting with no db connection closed"));
});
process.once("SIGTERM", () => {
  closeConnection()
    .then(() => console.log("SIGTERM occurred, exiting"))
    .catch(() => console.log("SIGTERM occurred, exiting with no db connection closed"));
});

connectDB()
  .then(() => bot.start())
  .catch((err) => console.log(err));
