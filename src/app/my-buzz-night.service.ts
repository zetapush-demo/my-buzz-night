import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { SmartClient, ProxyService } from '@zetapush/client';
import { Messaging } from '@zetapush/platform-legacy/lib/';

export interface MyEvent {
	name: string;
	address: string;
	date: string;
}

@Injectable({
	providedIn: 'root'
})
export class MyBuzzNightService {

	client: SmartClient;
	api: ProxyService;
	observer: Subject<any> = new Subject();

	constructor() {
		this.client = new SmartClient({
			platformUrl: 'https://celtia.zetapush.com/zbo/pub/business',
			appName: 'OTNDAKpr'
		});
		this.api = this.client.createProxyTaskService();
	}

	async createEvent(event: MyEvent): Promise<string> {
		return this.api.createEvent(event) as Promise<string>;
	}

	async listen(evendID: string) {
		const listener = {};

		listener[evendID] = ({ data }) => this.observer.next(data.data.message)
		await this.client.createService({
			Type: Messaging,
			listener: listener
		});
	}

	async connect() {
		try {
			await this.client.connect();
		} catch (error) {
			console.error(error);
		}
	}

}
