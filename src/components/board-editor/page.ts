import { ButtonInteraction, ComponentType, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { BoardEditorView } from "../../views/board/editor.view.js";

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
		switch (page) {
			case "home": {
				board.editor.deselect();
				break;
			}
		}


		const view = new BoardEditorView({
			editor: board,
			user: interaction.user
		});

		await view.update(interaction);
	}
});
