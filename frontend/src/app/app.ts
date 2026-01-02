import { Component, Provider, signal } from '@angular/core';
import { MapComponent } from './map/map';
import { MarkerService } from './marker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { BranchInput } from './branch-input/branch-input';
import { JsonDisplayer } from './json-displayer/json-displayer';
import { Table } from './table/table';
import { Branches } from "./branches/branches";

@Component({
  selector: 'app-root',
  imports: [MapComponent,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatFormFieldModule,
    MatInputModule,
    //JsonDisplayer,
    Table,
    BranchInput,
    FormsModule, 
    Branches],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers:[MarkerService ]
})
export class App {
  protected readonly title = signal('angular-leaflet-example');
}
