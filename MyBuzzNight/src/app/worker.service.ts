import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { WeakClient, ProxyService } from '@zetapush/client';
import { Messaging, StackItem } from '@zetapush/platform-legacy';

export interface MyEvent {
	name: string;
	address: string;
	date: string;
}

export interface joinEventResponse {
	event: StackItem;
	messages: StackItem[];
}

@Injectable({
	providedIn: 'root'
})
export class WorkerService {

	client: WeakClient;
	api: ProxyService;
	observer: Subject<any> = new Subject();

	constructor() {
		this.client = new WeakClient({
			platformUrl: 'https://celtia.zetapush.com/zbo/pub/business',
			appName: 'OTNDAKpr'
		});
		this.api = this.client.createProxyTaskService();
	}

	async workerConnect() {
		await this.client.connect();
	}

	async createEvent(event: MyEvent): Promise<string> {
		const eventID: string = await this.api.createEvent(event) as string;

		return eventID;
	}

	async joinEvent(eventID: string) {
		const eventData = await this.api.joinEvent(eventID) as any;

		if (!eventData)
			return console.log('null'), null;
		await this.client.createService({
			Type: Messaging,
			listener: {
				[eventID]: ({ data }) => this.observer.next(data.data.data)
			}
		});
		return eventData;
	}
}
