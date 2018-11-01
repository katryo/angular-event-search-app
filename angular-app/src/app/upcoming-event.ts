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

export function upcomingEventFromObj(event: any): UpcomingEvent {
  return new UpcomingEvent(
    event.displayName,
    event.performance[0].name,
    event.uri,
    event.start.date + event.start.time,
    event.type
  );
}
