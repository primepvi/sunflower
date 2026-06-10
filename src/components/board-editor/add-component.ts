import { ButtonInteraction, ComponentType, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { BoardEditorView } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_add_component",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const componentType = args[1]!;

		switch (componentType) {
			case "text": {
				board.editor.addText("Insira seu texto aqui");
				break;
			}
			case "separator": {
				board.editor.addSeparator();
				break;
			}
			case "container": {
				board.editor.deselect();
				board.addContainer();
				board.editor.deselect();
				break;
			}
			case "gallery": {
				board.editor.addGallery(bot.user?.displayAvatarURL({ size: 2048, extension: "png" })!)
				break;
			}
		}

		const view = new BoardEditorView({
			user: interaction.user,
			editor: board
		})

		bot.editors.set(interaction.user.id, board);

		await view.update(interaction);
	}
});
