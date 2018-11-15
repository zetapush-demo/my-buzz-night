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
	imageUrl: string;

	constructor(
		private workerService: WorkerService
	) { }

	async sendImage(files: FileList) {
		for (var i = 0; i < files.length; i++) {
			console.log(files[i].name);
			await this.workerService.sendImage(this.eventID, files[i]);
		}
		this.form.nativeElement.reset();
	}

	async ngOnInit() {
		this.eventID = window.location.pathname.split('/')[2];
		const eventData: joinEventResponse = await this.workerService.joinEvent(this.eventID);

		if (eventData) {
			this.myEvent = eventData.event.data as MyEvent;
			this.messages = eventData.messages
		}
		this.workerService.observer.subscribe(
			(data: StackItem) => {
				this.messages.push(data);
				console.log(this.messages);
			}
		);
	}
}
