export class Event {
  id: number;
  date: string;
  name: string;
  category: string;
  venueName: string;
  isFavorited: boolean;

  constructor(
    id: number,
    date: string,
    name: string,
    category: string,
    venueName: string,
    isFavorited: boolean
  ) {
    this.id = id;
    this.date = date;
    this.name = name;
    this.category = category;
    this.venueName = venueName;
    this.isFavorited = isFavorited;
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
      if (
        classification.subGenre &&
        classification.subGenre.name !== "Undefined"
      ) {
        genres.push(classification.subGenre.name);
      }
      if (classification.genre && classification.genre.name !== "Undefined") {
        genres.push(classification.genre.name);
      }
      if (
        classification.segment &&
        classification.segment.name !== "Undefined"
      ) {
        genres.push(classification.segment.name);
      }
      if (
        classification.subtype &&
        classification.subtype.name !== "Undefined"
      ) {
        genres.push(classification.type.name);
      }
      if (classification.type && classification.type.name !== "Undefined") {
        genres.push(classification.type.name);
      }
    }
    return genres.join("-");
  } else {
    return "N/A";
  }
}

function eventInfoToEvent(detail, idx): Event {
  return new Event(
    idx,
    detail.dates.start.localDate + detail.dates.start.localTime,
    detail.name,
    detailToGenre(detail),
    detailToVenue(detail),
    false
  );
}

export function eventFromDetail(detail, id): Event {
  return eventInfoToEvent(detail, id);
}
