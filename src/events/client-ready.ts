import type { Client } from "discord.js";
import { createEvent } from "../utils/event.js";

export default createEvent({
	name: "clientReady",
	once: true,
	execute(client: Client<true>) {
	  console.log(`[bot:ready] o bot está online no user "${client.user.username}"`);
	}
});
