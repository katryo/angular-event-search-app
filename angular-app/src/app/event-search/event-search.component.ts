import { Component, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { EventService } from "../event.service";
import { Event, eventFromDetail } from "../event";
import { UpcomingEvent, upcomingEventFromObj } from "../upcoming-event";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { Query } from "../query";
import { Artist, artistFromData } from "../artist";
import { Venue, venueFromDetail } from "../venue";
import {
  trigger,
  style,
  state,
  animate,
  transition
} from "@angular/animations";

const DEFAULT_QUERY: Query = {
  keyword: "",
  radius: 10,
  category: "all",
  unit: "miles",
  from: "here",
  fromTerm: ""
};

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
  locationInvalid = false;
  chosenEvent: Event;
  showsNoRecords = false;
  showsError = false;
  showsEvents = false;
  upcomingEvents: UpcomingEvent[];

  query: Query = DEFAULT_QUERY;

  getUserLocation(): void {
    this.eventService.getUserLocation().subscribe(location => {
      this.lat = location.lat;
      this.lng = location.lon;
    });
  }

  getCategoryInList(event: Event): string {
    if (event.genre === "N/A" && event.segment === "N/A") {
      return "N/A";
    }
    if (event.segment === "N/A") {
      return event.genre;
    }
    if (event.genre === "N/A") {
      return event.segment;
    }
    return event.genre + "-" + event.segment;
  }

  getSuggestions(): void {
    this.eventService
      .getSuggestions(this.query.keyword)
      .subscribe(suggestions => {
        this.suggestions = suggestions;
      });
  }

  getArtists(names: string[]): void {
    names.map(name => {
      this.eventService.getArtist(name).subscribe(data => {
        if (data.artists && data.artists.length > 0) {
          const artist = artistFromData(data.artists[0]);
          if (this.chosenEvent) {
            this.chosenEvent.artists.set(name, artist);
          }
        }
      });
    });
  }

  getImages(name: string): void {
    this.eventService.getImages(name).subscribe(urls => {
      if (this.chosenEvent) {
        this.chosenEvent.artistImages.set(name, urls);
      }
    });
  }

  getKeys(map): string[] {
    return Array.from(map.keys());
  }

  showEventDetail(): void {
    this.isDetailed = true;
    this.getUpcomingEvents();
  }

  chooseEvent(event: Event): void {
    this.chosenEvent = event;
    if (event.segment === "Music") {
      this.getArtists(event.artistNames);
    }
    event.artistNames.forEach(name => {
      this.getImages(name);
    });

    this.eventService.getVenue(event.eventId).subscribe(data => {
      if (data.status === "success") {
        event.venue = venueFromDetail(data.venue);
      }
    });

    this.showEventDetail();
  }

  detailEvent(): void {
    this.showEventDetail();
  }

  getUpcomingEvents(): void {
    this.eventService
      .getUpcomingEvents(this.chosenEvent.venueName)
      .subscribe(events => {
        this.upcomingEvents = events;
      });
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

  validateLocation(): void {
    for (const char of this.query.fromTerm) {
      if (char !== " ") {
        this.locationInvalid = false;
        return;
      }
    }
    this.locationInvalid = true;
  }

  clearValidationLocation(): void {
    this.locationInvalid = false;
  }

  clearInputs(): void {
    this.events = [];
    this.isDetailed = false;
    this.suggestions = [];
    this.isLoading = false;
    this.keywordInvalid = false;
    this.locationInvalid = false;
    this.showsNoRecords = false;
    this.showsError = false;
    this.query.keyword = "";
    this.query.radius = 10;
    this.query.category = "all";
    this.query.unit = "miles";
    this.query.from = "here";
    this.query.fromTerm = "";
    this.showsEvents = false;
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
        this.query.from,
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
          this.showsEvents = true;
        } else {
          // TODO: Error handling
          console.log("failure");
          this.isLoading = false;
          this.events = [];
          this.showsNoRecords = false;
          this.showsError = true;
          this.isDetailed = false;
          this.showsEvents = false;
        }
      });
  }

  ngOnInit(): void {
    this.getUserLocation();
  }
}
