import { CheckboxBuilder, ContainerBuilder, GuildChannel, ModalBuilder, ModalSubmitInteraction, Role, type ChatInputCommandInteraction, type TextBasedChannel } from "discord.js";
import { createSubcommand } from "../../utils/command.js";
import { opts } from "../../utils/command-opts.js";
import { managers } from "../../managers/index.js";
import { BoardValidator } from "../../structs/board-validator.js";
import { BoardResolver, type BoardArgumentInput } from "../../structs/board-resolver.js";
import { k } from "kompozr";

export default createSubcommand({
	name: "send",
	description: "Utilize esse comando para enviar um board;",
	options: [
		opts.string({ name: "name", description: "Insira aqui o nome do board.", required: true })
	],
	async execute(interaction: ChatInputCommandInteraction) {
		const boardName = interaction.options.getString("name", true);
		const board = await managers.board.get({ guildId: interaction.guild!.id, name: boardName });
		if (!board) {
			interaction.reply(`Não foi possível encontrar este board.`);
			return;
		}

		const validator = new BoardValidator(board);
		const responses = validator.validate();
		if (responses.length > 0) {
			await interaction.reply(responses.map(r => r.message!).join("\n"));
			return;
		}

		if (board.fields.length > 0) {
			const inputs = board.fields.map(field => {
				switch (field.type) {
					case "text": return k.input.paragraph({
						cid: field.key,
						label: field.label,
						description: "Insira aqui o texto.",
						required: true,
						min: 1
					});
					case "checkbox": return k.label({
						label: field.label,
						// @ts-ignore
						component: new CheckboxBuilder().setCustomId(field.key)
					});
					case "user": {
						const menu = k.select.user({
							cid: field.key,
							max: 1,
							min: 1,
							placeholder: "Selecione um usuário."
						});

						return k.label({
							label: field.label,
							component: menu
						});
					}
					case "channel": {
						const menu = k.select.channel({
							cid: field.key,
							max: 1,
							min: 1,
							placeholder: "Selecione um canal."
						});

						return k.label({
							label: field.label,
							component: menu
						});
					}
					case "role": {
						const menu = k.select.user({
							cid: field.key,
							max: 1,
							min: 1,
							placeholder: "Selecione um cargo."
						});

						return k.label({
							label: field.label,
							component: menu
						});
					}
				}
			});

			const modal = k.modal({
				cid: `board_send_modal`,
				title: "Enviar Board",
				inputs
			})

			await interaction.showModal(modal);

			const filter = (i: ModalSubmitInteraction) => i.customId === `board_send_modal` && i.user.id === interaction.user.id;

			try {
				const response = await interaction.awaitModalSubmit({
					time: 1000 * 60,
					filter
				});


				const args: Record<string, BoardArgumentInput> = Object.create({});

				for (const field of board.fields) {
					switch (field.type) {
						case "text": {
							args[field.key] = response.fields.getTextInputValue(field.key);
							break;
						}
						case "checkbox": {
							args[field.key] = response.fields.getCheckbox(field.key).toString();
							break;
						}
						case "user": {
							args[field.key] = response.fields.getSelectedUsers(field.key, true).toJSON()[0]!;
							break;
						}
						case "channel": {
							args[field.key] = response.fields.getSelectedChannels(field.key, true).toJSON()[0]! as GuildChannel;
							break;
						}
						case "role": {
							args[field.key] = response.fields.getSelectedRoles(field.key, true).toJSON()[0]! as Role;
							break;
						}

					}
				}

				const resolver = new BoardResolver(board, args);
				const containers = resolver.resolve();
				await response.reply({ components: [...containers], flags: ["IsComponentsV2"] });
			} catch { }
		} else {
			const resolver = new BoardResolver(board, {});
			const containers = resolver.resolve();
			await interaction.reply({ components: [...containers], flags: ["IsComponentsV2"] });
		}
	}
});
