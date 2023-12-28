export default async function salam(bot) {
	bot.command("salam", (ctx) => {
		return ctx.reply(`Salam ${ctx.message.from.username}`);
	});
}
