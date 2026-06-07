import type { Interaction, CacheType, ComponentType } from "discord.js";
import { createEvent } from "../utils/event.js";
import { bot } from "../bot.js";
import type { ComponentInteraction } from "../utils/component.js";

export default createEvent({
	name: "interactionCreate",
	once: false,
	async execute(interaction: Interaction<CacheType>) {
		if (!interaction.inGuild())
			return;

		if (interaction.isAnySelectMenu() || interaction.isButton()) {
			const [componentName, ...componentArgs] = interaction.customId.split("/");
			const component = bot.components.find(
				(c) => c.name === componentName && c.type == interaction.componentType,
			);

			if (!component) {
				interaction.reply({
					content: "Não foi possível encontrar esse componente.",
					flags: ["Ephemeral"],
				});
				return;
			}

			if (component.authorOnly && interaction.user.id !== componentArgs[0]) {
				interaction.reply({
					content: "Essa interação não é para você.",
					flags: ["Ephemeral"],
				});
				return;
			}

			try {
				await component.execute(interaction as ComponentInteraction<ComponentType>);
			} catch (error) {
				console.log(error);
				interaction.reply({
					content: "Ocorreu um erro ao executar esse componente.",
					flags: ["Ephemeral"],
				});
				return;
			}
		}

		if (interaction.isChatInputCommand()) {
			const executeCommand = bot.getCommandHandler(interaction);
			if (!executeCommand) {
				interaction.reply({ content: "Não foi possível encontrar esse comando.", flags: ["Ephemeral"] });
				return;
			}

			try {
				await executeCommand(interaction);
			} catch (error) {
				console.log(error);
				interaction.reply({ content: "Ocorreu um erro ao executar este comando.", flags: ["Ephemeral"] });
				return;
			}
		}
	}
});
