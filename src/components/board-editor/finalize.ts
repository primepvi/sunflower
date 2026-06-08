import { ButtonInteraction, ComponentType, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { BoardEditorView } from "../../views/board/editor.view.js";
import { k } from "kompozr";
import { managers } from "../../managers/index.js";

export default createComponent({
	type: ComponentType.Button,
	authorOnly: true,
	name: "bd_finalize",
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const editor = bot.editors.get(interaction.user.id);
		if (!editor) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const board = await managers.board.create({
			guildId: interaction.guild!.id,
			name: editor.name
		});
		board.containers.push(editor.component.toJSON());
		await board.save();

		await interaction.update({ components: [k.text(`O board "${editor.name}" foi criado com sucesso.`)] });
	}
});
