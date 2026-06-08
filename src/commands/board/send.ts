import { ContainerBuilder, type ChatInputCommandInteraction } from "discord.js";
import { createSubcommand } from "../../utils/command.js";
import { opts } from "../../utils/command-opts.js";
import { managers } from "../../managers/index.js";

export default createSubcommand({
	name: "send",
	description: "Utilize esse comando para enviar um board;",
	options: [
		opts.string({ name: "name", description: "Insira aqui o nome do board.", required: true })
	],
	async execute(interaction: ChatInputCommandInteraction) {
		const boardName = interaction.options.getString("name", true);
		const board = await managers.board.get({ guildId: interaction.guild!.id, name: boardName });
		if (!board) {
			interaction.reply(`Não foi possível encontrar este board.`);
			return;
		}

		const containerData = board.containers[0];
		const container = new ContainerBuilder(containerData);

		await interaction.reply({ components: [container], flags: ["IsComponentsV2"] });
	}
});
