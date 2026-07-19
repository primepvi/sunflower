import type { CommandFlags } from "./create-command.js";

export function parseArgs(rawArgs: string[]) {
	const args: string[] = [];
	const flags: CommandFlags = {};

	let cursor = 0;

	while (cursor < rawArgs.length) {
		const current = rawArgs[cursor];

		if (current && !current.startsWith("-")) {
			args.push(current);
			cursor++;
			continue;
		}

		const name = current.replace(/^--?/, "");
		const next = rawArgs[cursor + 1];

		if (next && !next.startsWith("-")) {
			flags[name] = next;
			cursor += 2;
		} else {
			flags[name] = true;
			cursor++;
		}
	}

	return { args, flags };
}
