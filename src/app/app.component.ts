import { Component, OnInit } from '@angular/core';

import { WorkerService } from './worker.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	title = 'MyBuzzNight';
	ready = false;

	constructor(
		private workerService: WorkerService
	) {}

	async ngOnInit() {
		await this.workerService.workerConnect();
		this.ready = true;
	}
}
