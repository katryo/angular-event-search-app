export class Event {
  // TODO: N/A
  id: number;
  date: string;
  name: string;
  category: string;
  venueName: string;
  isFavorited: boolean;

  time: string;
  priceRange: string;
  ticketStatus: string;
  buyTicketAtUrl: string;
  seatMapUrl: string;

  constructor(
    id: number,
    date: string,
    name: string,
    category: string,
    venueName: string,
    isFavorited: boolean,
    time: string,
    priceRange: string,
    ticketStatus: string,
    buyTicketAtUrl: string,
    seatMapUrl: string
  ) {
    this.id = id;
    this.date = date;
    this.name = name;
    this.category = category;
    this.venueName = venueName;
    this.isFavorited = isFavorited;

    this.time = time;
    this.priceRange = priceRange;
    this.ticketStatus = ticketStatus;
    this.buyTicketAtUrl = buyTicketAtUrl;
    this.seatMapUrl = seatMapUrl;
  }
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
    const genres: string[] = [];
    for (const classification of detail.classifications) {
      if (classification.genre && classification.genre.name !== "Undefined") {
        genres.push(classification.genre.name);
      }
      if (
        classification.segment &&
        classification.segment.name !== "Undefined"
      ) {
        genres.push(classification.segment.name);
      }
    }
    return genres.join("-");
  } else {
    return "N/A";
  }
}

function detailToPriceRange(detail): string {
  if (detail.priceRanges && detail.priceRanges.length > 0) {
    const priceRange = detail.priceRanges[0];
    if (priceRange.min && priceRange.max) {
      return (
        priceRange.min + " - " + priceRange.max + " " + priceRange.currency
      );
    } else if (priceRange.min) {
      return priceRange.min + " " + priceRange.currency;
    } else {
      return priceRange.max + " " + priceRange.currency;
    }
  } else {
    return "N/A";
  }
}

function eventInfoToEvent(detail, idx): Event {
  return new Event(
    idx,
    detail.dates.start.localDate,
    detail.name,
    detailToGenre(detail),
    detailToVenue(detail),
    false,
    detail.dates.start.localDate + detail.dates.start.localTime,
    detailToPriceRange(detail),
    detail.dates && detail.dates.status ? detail.dates.status : "N/A",
    detail.url ? "detail.url" : "N/A",
    detail.seatmap ? detail.seatmap : "N/A"
  );
}

export function eventFromDetail(detail, id): Event {
  return eventInfoToEvent(detail, id);
}
