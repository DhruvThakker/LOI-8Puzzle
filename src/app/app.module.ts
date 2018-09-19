import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AStarService } from './service/astar.service';
import { PriorityQueueService } from './service/priority-queue.service';
import { InversionCountService } from './service/inversion-count.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    AStarService,
    PriorityQueueService,
    InversionCountService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
