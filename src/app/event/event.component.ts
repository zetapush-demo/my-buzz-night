import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MyEvent } from '../create-event/create-event.component';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

	eventID: string;
	myEvent: MyEvent;

	constructor(
		private router: Router
	) { }

	foo(eventID: string): MyEvent {
		return {
			name: 'Pizza Bière',
			address: 'Chez Michel',
			date: '16-11-2018 12:00:00'
		};
	}

	async ngOnInit() {
		this.eventID = this.router.url.split('/')[2];
		this.myEvent = this.foo(this.eventID);

		console.log(this.eventID);
	}

}
