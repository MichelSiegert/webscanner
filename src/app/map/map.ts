import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../marker';
import { BranchService } from '../branch-service';
import { JsonReaderService } from '../json-reader';
import { overpassService } from '../overpass-service';

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
    this.handwerkerService.getNearbyHandwerker(e.latlng.lat, e.latlng.lng)
    .subscribe((places: any)=>{
      places.elements.forEach((place: any)=>{
        this.jsonReader.addLocaleToJson(place, place.tags.name, 10);
        const marker = L.marker({lat:place.lat,  lng:place.lon});
        marker.addTo(this.map!);
       });
      });
});
  }

  constructor(private marker : MarkerService, private branchService: BranchService, private jsonReader: JsonReaderService, private handwerkerService : overpassService) {  }

  ngAfterViewInit(): void { 
    this.initMap();
    this.marker.makeCapitalMarkersCircle(this.map!);

    this.branchService.currentBranch.subscribe((newBranch :string)=>{
      this.currrentbranch = newBranch;
    });
  }


}
