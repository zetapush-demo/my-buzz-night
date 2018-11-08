import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';

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
		MatProgressSpinnerModule,
		MatButtonModule,
		// MatIconModule
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
