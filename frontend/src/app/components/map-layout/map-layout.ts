import { Component } from '@angular/core';
import { MapComponent } from "../map/map.js";
import { Branches } from "../branches/branches.js";
import { Table } from "../table/table.js";

@Component({
  selector: 'app-map-layout',
  imports: [MapComponent, Branches, Table],
  templateUrl: './map-layout.html',
  styleUrl: './map-layout.css'
})
export class MapLayout {

}
