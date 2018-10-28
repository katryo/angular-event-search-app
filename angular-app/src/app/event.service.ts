import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Event } from "./event";
import { EVENTS } from "./mock-events";

@Injectable({
  providedIn: "root"
})
export class EventService {
  constructor(private http: HttpClient) {}

  private eventsUrl = "";
  private ipApiUrl = "http://ip-api.com/json";

  getUserLocation(): any {
    return this.http.get(this.ipApiUrl);
    // return of([1.1, 2.2]);
  }

  getEvents(): Observable<Event[]> {
    // return this.http.get<Event[]>(this.eventsUrl);
    return of(EVENTS);
  }
}
