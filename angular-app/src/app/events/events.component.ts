import { Component, OnInit } from "@angular/core";
import { Event } from "../event";
import { EVENTS } from "../mock-events";

@Component({
  selector: "app-events",
  templateUrl: "./events.component.html",
  styleUrls: ["./events.component.scss"]
})
export class EventsComponent implements OnInit {
  events = EVENTS;

  constructor() {}

  ngOnInit() {}
}
