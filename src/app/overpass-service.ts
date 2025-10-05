import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class overpassService {
  private overpassUrl = 'https://overpass-api.de/api/interpreter';

  constructor(private http: HttpClient) {}

  getNearbyHandwerker(lat: number, lon: number, radius = 5000): Observable<any> {
    const query = `
      [out:json][timeout:25];
      (
        node["craft"](around:${radius},${lat},${lon});
        way["craft"](around:${radius},${lat},${lon});
        relation["craft"](around:${radius},${lat},${lon});
      );
      out center tags;
    `;

    const params = new HttpParams().set('data', query);

    return this.http.get<any>(this.overpassUrl, { params })
    
    }
}