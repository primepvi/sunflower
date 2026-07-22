import { formatEmoji } from "discord.js";
import emojiList from "../../emojis.json" with { type: "json" };

export const emojis = { ...emojiList };

for (const key of Object.keys(emojiList)) {
	const current = emojis[key as keyof typeof emojiList];
	current.toString = formatEmoji.bind(null, current);
};
