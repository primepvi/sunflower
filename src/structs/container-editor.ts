import { ButtonBuilder, ComponentType, ContainerBuilder, SectionBuilder, SeparatorBuilder, ThumbnailBuilder, type ContainerComponentBuilder } from "discord.js";
import { k } from "kompozr";

export class ContainerEditor {
	public cursor = -1;
	public component: ContainerBuilder;

	public constructor(component?: ContainerBuilder) {
		this.component = component || k.container({
			color: "Yellow",
			components: ["Insira seu texto aqui."]
		})
	}

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
		this.cursor -= 1;
		return this;
	}

	public selected<T extends ContainerComponentBuilder>() { return this.component.components[this.cursor] as T; }

	public addText(content: string) {
		this.insert(k.text(content));
		return this;
	}

	public addSeparator() {
		this.insert(k.separator.small);
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
