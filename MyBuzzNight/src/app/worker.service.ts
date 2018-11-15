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
				[eventID]: ({ data }) => this.observer.next(data.data.data)
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
		console.log('sendImage => getImageUploadURL: ', transfer);
		if (!transfer)
			return;
		await this.upload(transfer, file);
		const confirm: ListingEntryInfo = await this.api.getImageURL(transfer.guid);
		console.log('sendImage => getImageURL: ', confirm);

		await this.api.sendMessage({
			eventID,
			url: confirm.url.url
		});
	}

	private async upload(transfer: FileUploadLocation, file: File) {
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4)
				console.log(`Sending : ${xhr.status === 200 ? 'success' : 'fail'}`);
		};
		xhr.upload.onprogress = (e: any) => {
				const done = e.position || e.loaded;
				const total = e.totalSize || e.total;
				const progression = Math.floor(done / total * 1000) / 10;

				console.log(`xhr.upload progress: ${progression}%`);
			};
		xhr.open(transfer.httpMethod, this.getSecureUrl(transfer.url), true);
		xhr.setRequestHeader('Content-Type', file.type);
		xhr.send(file);
	}

	private getSecureUrl(url) {
		const HTTP_PATTERN = /^http:\/\/|^\/\//;
		const HTTPS_PROTOCOL = 'https:';
		const FORCE_HTTPS = typeof location === 'undefined' ? false : location.protocol === HTTPS_PROTOCOL;

		return FORCE_HTTPS ? url.replace(HTTP_PATTERN, `${HTTPS_PROTOCOL}//`) : url;
	};
}
