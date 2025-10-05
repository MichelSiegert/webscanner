import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, max } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JsonReaderService {
  constructor(private http: HttpClient){}
  public dataSource = new BehaviorSubject<TreeNode[]>([]);
  currentJSON = this.dataSource.asObservable();

    ngOnInit(): void {
    this.loadGeoJSON();
  }

  loadGeoJSON(): void {
    this.http.get('/assets/data/usa-capitals.geojson').subscribe((data) => {
      this.dataSource.next(this.convertGeoJSONToTree(data));
    });
  }

  addToTreeFromJSON(json: any){
    const tmp = this.dataSource.value;
    tmp.push(this.jsonToTree(json, `${json.latlng.lat}, ${json.latlng.lng}`));
    console.log(this.jsonToTree(json));
    this.dataSource.next(tmp);
  }


  addLocaleToJson(json: any, name: string, maxDepth: number){
    const tmp = this.dataSource.value;
    const newEntry = this.jsonToTree(json,name,0,  maxDepth);
    console.log(tmp);
    if(!tmp.map((e)=>e.name).includes(newEntry.name)) tmp.push(newEntry);
    console.log(tmp);
    this.dataSource.next(tmp);
  }

  jsonToTree(
    data: any, 
    nodeName: string = 'root',   
    depth: number = 0,
    maxDepth: number = 3): TreeNode {
  if (data === null || data === undefined) {
    return { name: `${nodeName}: null` };
  }

  if (typeof data !== 'object' || depth >= maxDepth) {
    const value = typeof data === 'object' ? '[Object]' : data; 
    return { name: `${nodeName}: ${value}` };
  }

  if (typeof data !== 'object') {
    return { name: `${nodeName}: ${data}` };
  }

  if (Array.isArray(data)) {
    return {
      name: nodeName,
      children: data.map((item, index) => this.jsonToTree(item, `Item ${index}`, depth + 1, maxDepth))
    };
  }

  const children: TreeNode[] = Object.entries(data).map(([key, value]) => this.jsonToTree(value, key, depth + 1, maxDepth));

  return {
    name: nodeName,
    children: children.length ? children : undefined
  };
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
