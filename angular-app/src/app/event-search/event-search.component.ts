import { Component, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { EventService } from "../event.service";
import { Event, eventFromDetail } from "../event";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";

@Component({
  selector: "app-event-search",
  templateUrl: "./event-search.component.html",
  styleUrls: ["./event-search.component.scss"]
})
export class EventSearchComponent implements OnInit {
  constructor(private eventService: EventService) {}
  events: Event[];
  lat: number;
  lng: number;

  getUserLocation(): void {
    this.eventService.getUserLocation().subscribe(location => {
      this.lat = location.lat;
      this.lng = location.lon;
    });
  }

  search(
    keyword: string,
    category: string,
    radius: string,
    unit: string
  ): void {
    this.eventService
      .getEvents(
        keyword,
        this.lat,
        this.lng,
        category,
        parseInt(radius, 10),
        unit
      )
      .subscribe(eventsObj => {
        if (eventsObj.status === "success") {
          const eventsInfo = eventsObj["events"];
          this.events = eventsInfo.map((eventInfo, idx) =>
            eventFromDetail(eventInfo, idx + 1)
          );
        } else {
          console.log("failure");
          this.events = [];
        }
      });
  }

  ngOnInit(): void {
    this.getUserLocation();
  }
}
