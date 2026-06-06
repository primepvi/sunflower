import type { Interaction, CacheType } from "discord.js";
import { createEvent } from "../utils/event.js";
import { bot } from "../bot.js";

export default createEvent({
	name: "interactionCreate",
	once: false,
	async execute(interaction: Interaction<CacheType>) {
		if (!interaction.isChatInputCommand() || !interaction.inGuild())
			return;

		const command = bot.commands.get(interaction.commandName);
		if (!command) {
			interaction.reply({ content: "Não foi possível encontrar esse comando.", flags: ["Ephemeral"] });
			return;
		}

		try {
			await command.execute(interaction);
		} catch {
			interaction.reply({ content: "Ocorreu um erro ao executar este comando.", flags: ["Ephemeral"] });
		}
	}
});
