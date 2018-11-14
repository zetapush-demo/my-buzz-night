import { Component, OnInit } from '@angular/core';

import { MyEvent, WorkerService } from '../worker.service';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

	eventID: string;
	myEvent: MyEvent;
	messages: any[];

	constructor(
		private workerService: WorkerService,
	) { }

	async ngOnInit() {
		this.eventID = window.location.pathname.split('/')[2];
		const eventData = await this.workerService.joinEvent(this.eventID);

		if (eventData) {
			this.myEvent = eventData.event;
			this.messages = eventData.messages
		}
	}

}
