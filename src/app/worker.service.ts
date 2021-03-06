import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { WeakClient, ProxyTaskService } from '@zetapush/client';
import { Messaging, StackItem, FileUploadLocation } from '@zetapush/platform-legacy';

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
	api: ProxyTaskService;
	observer: Subject<any> = new Subject();

	constructor() {
		this.client = new WeakClient({
			platformUrl: 'http://hq.zpush.io:9080/zbo/pub/business/',
			appName: 'pumj9v7yg'
		});
		this.api = this.client.createProxyTaskService();
	}

	async joinEvent(eventID: string): Promise<joinEventResponse> {
		const eventData = await this.api.joinEvent(eventID) as joinEventResponse;

		if (!eventData)
			return null;
		await this.client.createService({
			Type: Messaging,
			listener: {
				[eventID]: ({ data }) => this.observer.next(data.data)
			}
		});
		return eventData;
	}

	async sendImage(eventID: string, file: File) {
		const transfer: FileUploadLocation = await this.api.getImageUploadURL(
			eventID,
			file.name,
			file.type
		);

		await this.upload(transfer, file);
		const url = await this.api.getImageURL(transfer.guid);
		await this.api.sendMessage(eventID, url);
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
