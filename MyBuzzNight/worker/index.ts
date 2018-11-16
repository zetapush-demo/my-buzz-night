import { Messaging, Groups, GroupUsers, Stack, StackItem, Zpfs_hdfs, FileUploadLocation } from '@zetapush/platform-legacy';
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

const HACK = <any>(Zpfs_hdfs);
HACK.DEPLOYMENT_OPTIONS = {
	upload_user_provides_filename: true,
	upload_thumbnails: '80'
};

@Injectable()
export default class Api {

	private requestContext: Context;

	constructor(
		private messaging: Messaging,
		private groups: Groups,
		private stack: Stack,
		private hdfs: Zpfs_hdfs,
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
		return eventID;
	}

	async joinEvent(eventID: string): Promise<joinEventResponse> {
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

		if (!result || !result.content.length)
			return null;
		return {
			event: result.content.pop(), // event information at the top of stack
			messages: result.content.reverse().map(x => { // the rest of the stack contains messages
				return {
					data: x.data.url,
					ts: x.ts
				};
			})
		};
	}

	async sendMessage(input: {eventID: string, url: any}) {
		const group: GroupUsers = await this.groups.groupUsers({
			group: input.eventID
		});
		const users: string[] = group.users || [];
		const data: StackItem = {
			data: input.url,
			ts: Date.now()
		}

		console.log('message:', data);
		this.messaging.send({
			channel: input.eventID,
			target: users,
			data: data
		});
		await this.stack.push({
			stack: input.eventID,
			data: {
				url: input.url
			}
		});
	}

	async getImageUploadURL(input: {eventID: string, name: string, type: string}): Promise<FileUploadLocation> {
		const path = `/${input.eventID}_${this.requestContext.owner}_${input.name}`;
		const file = await this.hdfs.stat({ path });

		if (file.entry)
			await this.hdfs.rm({ path });
		return await this.hdfs.newUploadUrl({
			contentType: input.type,
			path
		});
	}

	async getImageURL(guid: string): Promise<string> {
		const request = await this.hdfs.newFile({
			guid
		});

		return request.url.url;
	}
}