import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { MyEvent, WorkerService, joinEventResponse } from '../worker.service';
import { StackItem } from '@zetapush/platform-legacy';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

	eventID: string;
	myEvent: MyEvent;
	messages: StackItem[];

	@ViewChild('form') form: ElementRef;

	constructor(
		private workerService: WorkerService
	) { }

	async sendImage(files: FileList) {
		for (var i = 0; i < files.length; i++)
			await this.workerService.sendImage(this.eventID, files[i]);
		this.form.nativeElement.reset();
	}

	parse_time(time) {
		const tmp = new Date(time);
		const d = tmp.getDate();
		const m = tmp.getMonth() + 1; // January is 0!
		const y = tmp.getFullYear();
		const hours_minutes = tmp.toString().split(' ')[4];

		return `${d < 10 ? '0' + d : d}-${m < 10 ? '0' + m : m}-${y} ${hours_minutes}`;
	}

	async ngOnInit() {
		this.eventID = window.location.pathname.split('/')[2];
		const eventData: joinEventResponse = await this.workerService.joinEvent(this.eventID);

		console.log(eventData);
		if (eventData) {
			this.myEvent = eventData.event.data as MyEvent;
			this.messages = eventData.messages.map(x => {
				return {
					data: x.data.url,
					ts: x.ts
				};
			});
		}
		console.log('from stack: ', this.messages);
		this.workerService.observer.subscribe(
			(data: StackItem) => this.messages.push(data)
		);
	}
}
