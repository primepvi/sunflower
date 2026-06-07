import { ComponentType, StringSelectMenuInteraction, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { BoardEditorView } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.StringSelect,
	name: "bd_component_menu",
	authorOnly: true,
	async execute(interaction: StringSelectMenuInteraction<CacheType>, args: string[]) {
	  const editor = bot.editors.get(interaction.user.id);
	  if (!editor) {
	    interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"]});
	    return;
	  }

	  const [componentIndex, componentType] = interaction.values[0]!.split("/");
	  editor.select(parseInt(componentIndex!))

	  const view = new BoardEditorView({
	    user: interaction.user,
	    editor,
	    page: "edit-text-display"
	  });

	  await view.update(interaction);
	}
});
