import { Component } from '@angular/core';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent {
	buttons = [
		{
			route: 'create',
			description: 'Create an event and invite your friends !'
		},
		{
			route: 'join',
			description: 'Join an event !'
		}
	];
}
