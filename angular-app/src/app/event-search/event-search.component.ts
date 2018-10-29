import { Component, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { EventService } from "../event.service";
import { Event, eventFromDetail } from "../event";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { Query } from "../query";

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
  isLoading = false;
  keywordInvalid = false;

  query: Query = {
    keyword: "",
    radius: 10,
    category: "all",
    unit: "miles",
    from: "here",
    fromTerm: ""
  };

  getUserLocation(): void {
    this.eventService.getUserLocation().subscribe(location => {
      this.lat = location.lat;
      this.lng = location.lon;
    });
  }

  validateKeyword(): void {
    for (const char of this.query.keyword) {
      if (char !== " ") {
        this.keywordInvalid = false;
        return;
      }
    }
    this.keywordInvalid = true;
  }

  search(): void {
    this.isLoading = true;
    this.eventService
      .getEvents(
        this.query.keyword,
        this.lat,
        this.lng,
        this.query.category,
        this.query.radius,
        this.query.unit,
        this.query.fromTerm
      )
      .subscribe(eventsObj => {
        if (eventsObj.status === "success") {
          this.isLoading = false;
          const eventsInfo = eventsObj["events"];
          this.events = eventsInfo.map((eventInfo, idx) =>
            eventFromDetail(eventInfo, idx + 1)
          );
        } else {
          console.log("failure");
          this.isLoading = false;
          this.events = [];
        }
      });
  }

  ngOnInit(): void {
    this.getUserLocation();
  }
}
