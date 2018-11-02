export class Artist {
  name: string;
  followers: number;
  popularity: number;
  url: string;
  photoUrls: string[];

  constructor(
    name: string,
    followers: number,
    popularity: number,
    url: string
  ) {
    this.name = name;
    this.followers = followers;
    this.popularity = popularity;
    this.url = url;
    this.photoUrls = [];
  }
}

export function artistFromData(data): Artist {
  return new Artist(
    data.name ? data.name : "N/A",
    data.followers ? data.followers : "N/A",
    data.popularity ? data.popularity : 0,
    data.uri ? data.uri : "N/A"
  );
}
