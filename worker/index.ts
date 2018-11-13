import { Messaging, Groups, GroupUsers, Stack } from '@zetapush/platform-legacy';
import { Injectable, Context } from '@zetapush/core'

export interface MyEvent {
	name: string;
	address: string;
	date: string;
}

@Injectable()
export default class Api {

	private requestContext: Context;

	constructor(
		private messaging: Messaging,
		private groups: Groups,
		private stack: Stack,
	) { }

	/*
	 * Parse a randomly generated number in string as a base number 36
	 */

	private generateEventID() {
		return Math.random().toString(36).substring(2);
	}

	async createEvent(event: MyEvent): Promise<string> {
		const newEventId = this.generateEventID();

		const { exists } = await this.groups.exists({
			group: newEventId
		});

		if (exists)
			return this.createEvent(event);
		await this.groups.createGroup({
			group: newEventId
		});
		await this.stack.push({
			stack: newEventId,
			data: event
		});
		return newEventId;
	}

	async joinEvent(eventID: string) {
		await this.groups.addUser({
			group: eventID,
			user: this.requestContext.owner
		});
		const { result } = await this.stack.list({
			stack: eventID
		});
		return {
			event: result.content.pop(),
			message: result.content
		};
	}

	async sendMessage(eventID: string, message) {
		const group: GroupUsers = await this.groups.groupUsers({
			group: eventID
		});
		const users: string[] = group.users || [];

		this.messaging.send({
			channel: eventID,
			target: users,
			data: message
		});
	}
}