import { ButtonInteraction, ComponentType, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { BoardEditorView, type BoardEditorViewPageType } from "../../views/board/editor.view.js";
import type { BoardEditor } from "../../structs/board-editor.js";

export default createComponent({
	type: ComponentType.Button,
	authorOnly: true,
	name: "bd_page",
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const [_userId, page, ..._rest] = args;
		const view = new BoardEditorView({
			editor: board,
			user: interaction.user,
			page: page as BoardEditorViewPageType
		});

		await view.update(interaction);
	}
});
