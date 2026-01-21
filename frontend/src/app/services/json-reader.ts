import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, max } from 'rxjs';
import { TreeNode } from '../types/TreeNode/TreeNode';
import { Company } from '../types/companies';
import { CompanyParams } from '../types/companyparams';
import { LatLng } from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class JsonReaderService {
  parseCompanyFromJSON(place: any) : Company{
    const location = new LatLng(place.lat, place.lon)
    const companyParams : CompanyParams = {
      location: location,
      name: place?.tags?.name ?? "",
      city: place.tags?.["addr:city"] ?? "",
      craft: place?.tags?.craft ?? "",
      emails: place.tags.email? [place.tags.email]: [],
      website: place.tags.website? [place.tags.website] : []
    }
    return new Company(companyParams);
  }
  constructor(private http: HttpClient){}
  public dataSource = new BehaviorSubject<TreeNode[]>([]);
  currentJSON = this.dataSource.asObservable();

  addToTreeFromJSON(json: any){
    const tmp = this.dataSource.value;
    tmp.push(this.jsonToTree(json, `${json.latlng.lat}, ${json.latlng.lng}`));
    this.dataSource.next(tmp);
  }

  addLocaleToJson(json: any, name: string, maxDepth: number){
    const tmp = this.dataSource.value;
    const newEntry = this.jsonToTree(json,name,0,  maxDepth);
    if(!tmp.map((e)=>e.key).includes(newEntry.key)) tmp.push(newEntry);
    this.dataSource.next(tmp);
  }

  jsonToTree(
    data: any,
    nodeName: string = 'root',
    depth: number = 0,
    maxDepth: number = 3): TreeNode {

  if (data === null || data === undefined) {
    return { key: nodeName, value: null };
  }

  if (typeof data !== 'object' || depth >= maxDepth) {
    const value = typeof data === 'object' ? '[Object]' : data;
    return { key: nodeName, value: value };
  }

  if (typeof data !== 'object') {
    return { key: nodeName, value:data };
  }

  if (Array.isArray(data)) {
    return {
      key: nodeName,
      value: null,
      children: data.map((item, index) => this.jsonToTree(item, `Item ${index}`, depth + 1, maxDepth))
    };
  }

  const children: TreeNode[] = Object.entries(data).map(([key, value]) => this.jsonToTree(value, key, depth + 1, maxDepth));

  return {
    key: nodeName,
    value: null,
    children: children.length ? children : undefined
  };
  }
}


