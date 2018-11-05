export class Venue {
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  generalRule: string;
  childRule: string;
  lat: number;
  lng: number;

  constructor(
    name: string,
    address: string,
    city: string,
    phone: string,
    hours: string,
    generalRule: string,
    childRule: string,
    lng: number,
    lat: number
  ) {
    this.name = name;
    this.address = address;
    this.city = city;
    this.phone = phone;
    this.hours = hours;
    this.generalRule = generalRule;
    this.childRule = childRule;
    this.lat = lat;
    this.lng = lng;
  }
}

export function venueFromDetail(detail): Venue {
  console.log(detail.state);
  return new Venue(
    detail.name ? detail.name : "N/A",
    detail.address && detail.address.line1 ? detail.address.line1 : "N/A",
    detail.city && detail.city.name && detail.state && detail.state.name
      ? `${detail.city.name}, ${detail.state.name}`
      : "N/A",
    detail.boxOfficeInfo && detail.boxOfficeInfo.phoneNumberDetail
      ? detail.boxOfficeInfo.phoneNumberDetail
      : "N/A",
    detail.boxOfficeInfo && detail.boxOfficeInfo.openHoursDetail
      ? detail.boxOfficeInfo.openHoursDetail
      : "N/A",
    detail.generalInfo && detail.generalInfo.generalRule
      ? detail.generalInfo.generalRule
      : "N/A",
    detail.generalInfo && detail.generalInfo.childRule
      ? detail.generalInfo.childRule
      : "N/A",
    detail.location && detail.location.longitude
      ? parseFloat(detail.location.longitude)
      : -1000,
    detail.location && detail.location.latitude
      ? parseFloat(detail.location.latitude)
      : -1000
  );
}
