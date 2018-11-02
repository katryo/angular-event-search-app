export class UpcomingEvent {
  name: string;
  artist: string;
  uri: string;
  date: string;
  type: string;

  constructor(
    name: string,
    artist: string,
    uri: string,
    date: string,
    type: string
  ) {
    this.name = name;
    this.artist = artist;
    this.uri = uri;
    this.date = date;
    this.type = type;
  }
}

// TODO: error handling
export function upcomingEventFromObj(event: any): UpcomingEvent {
  return new UpcomingEvent(
    event.displayName ? event.displayName : "N/A",
    event.performance && event.performance[0]
      ? event.performance[0].name
      : "N/A",
    event.uri ? event.uri : "N/A",
    event.start && event.start.date && event.start.time
      ? event.start.date + event.start.time
      : "N/A",
    event.type ? event.type : "N/A"
  );
}
