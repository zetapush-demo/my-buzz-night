import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	title = 'MyBuzzNight';
	ready = false;

	async ngOnInit() {
	// 	await this.zetapush_service.connect();
	// 	await this.zetapush_service.listen();
		this.ready = true;
	}
}
