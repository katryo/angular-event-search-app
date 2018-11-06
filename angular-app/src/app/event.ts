import * as moment from "moment";
import { Artist } from "./artist";
import { Venue } from "./venue";

export class Event {
  // TODO: N/A
  id: number;
  date: string;
  name: string;
  genre: string;
  segment: string;
  venueName: string;
  isFavorited: boolean;

  time: string;
  priceRange: string;
  ticketStatus: string;
  buyTicketAtUrl: string;
  seatMapUrl: string;
  artistNames: string[];
  artists: Map<string, Artist>;
  artistImages: Map<string, string[]>;
  eventId: string;
  venue: Venue;

  constructor(
    id: number,
    date: string,
    name: string,
    genre: string,
    segment: string,
    venueName: string,
    isFavorited: boolean,
    time: string,
    priceRange: string,
    ticketStatus: string,
    buyTicketAtUrl: string,
    seatMapUrl: string,
    artistNames: string[],
    eventId: string
  ) {
    this.id = id;
    this.date = date;
    this.name = name;
    this.genre = genre;
    this.segment = segment;
    this.venueName = venueName;
    this.isFavorited = isFavorited;

    this.time = time;
    this.priceRange = priceRange;
    this.ticketStatus = ticketStatus;
    this.buyTicketAtUrl = buyTicketAtUrl;
    this.seatMapUrl = seatMapUrl;
    this.artistNames = artistNames;
    this.eventId = eventId;

    this.artists = new Map<string, Artist>();
    this.artistImages = new Map<string, string[]>();
  }

  toObj(): Object {
    return {
      id: this.id,
      date: this.date,
      name: this.name,
      genre: this.genre,
      segment: this.segment,
      venueName: this.venueName,
      time: this.time,
      priceRange: this.priceRange,
      ticketStatus: this.ticketStatus,
      buyTicketAtUrl: this.buyTicketAtUrl,
      seatMapUrl: this.seatMapUrl,
      artistNames: this.artistNames,
      eventId: this.eventId
    };
  }
}

function detailToArtistNames(detail): string[] {
  if (detail._embedded.attractions && detail._embedded.attractions.length > 0) {
    return detail._embedded.attractions.map(attraction => {
      return attraction["name"];
    });
  }
  return [];
}

function detailToVenue(detail): string {
  if (detail._embedded.venues && detail._embedded.venues.length > 0) {
    return detail._embedded.venues[0].name;
  } else {
    return "N/A";
  }
}

function detailToGenre(detail): string {
  if (detail.classifications && detail.classifications.length > 0) {
    for (const classification of detail.classifications) {
      if (classification.genre && classification.genre.name !== "Undefined") {
        return classification.genre.name;
      }
    }
    return "N/A";
  } else {
    return "N/A";
  }
}

function detailToSegment(detail): string {
  if (detail.classifications && detail.classifications.length > 0) {
    for (const classification of detail.classifications) {
      if (
        classification.segment &&
        classification.segment.name !== "Undefined"
      ) {
        return classification.segment.name;
      }
    }
    return "N/A";
  } else {
    return "N/A";
  }
}

function detailToPriceRange(detail): string {
  if (detail.priceRanges && detail.priceRanges.length > 0) {
    const priceRange = detail.priceRanges[0];
    const currency = priceRange.currency === "USD" ? "$" : priceRange.currency;
    if (priceRange.min && priceRange.max) {
      return `${currency}${priceRange.min} ~ ${currency}${priceRange.max}`;
    } else if (priceRange.min) {
      return `${currency}${priceRange.min}`;
    } else {
      return `${currency}${priceRange.max}`;
    }
  } else {
    return "N/A";
  }
}

function detailToTime(detail): string {
  if (!detail || !detail.dates || !detail.dates.start) {
    return "N/A";
  }
  const localDate: string = moment(
    detail.dates.start.localDate,
    "YYYY-MM-DD"
  ).format("ll");
  const localTime: string = detail.dates.start.localTime;
  return `${localDate} ${localTime}`;
}

function eventInfoToEvent(detail, idx): Event {
  return new Event(
    idx,
    detail.dates.start.localDate,
    detail.name,
    detailToGenre(detail),
    detailToSegment(detail),
    detailToVenue(detail),
    false,
    detailToTime(detail),
    detailToPriceRange(detail),
    detail.dates && detail.dates.status ? detail.dates.status.code : "N/A",
    detail.url ? detail.url : "N/A",
    detail.seatmap ? detail.seatmap.staticUrl : "N/A",
    detailToArtistNames(detail),
    detail.id
  );
}

export function eventFromDetail(detail, id): Event {
  return eventInfoToEvent(detail, id);
}

export function eventFromObject(obj): Event {
  return new Event(
    obj.id,
    obj.date,
    obj.name,
    obj.genre,
    obj.segment,
    obj.venueName,
    true,
    obj.time,
    obj.priceRange,
    obj.ticketStatus,
    obj.buyTicketAtUrl,
    obj.seatMapUrl,
    obj.artistNames,
    obj.eventId
  );
}
