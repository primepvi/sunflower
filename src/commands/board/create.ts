import type { ChatInputCommandInteraction } from "discord.js";
import { createSubcommand } from "../../utils/command.js";
import { opts } from "../../utils/command-opts.js";
import { ContainerEditor } from "../../structs/container-editor.js";
import { BoardEditorView } from "../../views/board/editor.view.js";
import { bot } from "../../bot.js";

export default createSubcommand({
	name: "create",
	description: "Utilize esse comando para criar um board;",
	options: [
		opts.string({ name: "name", description: "Insira aqui o nome do board.", required: true })
	],
	async execute(interaction: ChatInputCommandInteraction) {
	        const boardName = interaction.options.getString("name", true);

		const editor = new ContainerEditor();
		bot.editors.set(interaction.user.id, editor);

		const view = new BoardEditorView({
			user: interaction.user,
			editor,
			page: "home"
		});

		await view.open(interaction);
	}
});
