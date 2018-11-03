import * as moment from "moment";

export class UpcomingEvent {
  name: string;
  artist: string;
  uri: string;
  date: string;
  time: string;
  type: string;
  moment: moment.Moment;

  constructor(
    name: string,
    artist: string,
    uri: string,
    date: string,
    time: string,
    type: string
  ) {
    this.name = name;
    this.artist = artist;
    this.uri = uri;

    if (time === "") {
      if (date === "N/A") {
        this.moment = moment(`9999-12-31`, "YYYY-MM-DD");
        this.date = "N/A";
      } else {
        this.moment = moment(`${date}`, "YYYY-MM-DD");
        this.date = this.moment.format("ll");
      }
    } else {
      this.moment = moment(`${date}-${time}`, "YYYY-MM-DD-hh-mm-ss");
      this.date = this.moment.format("ll");
    }
    this.time = time;
    this.type = type;
  }
}

export function nameComparator(isAsc: boolean) {
  return function(b: UpcomingEvent, a: UpcomingEvent): number {
    if (a.name < b.name) {
      return isAsc ? 1 : -1;
    } else {
      return isAsc ? -1 : 1;
    }
  };
}

export function timeComparator(isAsc: boolean) {
  return function(a: UpcomingEvent, b: UpcomingEvent): number {
    if (a.moment.isBefore(b.moment)) {
      return isAsc ? -1 : 1;
    } else {
      return isAsc ? 1 : -1;
    }
  };
}

// TODO: error handling
export function upcomingEventFromObj(event: any): UpcomingEvent {
  return new UpcomingEvent(
    event.displayName ? event.displayName : "N/A",
    event.performance &&
    event.performance[0] &&
    event.performance[0].displayName
      ? event.performance[0].displayName
      : "N/A",
    event.uri ? event.uri : "N/A",
    event.start && event.start.date ? event.start.date : "N/A",
    event.start && event.start.time ? event.start.time : "",
    event.type ? event.type : "N/A"
  );
}
