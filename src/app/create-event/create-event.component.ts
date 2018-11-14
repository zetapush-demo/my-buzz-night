import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyEvent, WorkerService } from '../worker.service';

@Component({
	selector: 'app-create-event',
	templateUrl: './create-event.component.html',
	styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {

	eventFormGroup: FormGroup;
	addressFormGroup: FormGroup;
	dateFormGroup: FormGroup;
	hours = Array.from(Array(24), (x, i) => i);

	myEvent: MyEvent = {
		name: null,
		address: null,
		date: null,
	};

	eventID: string;
	eventUrl: string;

	constructor(
		private formBuilder: FormBuilder,
		private workerService: WorkerService
	) {}

	format_date() {
		if (!this.dateFormGroup.value.dateCtrl)
			return;
		const date_timestamp = Date.parse(this.dateFormGroup.value.dateCtrl);
		const hour_timestamp = 1000 * 60 * 60 * (this.dateFormGroup.value.hourCtrl || 0);
		const tmp = new Date(date_timestamp + hour_timestamp);
		const d = tmp.getDate();
		const m = tmp.getMonth() + 1; // January is 0!
		const y = tmp.getFullYear();
		const hours_minutes = tmp.toString().split(' ')[4];

		return `${d < 10 ? '0' + d : d}-${m < 10 ? '0' + m : m}-${y} ${hours_minutes}`;
	}

	async create_event() {
		this.eventID = await this.workerService.createEvent(this.myEvent);
		this.eventUrl = `${window.location.origin}/event/${this.eventID}`;
		console.log('eventID: ', this.eventID);
	}

	ngOnInit() {
		this.eventFormGroup = this.formBuilder.group({
			eventCtrl: [null, Validators.required]
		});
		this.addressFormGroup = this.formBuilder.group({
			addressCtrl: [null, Validators.required]
		});
		this.dateFormGroup = this.formBuilder.group({
			dateCtrl: [null, Validators.required],
			hourCtrl: [null, Validators.required],
		});
	}
}
