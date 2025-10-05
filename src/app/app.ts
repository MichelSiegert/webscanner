import { Component, Provider, signal } from '@angular/core';
import { MapComponent } from './map/map';
import { MarkerService } from './marker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { BranchInput } from './branch-input/branch-input';
import { JsonDisplayer } from './json-displayer/json-displayer';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [MapComponent, 
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconButton,
    MatFormFieldModule,
    MatIcon, 
    MatInputModule,
    JsonDisplayer,
    BranchInput,
    FormsModule ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers:[MarkerService ]
})
export class App {
  protected readonly title = signal('angular-leaflet-example');
}
