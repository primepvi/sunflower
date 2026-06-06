import type { ClientEvents } from "discord.js";

export interface EventOptions<T extends keyof ClientEvents> {
	name: T;
	once: boolean;
	execute: (...args: ClientEvents[T]) => void | Promise<void>
};

export function createEvent<T extends keyof ClientEvents>(options: EventOptions<T>) {
	return options;
}

