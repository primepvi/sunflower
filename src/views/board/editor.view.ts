import { ComponentType, MediaGalleryBuilder, type BaseMessageOptions, type User } from "discord.js";
import { View } from "../../structs/view.js";
import { k, type StringSelectMenuOptionData } from "kompozr";
import { e } from "../../utils/emojis.js";
import type { BoardEditor } from "../../structs/board-editor.js";

export type BoardEditorViewPageType = "home" | "edit-text-display" | "edit-separator" | "edit-section" | "edit-gallery";

export interface BoardEditorViewState {
	user: User;
	editor: BoardEditor;
}

export class BoardEditorView extends View<BoardEditorViewState> {
	public render(state?: BoardEditorViewState): BaseMessageOptions {
		const page = this.ensureCurrentPage()
		const board = this.state.editor;
		board.containers.forEach((c, i) => {
			if (page == "home") return c.setSpoiler(false);
			if (i !== board.cursor) return c.setSpoiler(true);
		});

		switch (page) {
			case "home": return this.renderHomePage();
			case "edit-section":
			case "edit-text-display": return this.renderTextDisplayEditPage();
			case "edit-separator": return this.renderSeparatorEditPage();
			case "edit-gallery": return this.renderGalleryEditPage();
		}
	}

	private ensureCurrentPage(): BoardEditorViewPageType {
		const board = this.state.editor;
		if (board.editor.cursor == -1) return "home";

		const component = board.editor
			.selected();

		switch (component?.data?.type) {
			case ComponentType.TextDisplay: return "edit-text-display";
			case ComponentType.Separator: return "edit-separator";
			case ComponentType.Section: return "edit-section";
			case ComponentType.MediaGallery: return "edit-gallery";
			default: return "home"
		}
	}

	private renderHomePage(): BaseMessageOptions {
		const board = this.state.editor;
		const addContainerBtn = k.button.secondary({
			cid: `bd_add_component/${this.state.user.id}/container`,
			label: "Adicionar Container",
			emoji: e.icon_container
		});

		const finalizeBtn = k.button.success({
			cid: `bd_finalize/${this.state.user.id}`,
			label: "Finalizar",
		});

		const containerMenuOptions = board.containers.map((c, i) => {
			return {
				value: `${i}/container`,
				label: `${i} | Container`,
				emoji: e.icon_container,
				default: board.cursor == i,
				description: `Clique aqui para editar este container.`
			} satisfies StringSelectMenuOptionData;
		});

		const containerMenu = k.select.string({
			cid: `bd_container_menu/${this.state.user.id}`,
			min: 1,
			max: 1,
			options: containerMenuOptions,
			placeholder: "Clique aqui para selecionar um container."
		})

		const deleteBtn = k.button.secondary({
			cid: `bd_delete_container/${this.state.user.id}`,
			label: "Deletar Container",
			disabled: board.containers.length <= 1,
			emoji: e.icon_trash.toString()
		});

		const moveUpBtn = k.button.secondary({
			cid: `bd_move_container/${this.state.user.id}/up`,
			disabled: board.cursor <= 0,
			emoji: e.icon_up.toString()
		});

		const moveDownBtn = k.button.secondary({
			cid: `bd_move_container/${this.state.user.id}/down`,
			disabled: board.cursor >= board.containers.length - 1,
			emoji: e.icon_down.toString()
		});

		const cloneBtn = k.button.secondary({
			cid: `bd_clone_container/${this.state.user.id}`,
			label: "Clonar Container",
			emoji: e.icon_clone
		});

		const addTextBtn = k.button.secondary({
			cid: `bd_add_component/${this.state.user.id}/text`,
			label: "Adicionar Texto",
			emoji: e.icon_text_display
		});

		const addSeparatorBtn = k.button.secondary({
			cid: `bd_add_component/${this.state.user.id}/separator`,
			label: "Adicionar Separador",
			emoji: e.icon_separator
		});

		const addGaleryBtn = k.button.secondary({
			cid: `bd_add_component/${this.state.user.id}/gallery`,
			label: "Adicionar Galeria",
			emoji: e.icon_image
		});

		const editContainerColorBtn = k.button.secondary({
			cid: `bd_container_color/${this.state.user.id}`,
			label: "Alterar Cor",
			emoji: e.icon_color
		});

		const containerActions = k.row(moveUpBtn, moveDownBtn, deleteBtn, cloneBtn, editContainerColorBtn);
		const containerActions2 = k.row(addContainerBtn, addTextBtn, addSeparatorBtn, addGaleryBtn, finalizeBtn)

		return { components: [...board.containers, containerMenu, this.prepareComponentMenu(), containerActions, containerActions2], };
	}

