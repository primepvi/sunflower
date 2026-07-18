import type { ClientEvents } from "discord.js";

export type EventName = keyof ClientEvents;
export interface EventData<T extends EventName = EventName> {
  name: T;
  once: boolean;
  execute(...args: ClientEvents[T]): unknown | Promise<unknown>;
}

export function createEvent<T extends EventName>(data: EventData<T>): EventData<T> {
  return {
    name: data.name,
    once: data.once ?? false,
    execute: data.execute
  };
}
