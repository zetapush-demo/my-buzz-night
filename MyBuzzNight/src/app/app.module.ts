import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule} from '@angular/forms';
import { MatNativeDateModule } from '@angular/material';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateEventComponent } from './create-event/create-event.component';
import { JoinEventComponent } from './join-event/join-event.component';
import { EventComponent } from './event/event.component';
import { HomeComponent } from './home/home.component';

@NgModule({
	imports: [
		AppRoutingModule,
		BrowserModule,
		BrowserAnimationsModule,
		FlexLayoutModule,
		ReactiveFormsModule,
		MatProgressSpinnerModule,
		MatStepperModule,
		MatInputModule,
		MatButtonModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatSelectModule,
		MatToolbarModule,
		MatCardModule
	],
	declarations: [
		AppComponent,
		CreateEventComponent,
		JoinEventComponent,
		EventComponent,
		HomeComponent
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
