import { LatLng } from "leaflet";

export class Companies {
  location: LatLng
  name: string;
  craft: string;
  emails: string[];
  city: string;
  website: string[];

  constructor(name: string = "", craft :string= "", emails: string[] = [], city: string, website: string[], lat: number, lon: number) {
    this.name = name;
    this.craft = craft;
    this.emails = emails;
    this.city = city
    this.website = website;
    this.location = new LatLng(lat, lon);

  }
}
