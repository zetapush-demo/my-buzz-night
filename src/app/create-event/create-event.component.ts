import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

	constructor(
		private formBuilder: FormBuilder
	) {}

	format_date() {
		const date_timestamp = Date.parse(this.dateFormGroup.value.dateCtrl);
		const hour_timestamp = this.dateFormGroup.value.hourCtrl;
		const tmp = new Date(date_timestamp + hour_timestamp);
		const d = tmp.getDate();
		const m = tmp.getMonth() + 1; // January is 0!
		const y = tmp.getFullYear();
		const hours_minutes = tmp.toString().split(' ')[4];

		this.dateFormGroup.value.dateCtrl = `${d < 10 ? '0' + d : d}-${m < 10 ? '0' + m : m}-${y} ${hours_minutes}`;
	}

	create_event() {
		console.log('event: ', this.eventFormGroup.value);
		console.log('address: ', this.addressFormGroup.value);
		console.log('date: ', this.dateFormGroup.value);
	}

	ngOnInit() {
		this.eventFormGroup = this.formBuilder.group({
			eventCtrl: ['', Validators.required]
		});
		this.addressFormGroup = this.formBuilder.group({
			addressCtrl: ['', Validators.required]
		});
		this.dateFormGroup = this.formBuilder.group({
			dateCtrl: ['', Validators.required],
			hourCtrl: ['', Validators.required],
		});
	}
}
