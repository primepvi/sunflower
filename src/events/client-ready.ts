import type { Client } from "discord.js";
import { createEvent } from "../utils/create-event.js";

export default createEvent({
	name: "clientReady",
	once: false,
	execute(client: Client<true>) {
		console.log(`Logged as ${client.user.username}.`);
	}
});
