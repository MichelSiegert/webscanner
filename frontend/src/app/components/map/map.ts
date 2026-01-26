import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet';
import { CraftFilterService } from '../../services/craft-filter-service';
import { CompanyDataService } from '../../services/company-data-service';
import { Company } from '../../types/companies';
import 'leaflet.markercluster';

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
  styleUrls: ['./map.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements AfterViewInit {
  currrentbranch: string = "";

  private map: L.Map | undefined;
  private markerLayer = L.layerGroup();
  private allMarkers: { marker: L.Marker, craft: string }[] = [];
  private crafts: Set<string> = new Set();
  private markerClusterGroup = L.markerClusterGroup();

  constructor(
    private craftFilterService: CraftFilterService,
    private companyDataService : CompanyDataService
  ) {  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [54.3233, 10.1228],
      zoom: 8
    });

    this.markerClusterGroup = L.markerClusterGroup({
    iconCreateFunction: (cluster) => {
    const count = cluster.getChildCount();
    let sizeClass = 'small';

    if (count > 50) {
      sizeClass = 'large';
    } else if (count > 20) {
      sizeClass = 'medium';
    }

    return L.divIcon({
      html: `<div><span>${count}</span></div>`,
      className: `custom-cluster cluster-${sizeClass}`,
      iconSize: L.point(40, 40)
        });
      }
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
    this.map!.addLayer(this.markerClusterGroup);

    this.companyDataService.companies$.subscribe(companies => {
        this.updateMarkers(companies);
    });

    this.craftFilterService.crafts$.subscribe(filter => {
        this.crafts = filter;
        this.applyFilter();
    });
  }

  applyFilter() {
      this.markerClusterGroup.clearLayers();

      const filteredMarkers = this.allMarkers
        .filter(item => this.crafts.size === 0 || this.crafts.has(item.craft))
        .map(item => item.marker);

      this.markerClusterGroup.addLayers(filteredMarkers);
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
          const alreadyExists = this.allMarkers.some(m =>
              m.marker.getLatLng().equals(company.companyParams.location, 0.0001)
          );

          if (!alreadyExists) {
              const marker = L.marker([company.companyParams.location.lat, company.companyParams.location.lng]);
              this.allMarkers.push({ marker, craft: company.companyParams.craft ?? "" });
          }
      });
      this.applyFilter();
    }
}
