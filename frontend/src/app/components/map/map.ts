import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { JsonReaderService } from '../../services/json-reader';
import { overpassService } from '../../services/overpass-service';
import { CraftFilter } from '../../services/craft-filter';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;


@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements AfterViewInit {
  currrentbranch: string = "";

  private map: L.Map | undefined;
  private markerLayer = L.layerGroup();
  private allMarkers: { marker: L.Marker, craft: string }[] = [];

  constructor(
    private craftFilter: CraftFilter,
    private jsonReader: JsonReaderService,
    private handwerkerService : overpassService) {  }


  private initMap(): void {
    this.map = L.map('map', {
      center: [54.3233, 10.1228],
      zoom: 8
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

  this.map.on('click', async (e) => {
    const result = await this.handwerkerService.getNearbyCompanies(e.latlng.lat, e.latlng.lng);
    result.subscribe((places: any) => {
      console.log(places);

      places.elements.forEach((place: any) => {
        if (place.lat && place.lon) {
          const alreadyExists = this.isMarkerAt(place.lat, place.lon);
          const craft = place.tags.craft;

          if (!alreadyExists) {
            this.jsonReader.parseCompanyFromJSON(place);
            const marker = L.marker([place.lat, place.lon]);
            this.allMarkers.push({ marker, craft });
            (marker as any).companyData = place;

            const currentFilter = this.craftFilter.craftSource.value;
            if (currentFilter.size === 0 || currentFilter.has(craft)) {
              marker.addTo(this.markerLayer);
            }
          }
        }
      });
    });
});
}
  isMarkerAt(lat: any, lon: any) {
  let exists = false;
  this.markerLayer.eachLayer((layer: any) => {
    const pos = layer.getLatLng();
    if (Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lon) < 0.0001) {
      exists = true;
    }
  });
  return exists;  }


  ngAfterViewInit(): void {
    this.initMap();
    this.markerLayer.addTo(this.map!);

    this.craftFilter.craftSource.subscribe((selectedCrafts: Set<string>) => {
      this.filterMarkers(selectedCrafts);
    });
  }
  filterMarkers(selectedCrafts: Set<string>) {
    this.markerLayer.clearLayers();
    this.allMarkers.forEach(item => {
      if (selectedCrafts.size === 0 || selectedCrafts.has(item.craft)) {
        item.marker.addTo(this.markerLayer);
      }
    });
  }


}
