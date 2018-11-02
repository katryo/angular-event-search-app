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
  console.log(data);
  console.log("artist crea");
  return new Artist(
    data.name ? data.name : "N/A",
    data.followers ? data.followers.total : -1,
    data.popularity ? data.popularity : -1,
    data.external_urls && data.external_urls.spotify
      ? data.external_urls.spotify
      : "N/A"
  );
}
