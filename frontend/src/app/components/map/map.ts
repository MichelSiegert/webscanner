import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CraftFilterService } from '../../services/craft-filter-service';
import { CompanyDataService } from '../../services/company-data-service';
import { Company } from '../../types/companies';

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
    private companyDataService : CompanyDataService
  ) {  }

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
    this.companyDataService.fetchCompanies(e.latlng.lat, e.latlng.lng);
    });
  }

ngAfterViewInit(): void {
    this.initMap();
    this.markerLayer.addTo(this.map!);

    this.companyDataService.companies$.subscribe(companies => {
        this.updateMarkers(companies);
    });

    this.craftFilterService.craftSource.subscribe(filter => {
        this.applyFilter(filter);
    });
}

  applyFilter(selectedCrafts: Set<string>) {
    this.markerLayer.clearLayers();
    this.allMarkers.forEach(item => {
      if (selectedCrafts.size === 0 || selectedCrafts.has(item.craft)) {
        item.marker.addTo(this.markerLayer);
      }
    });
  }

  isMarkerAt(location: L.LatLng) {
  let exists = false;
  this.markerLayer.eachLayer((layer: any) => {
    const pos = layer.getLatLng();
    if (Math.abs(pos.lat - location.lat) < 0.0001 && Math.abs(pos.lng - location.lng) < 0.0001) {
      exists = true;
    }
    });
    return exists;
  }

  private updateMarkers(companies: Company[]) {
    companies.forEach((company: Company) => {
      if (!this.isMarkerAt(company.companyParams.location)) {
          const marker = L.marker([company.companyParams.location.lat, company.companyParams.location.lng]);
          this.allMarkers.push({ marker, craft: company.companyParams.city ?? "" });
          this.applyFilter(this.craftFilterService.craftSource.value);
      }
    });
  }
}
