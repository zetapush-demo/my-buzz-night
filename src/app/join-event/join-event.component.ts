import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-join-event',
	templateUrl: './join-event.component.html',
	styleUrls: ['./join-event.component.scss']
})
export class JoinEventComponent {

	constructor(
		private router: Router
	) {}

	async joinEvent(eventID: string) {
		this.router.navigate([`/event/${eventID}`]);
	}
}
