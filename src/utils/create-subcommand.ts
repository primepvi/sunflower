import type { CommandData } from "./create-command.js";

export interface SubCommandData extends CommandData {
  parent: string;
}

export function createSubCommand(data: SubCommandData): SubCommandData {
  return data;
}
