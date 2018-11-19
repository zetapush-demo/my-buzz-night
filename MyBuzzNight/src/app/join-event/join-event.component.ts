import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { WorkerService } from '../worker.service';

@Component({
	selector: 'app-join-event',
	templateUrl: './join-event.component.html',
	styleUrls: ['./join-event.component.scss']
})
export class JoinEventComponent {

	constructor(
		private worker: WorkerService,
		private router: Router,
		private snackBar: MatSnackBar
	) {}

	async joinEvent(eventID: string) {
		const exists = await this.worker.api.isEventExists(eventID);

		if (exists)
			this.router.navigate([`/event/${eventID}`]);
		else
			this.snackBar.open(`${eventID} event doesn't exist...`, 'Ok', {
				duration: 5000
			});
	}
}
