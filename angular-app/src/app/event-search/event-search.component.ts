import { Component, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { EventService } from "../event.service";
import { Event, eventFromDetail, eventFromObject } from "../event";
import {
  UpcomingEvent,
  upcomingEventFromObj,
  nameComparator,
  timeComparator,
  artistComparator,
  typeComparator
} from "../upcoming-event";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import * as moment from "moment";
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
declare var $: any;
declare var google: any;

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
    ]),
    trigger("upcomingShowTrigger", [
      state(
        "less",
        style({
          height: 0,
          display: "none",
          visibility: "hidden",
          opacity: 0
        })
      ),
      transition("more => less", [
        animate(
          "300ms ease-in",
          style({
            height: 0,
            display: "none",
            visibility: "hidden",
            opacity: 0
          })
        )
      ]),
      transition("less => more", [
        animate(
          "300ms ease-in",
          style({
            height: "*",
            display: "*",
            visibility: "*",
            opacity: 1
          })
        )
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
  shownUpcomingEventsLess = <UpcomingEvent[]>[];
  shownUpcomingEventsMore = <UpcomingEvent[]>[];
  upcomings = new Map<string, UpcomingEvent[]>();
  storage = window.localStorage;
  favedEvents = <Event[]>[];
  searchEnabled = false;

  upcomingEventSort = "default";
  upcomingEventOrder = "ascending";
  query: Query = DEFAULT_QUERY;
  upcomingShowMore = false;
  placeId = "N/A";
  showsFavs = false;

  eventsMore(): UpcomingEvent[] {
    return this.shownUpcomingEventsMore;
  }

  handleResultsClicked(): void {
    this.backToList();
    this.showsFavs = false;
  }

  handleFavsClicked(): void {
    this.backToList();
    this.showsFavs = true;
    console.log("handleFavs");
  }

  getPlaceId(): void {
    const mapCenter = new google.maps.LatLng(this.lat, this.lng);

    const gMap = new google.maps.Map(document.getElementById("js-map"), {
      center: mapCenter,
      zoom: 1
    });
    const request = {
      query: this.chosenEvent.venueName,
      locationBias: new google.maps.LatLng(
        this.chosenEvent.venue.lat,
        this.chosenEvent.venue.lng
      )
    };
    const service = new google.maps.places.PlacesService(gMap);
    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        if (results.length > 0) {
          this.placeId = results[0].place_id;
        } else {
          this.placeId = "N/A";
        }
      }
    });
  }

  resetFavs(): void {
    this.storage.clear();
  }

  getFavedEvents(): void {
    const str: string = this.storage.getItem("events");
    try {
      const objects = JSON.parse(str);
      if (objects) {
        this.favedEvents = objects.map(object => eventFromObject(object));
      }
    } catch (e) {
      console.log(e);
    }
  }

  updateFavsStorage(): void {
    const obj = this.favedEvents.map(event => {
      return event.toObj();
    });
    const jsonStr = JSON.stringify(obj);
    this.storage.setItem("events", jsonStr);
  }

  favEvent(event: Event): void {
    this.favedEvents.forEach(e => {
      if (e.eventId === event.eventId) {
        return;
      }
    });
    event.isFavorited = true;
    this.favedEvents.push(event);
    this.updateFavsStorage();
  }

  unfavEvent(event: Event): void {
    event.isFavorited = false;
    this.favedEvents = this.favedEvents.filter(e => {
      return e.eventId !== event.eventId;
    });
    this.updateFavsStorage();
  }

  getUserLocation(): void {
    this.eventService.getUserLocation().subscribe(location => {
      this.lat = location.lat;
      this.lng = location.lon;
      this.searchEnabled = true;
    });
  }

  twitterUrl(event: Event): string {
    const searchParams: URLSearchParams = new URLSearchParams();
    const text = `Check out ${event.name} located at ${
      event.venueName
    }. Website: ${event.buyTicketAtUrl} #CSCI571EventSearch`;
    searchParams.append("text", text);
    return `https://twitter.com/intent/tweet?${searchParams.toString()}`;
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

  showMore(): void {
    this.upcomingShowMore = true;
    // this.reorganizeUpcomingEvents();
  }

  showLess(): void {
    this.upcomingShowMore = false;
    // this.reorganizeUpcomingEvents();
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

  // TODO: order reset
  reorganizeUpcomingEvents(): void {
    const isAsc = this.upcomingEventOrder === "ascending";
    const events = this.upcomingEvents.slice();
    let sorted;
    switch (this.upcomingEventSort) {
      case "name":
        sorted = events.sort(nameComparator(isAsc));
        break;
      case "time":
        sorted = events.sort(timeComparator(isAsc));
        break;
      case "artist":
        sorted = events.sort(artistComparator(isAsc));
        break;
      case "type":
        sorted = events.sort(typeComparator(isAsc));
        break;
      case "default":
        sorted = events;
        break;
    }

    // this.upcomings.set('less', sorted.slice(0, 5));
    // this.upcomings.set('more', sorted.slice(5));
    this.shownUpcomingEventsLess = sorted.slice(0, 5);
    this.shownUpcomingEventsMore = sorted.slice(5);
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

  generateMap(): void {}

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
        this.getPlaceId();
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
        this.reorganizeUpcomingEvents();
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

  isLocationValid(): boolean {
    for (const char of this.query.fromTerm) {
      if (char !== " ") {
        return true;
      }
    }
    return false;
  }

  validateLocation(): void {
    this.locationInvalid = this.isLocationValid() ? false : true;
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
    this.chosenEvent = null;
    this.showsFavs = false;
  }

  search(): void {
    this.getUserLocation();
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
        console.log("subscribe");
        if (eventsObj.status === "success") {
          this.isLoading = false;
          const eventsInfo = eventsObj["events"];
          this.events = eventsInfo
            .map((eventInfo, idx) => eventFromDetail(eventInfo, idx + 1))
            .sort((a: Event, b: Event) => {
              if (a.moment.isBefore(b.moment)) {
                return -1;
              } else {
                return 1;
              }
            });

          if (this.events.length === 0) {
            this.showsNoRecords = true;
          } else {
            this.showsNoRecords = false;
          }
          this.showsError = false;
          this.isDetailed = false;
          this.showsEvents = true;
          this.showsFavs = false;
        } else {
          console.log("failed to search events.");
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
    this.getFavedEvents();
  }
}
