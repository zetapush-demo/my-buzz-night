import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { WeakClient, ProxyService } from '@zetapush/client';
import { Messaging, StackItem, FileUploadLocation, ListingEntryInfo } from '@zetapush/platform-legacy';

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

	async joinEvent(eventID: string): Promise<joinEventResponse> {
		const eventData = await this.api.joinEvent(eventID) as joinEventResponse;

		if (!eventData)
			return console.log('null'), null;
		await this.client.createService({
			Type: Messaging,
			listener: {
				[eventID]: ({ data }) => this.observer.next(data.data)
			}
		});
		return eventData;
	}

	async sendImage(eventID: string, file: File) {
		const transfer: FileUploadLocation = await this.api.getImageUploadURL({
			eventID,
			name: file.name,
			type: file.type
		});

		await this.upload(transfer, file);
		const url = await this.api.getImageURL(transfer.guid);
		await this.api.sendMessage({ eventID, url });
	}

	private async upload(transfer: FileUploadLocation, file: File) {
		return new Promise<any>((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (200 <= xhr.status && xhr.status < 300)
						resolve({transfer, file});
					else
						reject({transfer, file});
				}
			};
			xhr.open(transfer.httpMethod, this.getSecureUrl(transfer.url), true);
			xhr.setRequestHeader('Content-Type', file.type);
			xhr.send(file);
		});
	}

	private getSecureUrl(url) {
		const HTTP_PATTERN = /^http:\/\/|^\/\//;
		const HTTPS_PROTOCOL = 'https:';
		const FORCE_HTTPS = typeof location === 'undefined' ? false : location.protocol === HTTPS_PROTOCOL;

		return FORCE_HTTPS ? url.replace(HTTP_PATTERN, `${HTTPS_PROTOCOL}//`) : url;
	};
}
