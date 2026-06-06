import type { ChatInputCommandInteraction } from "discord.js";
import { createCommand } from "../../utils/command.js";
import { bot } from "../../bot.js";

export default createCommand({
	name: "ping",
	description: "Utilize esse comando para ver minha latência.",
	execute(interaction: ChatInputCommandInteraction) {
		interaction.reply(`Ping: ${bot.ws.ping}`);
	}
});
