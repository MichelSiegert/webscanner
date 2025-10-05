import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JsonReader implements OnInit {
  constructor(private http: HttpClient){}
  public dataSource = new BehaviorSubject<TreeNode[]>([
  {
    name: 'Fruit',
    children: [{name: 'Apple'}, {name: 'Banana'}, {name: 'Fruit loops'}],
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
      },
      {
        name: 'Orange',
        children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
      },
    ],
  },
]);
  currentJSON = this.dataSource.asObservable();

    ngOnInit(): void {
    this.loadGeoJSON();
  }

  loadGeoJSON(): void {
    this.http.get('/assets/data/usa-capitals.geojson').subscribe((data) => {
      this.dataSource.next(this.convertGeoJSONToTree(data));
    });
  }

  convertGeoJSONToTree(geojson: any): TreeNode[] {
    if (!geojson.features) return [];

    return geojson.features.map((feature: any, index: number) => ({
      name: feature.properties.name || `Feature ${index + 1}`,
      children: Object.entries(feature.properties)
        .filter(([key]) => key !== 'name')
        .map(([key, value]) => ({ name: `${key}: ${value}` }))
    }));
  }
}
