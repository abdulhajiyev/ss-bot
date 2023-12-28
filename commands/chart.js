import { ssChart } from "../functions/ssChart.js";
import { Markup } from "telegraf";

export async function chartCommand(bot) {
	const intervals = {
		"1 Min": "1",
		"3 Min": "3",
		"5 Min": "5",
		"15 Min": "15",
		"30 Min": "30",
		"45 Min": "45",
		"1 Hour": "60",
		"2 Hour": "120",
		"3 Hour": "180",
		"4 Hour": "240",
		"1 Day": "D",
		"1 Week": "W",
		"1 Month": "M",
	};

	const userSelections = {};

	bot.command("chart", (ctx) => {
		const input = ctx.message.text;
		const [, symbol = ""] = input.split(" ");

		if (!symbol) {
			return ctx.sendMessage(
				"Please provide a _*symbol*_\\. Use the correct format: *_/chart AVAXUSDT_*",
				{ parse_mode: "MarkdownV2" },
			);
		}

		const buttons = Object.keys(intervals).map((interval) =>
			Markup.button.callback(
				interval,
				`chart:${symbol.toUpperCase()}:${interval}`,
			),
		);

		userSelections[ctx.from.id] = null;

		return ctx.reply(
			"Please select an interval:",
			Markup.inlineKeyboard(buttons, { columns: 4 }),
			{ reply_to_message_id: ctx.message.message_id },
		);
	});

	bot.action(/chart:(.+):(.+)/, async (ctx) => {
		if (userSelections[ctx.from.id]) {
			return;
		}

		userSelections[ctx.from.id] = ctx.match[0];

		await ctx.answerCbQuery();
		await ctx.deleteMessage();

		const [, symbol, interval] = ctx.match;

		const intervalValue = intervals[interval];

		await ctx.sendChatAction("upload_photo");
		const url = await ssChart(symbol, intervalValue);

		await ctx.replyWithPhoto(
			{ source: "chart.png" },
			{
				caption: url,
				parse_mode: "Markdown",
			},
		);
	});
}
