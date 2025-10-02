import { Component, signal } from '@angular/core';
import { MapComponent } from './map/map';
import { HttpClientModule } from '@angular/common/http';
import { Marker } from './marker';

@Component({
  selector: 'app-root',
  imports: [MapComponent, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers:[Marker]
})
export class App {
  protected readonly title = signal('angular-leaflet-example');
}
