import { ButtonInteraction, ComponentType, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { BoardEditorView } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.Button,
	authorOnly: true,
	name: "bd_home",
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const editor = bot.editors.get(interaction.user.id);
		if (!editor) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		editor.deselect();
		const view = new BoardEditorView({
			editor,
			user: interaction.user
		});

		await view.update(interaction);
	}
});
