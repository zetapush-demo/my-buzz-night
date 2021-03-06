import { Messaging, Groups, GroupUsers, Stack, StackItem, Zpfs_hdfs, FileUploadLocation } from '@zetapush/platform-legacy';
import { Injectable, RequestContext } from '@zetapush/core';

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

	private requestContext: RequestContext;

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

	/*
	 * Create event if it doesn't already exist by generating new eventID.
	 * With this eventID, create group to users and stack to store data.
	 */

	 async createEvent(event: MyEvent): Promise<string> {
		const eventID = this.generateEventID();
		const { exists } = await this.groups.exists({ group: eventID });

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

	/*
	 * Join the event by adding the user to the event and get the list
	 * of messages previously sended.
	 */

	async joinEvent(eventID: string): Promise<joinEventResponse> {
		const { exists } = await this.groups.exists({ group: eventID });

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
			event: result.content.pop(), // event information at the bottom of stack
			messages: result.content.map(x => { // the rest of the stack contains messages
				return {
					data: x.data.url,
					ts: x.ts
				};
			})
		};
	}

	/*
	 * Send message on channel refering to eventID,
	 * and push to image url to stack.
	 */

	async sendMessage(eventID: string, url: any) {
		const group: GroupUsers = await this.groups.groupUsers({
			group: eventID
		});
		const users: string[] = group.users || [];
		const data: StackItem = {
			data: url,
			ts: Date.now()
		}

		console.log('message:', data); // worker will log all message in terminal
		this.messaging.send({
			channel: eventID,
			target: users,
			data
		});
		await this.stack.push({
			stack: eventID,
			data: { url }
		});
	}

	/*
	 * Check if the image has not already been upload on filesystem,
	 * if so, delete it, and ask for a upload URL.
	 */

	async getImageUploadURL(eventID: string, name: string, type: string): Promise<FileUploadLocation> {
		const path = `/${eventID}_${this.requestContext.owner}_${name}_${Date.now()}`;
		const file = await this.hdfs.stat({ path });

		if (file.entry)
			await this.hdfs.rm({ path });
		return await this.hdfs.newUploadUrl({
			contentType: type,
			path
		});
	}

	/*
	 * From image guid, get image url from filesystem
	 */

	async getImageURL(guid: string): Promise<string> {
		const { url } = await this.hdfs.newFile({
			guid
		});

		return url.url;
	}
}