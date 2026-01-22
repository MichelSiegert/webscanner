import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CompanyMapperService } from '../../services/company-mapper-service';
import { OverpassService } from '../../services/overpass-service';
import { CraftFilterService } from '../../services/craft-filter-service';

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
    private craftFilterService: CraftFilterService,
    private jsonReader: CompanyMapperService,
    private overpassService : OverpassService) {  }


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
    const result = this.overpassService.getNearbyCompanies(e.latlng.lat, e.latlng.lng);
    result.subscribe((places: any) => {
      places.elements.forEach((place: any) => {
        if (place.lat && place.lon) {
          const alreadyExists = this.isMarkerAt(place.lat, place.lon);
          const craft = place.tags.craft;

          if (!alreadyExists) {
            this.jsonReader.parseCompanyFromJSON(place);
            const marker = L.marker([place.lat, place.lon]);
            this.allMarkers.push({ marker, craft });
            (marker as any).companyData = place;

            const currentFilter = this.craftFilterService.craftSource.value;
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
  return exists;
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.markerLayer.addTo(this.map!);

    this.craftFilterService.craftSource.subscribe((selectedCrafts: Set<string>) => {
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
