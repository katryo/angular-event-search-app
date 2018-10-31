import { Component, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { EventService } from "../event.service";
import { Event, eventFromDetail } from "../event";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { Query } from "../query";
import {
  trigger,
  style,
  state,
  animate,
  transition
} from "@angular/animations";

@Component({
  selector: "app-event-search",
  templateUrl: "./event-search.component.html",
  styleUrls: ["./event-search.component.scss"],
  animations: [
    trigger("eventDetail", [
      transition("showsList => showsDetailed", [
        style({ transform: "translateX(-100%)" }),
        animate("600ms ease-in", style({ transform: "translateX(0%)" }))
      ])
    ]),

    trigger("backToList", [
      transition("showsDetailed => showsList", [
        style({ transform: "translateX(100%)" }),
        animate("600ms ease-in", style({ transform: "translateX(0%)" }))
      ])
    ])
  ]
})
export class EventSearchComponent implements OnInit {
  constructor(private eventService: EventService) {}
  events: Event[];
  lat: number;
  lng: number;
  isDetailed = false;
  suggestions = [];
  isLoading = false;
  keywordInvalid = false;
  chosenEvent: Event;
  showsNoRecords = false;
  showsError = false;

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

  getSuggestions(): void {
    this.eventService
      .getSuggestions(this.query.keyword)
      .subscribe(suggestions => {
        this.suggestions = suggestions;
      });
  }

  chooseEvent(event: Event): void {
    this.isDetailed = true;
    this.chosenEvent = event;
  }

  backToList(): void {
    this.isDetailed = false;
  }

  onKeyUp(): void {
    this.validateKeyword();
    this.getSuggestions();
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

          if (this.events.length === 0) {
            this.showsNoRecords = true;
          } else {
            this.showsNoRecords = false;
          }
          this.showsError = false;
          this.isDetailed = false;
        } else {
          // TODO: Error handling
          console.log("failure");
          this.isLoading = false;
          this.events = [];
          this.showsNoRecords = false;
          this.showsError = true;
          this.isDetailed = false;
        }
      });
  }

  ngOnInit(): void {
    this.getUserLocation();
  }
}
