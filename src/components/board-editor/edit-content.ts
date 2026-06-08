import { ButtonInteraction, ComponentType, ModalSubmitInteraction, SectionBuilder, TextDisplayBuilder, type CacheType } from "discord.js";
import { createComponent } from "../../utils/component.js";
import { bot } from "../../bot.js";
import { k } from "kompozr";
import { BoardEditorView } from "../../views/board/editor.view.js";

export default createComponent({
	type: ComponentType.Button,
	name: "bd_edit_content",
	authorOnly: true,
	async execute(interaction: ButtonInteraction<CacheType>, args: string[]) {
		const board = bot.editors.get(interaction.user.id);
		if (!board) {
			await interaction.reply({ content: "Esse editor de board foi fechado.", flags: ["Ephemeral"] });
			return;
		}

		const component = board.editor.selected<TextDisplayBuilder | SectionBuilder>();
		const text = component.data.type === ComponentType.TextDisplay ?
			component as TextDisplayBuilder :
			(component as SectionBuilder).components[0]! as TextDisplayBuilder;

		const modal = k.modal({
			cid: `bd_edit_content_modal`,
			title: "Editar Thumbnail",
			inputs: [k.input.paragraph({
				cid: "content",
				label: "Texto",
				description: "Insira abaixo a novo conteúdo:",
				required: true,
				value: text.data.content!,
				min: 1,
			})]
		});
		await interaction.showModal(modal);

		const filter = (i: ModalSubmitInteraction) => i.customId === `bd_edit_content_modal` && i.user.id === interaction.user.id;

		try {
			const response = await interaction.awaitModalSubmit({
				time: 1000 * 60,
				filter
			});

			const content = response.fields.getTextInputValue("content");
			if (component.data.type === ComponentType.TextDisplay)
				(component as TextDisplayBuilder).setContent(content);
			else if (component.data.type === ComponentType.Section)
				(component as SectionBuilder).spliceTextDisplayComponents(0, 1, k.text(content));

			const view = new BoardEditorView({
				user: interaction.user,
				editor: board
			});

			await interaction.message.edit(view.render());
			await response.reply({ content: "Você editou o conteudo com sucesso.", flags: ["Ephemeral"] });
		} catch (error) { console.error(error) }
	}
});

