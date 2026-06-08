import { ComponentType, StringSelectMenuInteraction, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { BoardEditorView } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.StringSelect,
	name: "bd_container_menu",
	authorOnly: true,
	async execute(interaction: StringSelectMenuInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const [containerIndex, _] = interaction.values[0]!.split("/");
		board.select(parseInt(containerIndex!))
		board.editor.deselect();

		const view = new BoardEditorView({
			user: interaction.user,
			editor: board
		});

		await view.update(interaction);
	}
});