	private renderTextDisplayEditPage(): BaseMessageOptions {
		const board = this.state.editor;

		const editContentBtn = k.button.secondary({
			cid: `bd_edit_content/${this.state.user.id}`,
			label: "Editar Conteúdo",
			emoji: e.icon_edit_text
		});

		const editThumbnailBtn = k.button.secondary({
			cid: `bd_edit_thumbnail/${this.state.user.id}`,
			label: "Editar Thumbnail",
			emoji: e.icon_image
		});

		return { components: [...board.containers, this.prepareComponentMenu(), k.row(editContentBtn, editThumbnailBtn), this.prepareComponentActions()] };
	}

	private renderSeparatorEditPage(): BaseMessageOptions {
		const board = this.state.editor;

		const toggleVisibilityBtn = k.button.secondary({
			cid: `bd_edit_separator/${this.state.user.id}/visibility`,
			label: "Mudar Visibilidade",
			emoji: e.icon_opacity
		});

		const toggleSpacingBtn = k.button.secondary({
			cid: `bd_edit_separator/${this.state.user.id}/spacing`,
			label: "Mudar Espaçamento",
			emoji: e.icon_spacing
		});

		return { components: [...board.containers, this.prepareComponentMenu(), k.row(toggleVisibilityBtn, toggleSpacingBtn), this.prepareComponentActions()] };
	}

	private renderGalleryEditPage(): BaseMessageOptions {
		const board = this.state.editor;

		const addImageBtn = k.button.secondary({
			cid: `bd_gallery_add_image/${this.state.user.id}`,
			label: "Adicionar Imagem",
			emoji: e.icon_image
		});

		const editImageBtn = k.button.secondary({
			cid: `bd_gallery_edit_image/${this.state.user.id}`,
			label: "Editar Imagem",
			emoji: e.icon_edit_text
		});

		const deleteImageBtn = k.button.secondary({
			cid: `bd_gallery_delete_image/${this.state.user.id}`,
			label: "Remover Imagem",
			emoji: e.icon_trash,
			disabled: board.editor.selected<MediaGalleryBuilder>().items.length <= 1
		});

		return { components: [...board.containers, this.prepareComponentMenu(), k.row(addImageBtn, editImageBtn, deleteImageBtn), this.prepareComponentActions()] };
	}

	private prepareComponentActions() {
		const board = this.state.editor;
		const container = board.selected();

		const deleteBtn = k.button.secondary({
			cid: `bd_delete_component/${this.state.user.id}`,
			label: "Deletar",
			disabled: container.components.length <= 1,
			emoji: e.icon_trash.toString()
		});

		const moveUpBtn = k.button.secondary({
			cid: `bd_move_component/${this.state.user.id}/up`,
			disabled: board.editor.cursor <= 0,
			emoji: e.icon_up.toString()
		});

		const moveDownBtn = k.button.secondary({
			cid: `bd_move_component/${this.state.user.id}/down`,
			disabled: board.editor.cursor >= container.components.length - 1,
			emoji: e.icon_down.toString()
		});

		const cloneBtn = k.button.secondary({
			cid: `bd_clone_component/${this.state.user.id}`,
			label: "Clonar",
			emoji: e.icon_clone
		});

		const editContainerBtn = k.button.secondary({
			cid: `bd_page/${this.state.user.id}/home`,
			label: "Editar Container",
			emoji: e.icon_container
		});

		return k.row(moveUpBtn, moveDownBtn, deleteBtn, cloneBtn, editContainerBtn);
	}

	private prepareComponentMenu() {
		const componentMenu = k.select.string({
			cid: `bd_component_menu/${this.state.user.id}`,
			options: this.prepareComponentMenuOptions(),
			min: 1,
			max: 1,
			placeholder: "Clique aqui para selecionar um componente."
		});

		return componentMenu;
	}

	private prepareComponentMenuOptions(): StringSelectMenuOptionData[] {
		const board = this.state.editor;
		const container = board.selected();

		return container.components.map((c, i) => {
			switch (c.data.type) {
				case ComponentType.TextDisplay:
					return { label: `${i} | Texto`, value: `${i}/text`, description: "Clique aqui para editar este texto.", default: board.editor.cursor == i, emoji: e.icon_text_display } satisfies StringSelectMenuOptionData;
				case ComponentType.Separator:
					return { label: `${i} | Separador`, value: `${i}/separator`, description: "Clique aqui para editar este separador.", default: board.editor.cursor == i, emoji: e.icon_separator } satisfies StringSelectMenuOptionData;
				case ComponentType.Section:
					return { label: `${i} | Seção`, value: `${i}/section`, description: "Clique aqui para editar esta seção.", default: board.editor.cursor == i, emoji: e.icon_section } satisfies StringSelectMenuOptionData;
				case ComponentType.MediaGallery:
					return { label: `${i} | Galeria`, value: `${i}/gallery`, description: "Clique aqui para editar esta galeria.", default: board.editor.cursor == i, emoji: e.icon_image } satisfies StringSelectMenuOptionData;
				default:
					return null;
			}
		}).filter(Boolean) as StringSelectMenuOptionData[];
	}
}
