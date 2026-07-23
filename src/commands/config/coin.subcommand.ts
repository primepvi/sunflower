import type { Message } from "discord.js";
import type { CommandFlags } from "../../utils/create-command.js";
import { createSubCommand } from "../../utils/create-subcommand.js";
import type { GuildModel } from "../../types/models.js";
import { bot } from "../../bot.js";
import { emojis } from "../../utils/emojis.js";

export default createSubCommand({
	parent: "config",
	name: "coin",
	aliases: [],
	execute(message: Message, args: string[], flags: CommandFlags) {
		const guildData = bot.db.get<GuildModel>(message.guildId!)!;
		if (flags.set) {
			bot.db.set(`${message.guildId}.coinName`, flags.name || guildData.coinName);
			bot.db.set(`${message.guildId}.coinEmoji`, flags.emoji || guildData.coinEmoji);
			return message.reply(`> ${emojis.icon_ok} **| Sucesso!** ${message.author}, as **configurações** da **moeda do servidor** foram **alteradas**. .`);
		}


		if ((flags.name || flags.emoji) && flags.get) {
			const coinName = flags.name ? guildData.coinName : "";
			const coinEmoji = flags.emoji ? guildData.coinEmoji : "";
			return message.reply(`> ${coinEmoji} ${coinName}`);
		}

	  return message.reply(`${emojis.icon_config_pencil} **|** ${message.author}, **veja abaixo** as **configurações** da **moeda do servidor**:\n> **[ \`--name\` ] Nome:** ${guildData.coinName}\n> **[ \`--emoji\` ] Emoji: ** ${guildData.coinEmoji}`);
	},
});
