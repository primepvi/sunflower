import type { OmitPartialGroupDMChannel, Message } from "discord.js";
import { createEvent } from "../utils/create-event.js";
import { bot } from "../bot.js";
import { parseArgs } from "../utils/parse-args.js";
import type { GuildMemberModel, GuildModel, UserModel } from "../types/models.js";

export default createEvent({
	name: "messageCreate",
	once: false,
	async execute(message: OmitPartialGroupDMChannel<Message<boolean>>) {
		if (!message.content.startsWith(bot.prefix) || !message.inGuild() || message.author.bot)
			return;

		const guildData = bot.db.get<GuildModel>(message.guildId);
		if (!guildData) {
			bot.db.set(message.guildId, {
				id: message.guildId,
				coinName: "Moeda",
				coinEmoji: ":coin:"
			} satisfies GuildModel);
		}

		const userData = bot.db.get<UserModel>(message.author.id);
		if (!userData) {
			bot.db.set(message.author.id, {
				id: message.author.id
			} satisfies UserModel);
		}

		const guildMemberData = bot.db.get(`${message.guildId}.members.${message.author.id}`);
		if (!guildMemberData) {
			bot.db.set(`${message.guildId}.members.${message.author.id}`, {
				userId: message.author.id,
				guildId: message.guildId,
				coins: 100
			} satisfies GuildMemberModel);
		}

		const rawArgs = message.content.trim().slice(bot.prefix.length).split(" ");
		const commandName = rawArgs.shift()!
		const { args, flags } = parseArgs(rawArgs);

		const command = bot.commands.get(commandName) || bot.commands.find(c => c.aliases.includes(commandName));
		const subCommand = bot.subCommands.get(`${commandName}_${args[0]}`);

		if (subCommand) {
			return await subCommand.execute(message, args, flags);
		} else if (command) {
			return await command.execute(message, args, flags);
		} else {
			return await message.reply({
				content: "Comando não encontrado.",
			});
		}
	}
});
