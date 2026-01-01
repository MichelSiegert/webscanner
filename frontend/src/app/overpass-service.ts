import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { BranchService } from './branch-service';

@Injectable({providedIn: 'root'})
export class overpassService {
  private overpassUrl = 'https://overpass-api.de/api/interpreter';

  constructor(private http: HttpClient, private branchService: BranchService) {}
  

  async getNearbyCompanies(lat: number, lon: number, radius = 5000): Promise<Observable<any>> {
    const branch = await firstValueFrom(this.branchService.currentBranch);

    const branchFilter = branch ? `["craft"="${branch}"]` : '["craft"]';

    const query = `
      [out:json][timeout:25];
      (
        node${branchFilter}(around:${radius},${lat},${lon});
        way${branchFilter}(around:${radius},${lat},${lon});
        relation${branchFilter}(around:${radius},${lat},${lon});
      );
      out center tags;
    `;

    const params = new HttpParams().set('data', query);

    return this.http.get<any>(this.overpassUrl, { params })
    
    }
}