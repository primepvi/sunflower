import { ButtonInteraction, ComponentType, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { BoardEditorView } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_add_component",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const editor = bot.editors.get(interaction.user.id);
		if (!editor) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

	  const componentType = args[1]!;
	  
	  switch (componentType) {
	    case "text": {
	      editor.addText("Insira seu texto aqui");
	      break;
	    }
	    case "separator": {
	      editor.addSeparator();
	      break;
	    }
	  }

	  const view = new BoardEditorView({
	    user: interaction.user,
	    editor
	  })

	  bot.editors.set(interaction.user.id, editor);

	  await view.update(interaction);
	}
});
