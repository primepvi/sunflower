import type { Client } from "discord.js";
import { createEvent } from "../utils/event.js";
import { bot } from "../bot.js";

export default createEvent({
	name: "clientReady",
	once: true,
	async execute(client: Client<true>) {
		console.log(`[bot:ready] o bot está online no user "${client.user.username}"`);

		const guild = await bot.guilds.fetch(process.env.BOT_GUILD_ID!);
		await guild.commands.set(bot.commands.toJSON());
		console.log(`[commands:registered] os comandos foram registrados na guilda de testes: "${guild.name}".`);

	}
});
