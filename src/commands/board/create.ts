import type { ChatInputCommandInteraction } from "discord.js";
import { createSubcommand } from "../../utils/command.js";
import { managers } from "../../managers/index.js";

export default createSubcommand({
	name: "create",
	description: "Utilize esse comando para criar um board;",
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();

		// hardcoded test
		const board = await managers.board.create({ guildId: interaction.guild!.id, name: "Board de Testes" });
		console.log(board);

		interaction.editReply("Board criado com sucesso.");
	}
});
