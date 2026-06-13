import { ComponentType, ContainerBuilder, SectionBuilder, TextDisplayBuilder, type User, type GuildChannel, type Role } from "discord.js";
import type { BoardData } from "../schemas/board.schema.js";
export type BoardArgumentInput = Role | GuildChannel | User | string | boolean;

export class BoardResolver {
	public constructor(private board: BoardData, private args: Record<string, BoardArgumentInput>) { }

	public resolve(): ContainerBuilder[] {
		return this.board.containers.map((rawContainer, i) => {
			const container = new ContainerBuilder(rawContainer);
			this.resolveContainer(container);
			return container;
		});
	}

	private resolveContainer(container: ContainerBuilder) {
		for (const component of container.components) {
			switch (component.data.type) {
				case ComponentType.TextDisplay: {
					this.resolveTextDisplay(component as TextDisplayBuilder);
					break;
				}
				case ComponentType.Section: {
					this.resolveSection(component as SectionBuilder);
					break;
				}
			}
		}
	}

	private resolveArgument(field: string) {
		const fieldData = this.board.fields.find(f => f.key === field.toLowerCase())!;
		const input = this.args[field];
		switch (fieldData.type) {
			case "text": return input as string;
			case "checkbox": return input ? "Verdadeiro" : "Falso";
			case "user": {
				const data = input as User;
				return { id: data.id, name: data.username, toString() { return `<@${this.id}>`; } };
			}
			case "channel": {
				const data = input as GuildChannel;
				return { id: data.id, name: data.name, toString() { return `<#${this.id}>`; } };
			}
			case "role": {
				const data = input as Role;
				return { id: data.id, name: data.name, toString() { return `<@&${this.id}>`; } };
			}
		}

	}

	private resolveTextDisplay(component: TextDisplayBuilder) {
		let content = component.data.content!;
		const interpolations = content.matchAll(/\{\{(.*?)\}\}/g).toArray();
		for (const interpolationData of interpolations) {
			const interpolation = interpolationData[1]!;
			const [fieldName, fieldProperty, ..._rest] = interpolation.split(".") as [string, string?, string[]?];
			const argumentData = this.resolveArgument(fieldName)
			const value = fieldProperty ? argumentData[fieldProperty as keyof typeof argumentData] : argumentData;
			content = content.replaceAll(`{{${interpolation}}}`, value.toString());
		}

		component.setContent(content);
	}

	private resolveSection(component: SectionBuilder) {
		const textComponent = component.components[0] as TextDisplayBuilder;
		this.resolveTextDisplay(textComponent);
	}
}
