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
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const boardData = await managers.board.create({
			guildId: interaction.guild!.id,
			name: board.name
		});
		boardData.containers = board.containers.map(c =>
			c.setSpoiler(false).toJSON()
		);

		boardData.fields = board.fields;
		await boardData.save();

		await interaction.update({ components: [k.text(`O board "${board.name}" foi criado com sucesso.`)] });
	}
});
