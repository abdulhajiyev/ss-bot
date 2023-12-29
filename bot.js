import "dotenv/config";
import { Telegraf } from "telegraf";
import { commands } from "./commands/index.js";
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Welcome"));

// COMMANDS
for (const command of Object.values(commands)) {
	command(bot);
}
/* commands.at(bot);
commands.chart(bot);
commands.dex(bot); */

bot.launch();
console.log("Bot started");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
