import { Markup } from "telegraf";
import { alphatrendCalc } from "../functions/alphatrendCalc.js";

const alphatrend_intervals = {
	"4 Hour": "4H",
	"1 Day": "D",
	"1 Week": "W",
};

export default async function at(bot) {
	bot.command("at", (ctx) => {
		const input = ctx.message.text;
		const [, symbol = ""] = input.split(" ");

		if (!symbol) {
			return ctx.sendMessage(
				"Please provide a _*symbol*_\\. Use the correct format: *_/at AVAX_*",
				{ parse_mode: "MarkdownV2" },
			);
		}

		const conditions = ["Buy", "Sell"];
		const buttons = conditions.map((condition) =>
			Markup.button.callback(condition, `at_condition:${symbol}:${condition}`),
		);

		return ctx.reply(
			"Please select a condition:",
			Markup.inlineKeyboard(buttons, { columns: 2 }),
		);
	});

	bot.action(/at_condition:(.+):(.+)/, (ctx) => {
		const [, symbol, condition] = ctx.match;

		const buttons = Object.keys(alphatrend_intervals).map((interval) =>
			Markup.button.callback(
				interval,
				`at_condition_interval:${symbol}:${condition}:${interval}`,
			),
		);

		ctx.answerCbQuery();

		return ctx.editMessageText(
			"Please select an interval:",
			Markup.inlineKeyboard(buttons, { columns: 3 }),
		);
	});

	bot.action(/at_condition_interval:(.+):(.+):(.+)/, async (ctx) => {
		const [, symbol, condition, interval] = ctx.match;

		ctx.answerCbQuery();
		ctx.deleteMessage();

		const intervalWord = alphatrend_intervals[interval];

		const conditionWord = condition.toLowerCase() === "sell" ? "SELL" : "BUY";
		const target1 = `${symbol.toUpperCase()}USDT - ${intervalWord}`;
		const target2 = `${symbol.toUpperCase()} - ${intervalWord}`;
		const target3 = `${symbol.toUpperCase()}USD - ${intervalWord}`;

		await alphatrendCalc(
			ctx,
			symbol,
			conditionWord,
			target1,
			target2,
			target3,
			intervalWord,
		);
	});
}