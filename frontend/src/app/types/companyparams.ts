import { LatLng } from "leaflet";

export interface CompanyParams {
  name: string;
  craft?: string;
  emails?: string[];
  city?: string;
  website?: string[];
  location: LatLng;
}
