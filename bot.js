import "dotenv/config";
import { Telegraf } from "telegraf";
import { atCommand } from "./commands/at.js";
import { dexCommand } from "./commands/dex.js";
import { chartCommand } from "./commands/chart.js";

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Welcome"));

// COMMANDS
dexCommand(bot);
atCommand(bot);
chartCommand(bot);

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
