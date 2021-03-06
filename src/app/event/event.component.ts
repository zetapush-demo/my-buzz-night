import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { MyEvent, WorkerService, joinEventResponse } from '../worker.service';
import { StackItem } from '@zetapush/platform-legacy';
import { Router } from '@angular/router';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

	eventID: string;
	myEvent: MyEvent;
	messages: StackItem[] = [];

	@ViewChild('form') form: ElementRef;

	constructor(
		private workerService: WorkerService,
		private router: Router
	) { }

	async sendImage(files: FileList) {
		for (var i = 0; i < files.length; i++)
			await this.workerService.sendImage(this.eventID, files[i]);
		this.form.nativeElement.reset();
	}

	filterInputMessage(message: StackItem): StackItem {
		return {
			data: message.data,
			ts: new Date(message.ts).toString().split(' ')[4] as any
		}
	}

	async ngOnInit() {
		this.eventID = window.location.href.split('/').pop();
		const eventData: joinEventResponse = await this.workerService.joinEvent(this.eventID);

		if (eventData) {
			this.myEvent = eventData.event.data as MyEvent;
			eventData.messages.forEach(x => {
				this.messages.push(this.filterInputMessage(x));
			});
			this.workerService.observer.subscribe(
				(data: StackItem) => this.messages.unshift(this.filterInputMessage(data))
			);
		} else
			this.router.navigate(['/join']);
	}
}
