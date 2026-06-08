import { ButtonInteraction, ComponentType, SeparatorBuilder, SeparatorSpacingSize, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { BoardEditorView } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_edit_separator",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const component = board.editor.selected<SeparatorBuilder>();
		const property = args[1]!;
		if (property == "visibility")
			component.setDivider(!component.data.divider);
		else if (property == "spacing") component.setSpacing(component.data.spacing === SeparatorSpacingSize.Small ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small);

		const view = new BoardEditorView({
			user: interaction.user,
			editor: board,
		})

		await view.update(interaction);
	}
});
