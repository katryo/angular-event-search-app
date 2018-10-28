import { Component, OnInit } from "@angular/core";
import { Event } from "../event";
import { EventService } from "../event.service";

@Component({
  selector: "app-events",
  templateUrl: "./events.component.html",
  styleUrls: ["./events.component.scss"]
})
export class EventsComponent implements OnInit {
  events: Event[];
  lat: number;
  lng: number;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.getUserLocation();
    this.getEvents();
  }

  getUserLocation(): void {
    this.eventService.getUserLocation().subscribe(location => {
      this.lat = location.lat;
      this.lng = location.lon;
    });
  }

  getEvents(): void {
    this.eventService.getEvents().subscribe(events => (this.events = events));
  }
}
