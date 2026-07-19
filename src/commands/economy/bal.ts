import type { Message } from "discord.js";
import { createCommand } from "../../utils/create-command.js";
import { bot } from "../../bot.js";
import { db } from "../../database/index.js";
import { sanitizeMention } from "../../utils/sanitize-mention.js";

export default createCommand({
	name: "bal",
	aliases: ["balance", "atm"],
	execute(message: Message, args: string[], flags: Record<string, string>) {
		const rawUserId = flags.user || flags.u || message.mentions.users.first()?.id || message.author.id;
		const userId = sanitizeMention(rawUserId);

		const userCoins = (db.get(`${message.guildId}.members.${userId}.coins`) ?? 0) as number;
		const user = bot.users.cache.get(userId)!;

		if (!user) {
			return message.reply(`> ❌ **|** ${message.author}, **não** foi **possível encontrar** o **usuário** \`${userId}\`.`);
		}

		return message.reply(`> 🪙 **|** ${user}, ${userId == message.author.id ? "você" : ""} possui \`${userCoins}\` **moedas**.`);
	}
});
