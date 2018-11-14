import { Messaging, Groups, GroupUsers, Stack, StackItem } from '@zetapush/platform-legacy';
import { Injectable, Context } from '@zetapush/core';

export interface MyEvent {
	name: string;
	address: string;
	date: string;
}

export interface joinEventResponse {
	event: StackItem;
	messages: StackItem[];
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

	private generateEventID(): string {
		return Math.random().toString(36).substring(2);
	}

	async createEvent(event: MyEvent): Promise<string> {
		const eventID = this.generateEventID();
		const { exists } = await this.groups.exists({
			group: eventID
		});

		if (exists)
			return this.createEvent(event);
		await this.groups.createGroup({
			group: eventID
		});
		await this.stack.push({
			stack: eventID,
			data: event
		});
		console.log('createEvent =>', event.name, eventID);
		return eventID;
	}

	async joinEvent(eventID: string): Promise<joinEventResponse> {
		console.log('joinEvent =>', eventID);
		const { exists } = await this.groups.exists({
			group: eventID
		});

		if (!exists)
			return null;
		await this.groups.addUser({
			group: eventID,
			user: this.requestContext.owner
		});
		const { result } = await this.stack.list({
			stack: eventID
		});
		console.log('event info', result.content);
		return {
			event: result.content.pop(), // event information at the top of stack
			messages: result.content // the rest of the stack contains messages
		};
	}

	async sendMessage(eventID: string, message) {
		const group: GroupUsers = await this.groups.groupUsers({
			group: eventID
		});
		const users: string[] = group.users || [];
		const data: StackItem = {
			data: message,
			ts: Date.now()
		}

		this.messaging.send({
			channel: eventID,
			target: users,
			data: data
		});
		await this.stack.push({
			stack: eventID,
			data: data
		});
	}
}