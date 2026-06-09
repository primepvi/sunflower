import { ButtonBuilder, ComponentType, ContainerBuilder, MediaGalleryBuilder, SectionBuilder, SeparatorBuilder, ThumbnailBuilder, type ContainerComponentBuilder } from "discord.js";
import { k } from "kompozr";

function hexToRgb(hex: string): [number, number, number] {
	hex = hex.replace(/^#/, "");

	if (hex.length === 3) {
		hex = hex
			.split("")
			.map(c => c + c)
			.join("");
	}

	if (hex.length !== 6) {
		throw new Error("Invalid hex color");
	}

	const num = parseInt(hex, 16);

	return [
		(num >> 16) & 0xff,
		(num >> 8) & 0xff,
		num & 0xff,
	];
}

export class ContainerEditor {
	public cursor = -1;
	public constructor(public component: ContainerBuilder) { }

	public select(index: number) {
		if (index >= 0 && index < this.component.components.length)
			this.cursor = index;
		return this;
	}

	public deselect() {
		this.cursor = -1;
		return this;
	}

	public delete() {
		this.component.components.splice(this.cursor, 1);
		this.cursor = Math.max(0, this.cursor - 1);
		return this;
	}

	public selected<T extends ContainerComponentBuilder>() { return this.component.components[this.cursor] as T; }

	public setColor(color: string) {
		try {
			this.component.setAccentColor(hexToRgb(color));
			console.log("trocou");
		} catch (error) { console.error(error) }
	}

	public setSpoiler() {
		this.component.setSpoiler(true);
	}

	public addText(content: string) {
		this.insert(k.text(content));
		return this;
	}

	public addSeparator() {
		this.insert(k.separator.small);
		return this;
	}

	public addGallery(imageUrl: string) {
		this.insert(k.gallery({ url: imageUrl }));
		return this;
	}

	public addSection(content: string, accessory: ThumbnailBuilder | ButtonBuilder) {
		this.insert(k.section({
			accessory,
			components: [content]
		}));
		return this;
	}

	public clone() {
		const component = this.selected()!;
		switch (component.data.type) {
			case ComponentType.TextDisplay: {
				this.insert(k.text(component.data.content!));
				break;
			}
			case ComponentType.Separator: {
				this.insert(new SeparatorBuilder((component as SeparatorBuilder).toJSON()));
				break;
			}
			case ComponentType.Section: {
				this.insert(new SectionBuilder((component as SectionBuilder).toJSON()));
				break;
			}
			case ComponentType.MediaGallery: {
				this.insert(new MediaGalleryBuilder((component as MediaGalleryBuilder).toJSON()));
				break;
			}
		}
		return this;
	}

	public moveUp() {
		if (this.cursor <= 0) return this;
		const components = this.component.components;

		const aux = components[this.cursor - 1]!;
		components[this.cursor - 1] = components[this.cursor]!;
		components[this.cursor] = aux;

		this.cursor -= 1;
		return this;
	}

	public moveDown() {
		const components = this.component.components;
		if (this.cursor >= components.length - 1) return this;

		const aux = components[this.cursor + 1]!;
		components[this.cursor + 1] = components[this.cursor]!;
		components[this.cursor] = aux;

		this.cursor += 1;
		return this;
	}

	private insert(component: ContainerComponentBuilder) {
		this.cursor = this.component.components.length - 1;
		const index = this.cursor + 1;

		this.component.components.splice(index, 0, component);
		this.cursor = index;
	}
}
