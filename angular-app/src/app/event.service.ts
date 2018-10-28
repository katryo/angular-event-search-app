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

  private eventsUrl = "/api/events";
  private ipApiUrl = "http://ip-api.com/json";

  getUserLocation(): any {
    return this.http.get(this.ipApiUrl);
  }

  getEvents(
    keyword: string,
    lat: number,
    lng: number,
    category: string,
    radius: number,
    unit: string
  ): any {
    return this.http.get(
      `${
        this.eventsUrl
      }?keyword=${keyword}&lat=${lat}&lng=${lng}&category=${category}&radius=${radius}&unit=${unit}`
    );
  }
}
