import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { UpcomingEvent, upcomingEventFromObj } from "./upcoming-event";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map
} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class EventService {
  constructor(private http: HttpClient) {}

  private eventsUrl = "/api/events";
  private suggesctionsUrl = "/api/suggestions";
  private latLngUrl = "/api/latlng";
  private ipApiUrl = "http://ip-api.com/json";

  getUserLocation(): any {
    return this.http.get(this.ipApiUrl);
  }

  getSuggestions(keyword: string): Observable<string[]> {
    const searchParams: URLSearchParams = new URLSearchParams();
    searchParams.append("keyword", keyword);
    return this.http
      .get(`${this.suggesctionsUrl}?${searchParams.toString()}`)
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(obj => obj["attractions"].map(at => at["name"]))
      );
  }

  getUpcomingEvents(venueName: string): Observable<UpcomingEvent[]> {
    return this.http.get(`/api/upcoming?query=${venueName}`).pipe(
      map(obj => obj["upcomingEvents"]),
      map(upcomingEvents =>
        upcomingEvents.map(event => upcomingEventFromObj(event))
      )
    );
  }

  getEvents(
    keyword: string,
    lat: number,
    lng: number,
    category: string,
    radius: number,
    unit: string,
    fromTerm: string
  ): any {
    if (fromTerm === "") {
      const searchParams: URLSearchParams = new URLSearchParams();
      searchParams.append("keyword", keyword);
      searchParams.append("lat", lat.toString());
      searchParams.append("lng", lng.toString());
      searchParams.append("category", category);
      searchParams.append("radius", radius.toString());
      searchParams.append("unit", unit);
      return this.http.get(this.eventsUrl + "?" + searchParams.toString());
    } else {
      const params: URLSearchParams = new URLSearchParams();
      params.append("address", fromTerm);
      return this.http.get(`${this.latLngUrl}?${params.toString()}`).pipe(
        mergeMap(latLngResult => {
          if (latLngResult["status"] === "success") {
            return this.http.get(
              `${this.eventsUrl}?keyword=${keyword}&lat=${
                latLngResult["lat"]
              }&lng=${
                latLngResult["lng"]
              }&category=${category}&radius=${radius}&unit=${unit}`
            );
          } else {
            // TODO: Error
          }
        })
      );
    }
  }
}
