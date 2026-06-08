import { ButtonInteraction, ComponentType, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { BoardEditorView, type BoardEditorViewPageType } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_move_component",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const editor = bot.editors.get(interaction.user.id);
		if (!editor) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const direction = args[1]!;
		if (direction == "up") editor.moveUp();
		else if (direction == "down") editor.moveDown();

		const view = new BoardEditorView({
			user: interaction.user,
			editor,
		})

		await view.update(interaction);
	}
});
