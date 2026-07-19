import type { Message } from "discord.js";
import { createCommand } from "../../utils/create-command.js";
import { bot } from "../../bot.js";

export default createCommand({
	name: "ping",
	aliases: [],
	execute(message: Message, args: string[]) {
		return message.reply(`> 🏓 **| Pong!** Minha **latência** é de \`${bot.ws.ping}\`**ms**.`);
	}
});
