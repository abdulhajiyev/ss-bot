import fs from "fs";

export async function alphatrendCalc(
	ctx,
	symbol,
	condition_word,
	target1,
	target2,
	target3,
	intervalWord,
) {
	const data = fs.readFileSync("email.txt", "utf8");
	const paragraphs = data.split("\n\n");
	let latest_paragraph = null;
	let second_latest_paragraph = null;

	for (let i = paragraphs.length - 1; i >= 0; i--) {
		const paragraph = paragraphs[i];
		if (
			(paragraph.includes(target1) ||
				paragraph.includes(target2) ||
				paragraph.includes(target3)) &&
			paragraph.includes("Alphatrend") &&
			paragraph.includes(condition_word)
		) {
			if (latest_paragraph === null) {
				latest_paragraph = paragraph;
			} else {
				second_latest_paragraph = paragraph;
				break;
			}
		}
	}
	if (latest_paragraph === null) {
		ctx.reply(
			`No information found for ${symbol.toUpperCase()} ${intervalWord} ${condition_word} signal`,
		);
	} else if (second_latest_paragraph === null) {
		const message = `The Latest Alphatrend Signal\n\n" + ${latest_paragraph}`;
		ctx.reply(message);
	} else {
		const message = `The Latest Alphatrend ${condition_word} Signal\n\n${latest_paragraph}\n\n------\n\nThe Second to Last Alphatrend ${condition_word} Signal\n\n${second_latest_paragraph}`;
		ctx.reply(message);
	}
}