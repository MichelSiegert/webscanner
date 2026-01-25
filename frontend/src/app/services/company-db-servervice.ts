import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Company } from '../types/companies';
import { lastValueFrom, map, Observable } from 'rxjs';
import { CompanyParams } from '../types/companyparams';
import { LatLng } from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class CompanyDbService {
  constructor(private http: HttpClient){}

  createCompany(company: Company) {
    this.http.post("/customerdb/companies", {
      "id": company.id,
      "name": company.companyParams.name ?? "",
      "craft": company.companyParams.craft ?? "",
      "city": company.companyParams.city ?? "",
      "emails": company.companyParams.emails ?? [],
      "websites": company.companyParams.website ?? [],
      "latitude": company.companyParams.location.lat,
      "longitude": company.companyParams.location.lng,
      "crawler_state": company.crawlerState.toString(),
      "email_state": company.emailState.toString()
    }).subscribe((e)=>{
      console.log(e);
    });
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<any[]>("/customerdb/companies").pipe(
      map((data) => data.map((e: any) => {
        const companyParams: CompanyParams = {
          location: new LatLng(e.latitude, e.longitude),
          name: e.name,
          city: e.city,
          craft: e.craft,
          emails: e.emails,
          website: e.websites
        };
        return new Company(companyParams, e.id, e.email_state, e.crawler_state);
      }))
    );
  }
}
