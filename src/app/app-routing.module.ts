import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { environment } from 'src/environments/environment';

import { CreateEventComponent } from './create-event/create-event.component';
import { JoinEventComponent } from './join-event/join-event.component';
import { EventComponent } from './event/event.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
	{ path: '',		component: HomeComponent },
	{ path: 'create',	component: CreateEventComponent },
	{ path: 'join',		component: JoinEventComponent },
	{ path: 'event/:id',	component: EventComponent },
	{ path: '**',		redirectTo: '/' },
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: environment.useHash })],
	exports: [RouterModule]
})
export class AppRoutingModule { }
