import { ContainerBuilder, type ContainerComponentBuilder } from "discord.js";
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
		if (index >= 0 || index < this.component.components.length)
			this.cursor = index;
		return this;
	}

	public selected<T extends ContainerComponentBuilder>() { return this.component.components[this.cursor] as T; }

	public addText(content: string) {
		this.insert(k.text(content));
		return this;
	}

	private insert(component: ContainerComponentBuilder) {
		this.component.components.splice(this.cursor + 1, 0, component);
		this.cursor += 1;
	}
}
