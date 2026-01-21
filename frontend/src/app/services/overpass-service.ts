import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, retry, throwError, timer } from 'rxjs';
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

    return this.http.get<any>(this.overpassUrl, { params }).pipe(
      retry({
        count: 10,
        delay: (error, retryCount) => {
          if ([429, 503, 504].includes(error.status) || error.status === 0) {
            const baseDelay = Math.pow(2, retryCount) * 1000;
            const jitter = (Math.random() - 0.5) * (baseDelay * 0.3);
            const backoffTime = baseDelay + jitter;

            console.warn(`Overpass busy. Retrying in ${backoffTime}ms...`);
            return timer(backoffTime);
          }
          return throwError(() => error);
        }
      })
    );
  }
}
