import { Component, Provider, signal } from '@angular/core';
import { MapComponent } from './map/map';
import { Marker } from './marker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@Component({
  selector: 'app-root',
  imports: [MapComponent, MatSlideToggleModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers:[Marker ]
})
export class App {
  protected readonly title = signal('angular-leaflet-example');
}
