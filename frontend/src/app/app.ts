import { Component, signal } from '@angular/core';
import { MapComponent } from './components/map/map';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Table } from './components/table/table';
import { Branches } from "./components/branches/branches";

@Component({
  selector: 'app-root',
  imports: [MapComponent,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatFormFieldModule,
    MatInputModule,
    Table,
    FormsModule,
    Branches],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers:[]
})
export class App {
  protected readonly title = signal('web-scan-frontend');
}
