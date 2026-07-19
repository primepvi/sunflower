import type { OmitPartialGroupDMChannel, Message } from "discord.js";
import { createEvent } from "../utils/create-event.js";
import { bot } from "../bot.js";
import { parseArgs } from "../utils/parse-args.js";
import { db } from "../database/index.js";
import type { GuildMemberModel, GuildModel, UserModel } from "../types/models.js";

export default createEvent({
	name: "messageCreate",
	once: false,
	async execute(message: OmitPartialGroupDMChannel<Message<boolean>>) {
		if (!message.content.startsWith(bot.prefix) || !message.inGuild() || message.author.bot)
			return;

		const guildData = db.get(message.guildId) as GuildModel | null;
		if (!guildData) {
			db.set(message.guildId, {
				id: message.guildId,
				coinName: "Moeda",
				coinEmoji: ":coin:"
			} satisfies GuildModel);
		}

		const userData = db.get(message.author.id) as UserModel | null;
		if (!userData) {
			db.set(message.author.id, {
				id: message.author.id
			} satisfies UserModel);
		}

		const guildMemberData = db.get(`${message.guildId}.members.${message.author.id}`);
		if (!guildMemberData) {
			db.set(`${message.guildId}.members.${message.author.id}`, {
				userId: message.author.id,
				guildId: message.guildId,
				coins: 100
			} satisfies GuildMemberModel);
		}

		const rawArgs = message.content.trim().slice(bot.prefix.length).split(" ");
		const commandName = rawArgs.shift()!
		const { args, flags } = parseArgs(rawArgs);

		const command = bot.commands.get(commandName) || bot.commands.find(c => c.aliases.includes(commandName));

		if (!command) {
			return await message.reply({
				content: "Comando não encontrado.",
			});
		}

		await command.execute(message, args, flags);
	}
});
