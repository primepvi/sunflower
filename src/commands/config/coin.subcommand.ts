import type { Message } from "discord.js";
import type { CommandFlags } from "../../utils/create-command.js";
import { createSubCommand } from "../../utils/create-subcommand.js";
import { db } from "../../database/index.js";
import type { GuildModel } from "../../types/models.js";

export default createSubCommand({
	parent: "config",
	name: "coin",
	aliases: [],
	execute(message: Message, args: string[], flags: CommandFlags) {
		const guildData = db.get(message.guildId!) as GuildModel;
		if (flags.set) {
			db.set(`${message.guildId}.coinName`, flags.name || guildData.coinName);
			db.set(`${message.guildId}.coinEmoji`, flags.emoji || guildData.coinEmoji);
			return message.reply(`> Setou legal.`);
		}


		if ((flags.name || flags.emoji) && flags.get) {
			const coinName = flags.name ? guildData.coinName : "";
			const coinEmoji = flags.emoji ? guildData.coinEmoji : "";
			return message.reply(`> ${coinEmoji} ${coinName}`);
		}

		return message.reply(`> Configurações da moeda do servidor:\n - Nome: ${guildData.coinName}\n - Emoji: ${guildData.coinEmoji}`);
	},
});
