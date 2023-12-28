import { table, getBorderCharacters } from "table";
import { ssPair } from "../functions/ssPair.js";
import { dexScreener } from "../functions/dexScreener.js";
import { Markup } from "telegraf";

export default async function dex(bot) {
	bot.command("dex", (ctx) => {
		const input = ctx.message.text;
		const [, coinInput = ""] = input.split(" ");

		const coinToChainMap = {
			avax: "avalanche",
			eth: "ethereum",
			sol: "solana",
			arb: "arbitrum",
			matic: "polygon",
		};

		const chain = coinToChainMap[coinInput];

		if (!chain) {
			ctx.reply(
				'Invalid input. Coin must be "avax", "eth", "sol", "arb" or "matic"',
			);
			return;
		}

		function formatNumber(num) {
			if (num >= 1e9) {
				return (num / 1e9).toFixed(2) + "B";
			}
			if (num >= 1e6) {
				return (num / 1e6).toFixed(2) + "M";
			}
			if (num >= 1e3) {
				return (num / 1e3).toFixed(2) + "K";
			}
			return num.toString();
		}

		dexScreener(chain).then(async (output) => {
			if (!output) {
				console.error("Error: output from dex(config) is undefined");
				return;
			}

			const tableData = output.map((item) => [
				item.baseTokenSymbol,
				formatNumber(item.marketCap),
				formatNumber(item.volumeH24),
				item.priceChangeH6,
			]);

			tableData.unshift(["Symbol", "MCap", "Vol24h", "6h"]);
			const config = {
				border: getBorderCharacters("ramac"),
			};

			const data = table(tableData, config);

			const markdownTable = "```\n" + data + "\n```";
			await ctx.replyWithMarkdownV2(markdownTable);

			const buttons = output.map((item) =>
				Markup.button.callback(
					item.baseTokenSymbol,
					`dex:${item.pairAddress}:${item.chainId}`,
				),
			);
			ctx.reply(
				"Select symbol:",
				Markup.inlineKeyboard(buttons, { columns: 4 }),
			);
		});
	});

	bot.action(/dex:(.+):(.+)/, async (ctx) => {
		await ctx.answerCbQuery();
		await ctx.deleteMessage();
		const [, pairAddress, chainId] = ctx.match;
		const result = await ssPair(pairAddress, chainId);
		await ctx.replyWithPhoto(
			{ source: "screenshot.png" },
			{
				caption: `[${result.legendSourceTitle}](${result.swapLink})`,
				parse_mode: "Markdown",
			},
		);
	});
}
