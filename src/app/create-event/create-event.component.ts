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

	constructor(
		private formBuilder: FormBuilder
	) {}

	foo() {
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
			dateCtrl: ['', Validators.required]
		});
	}
}
