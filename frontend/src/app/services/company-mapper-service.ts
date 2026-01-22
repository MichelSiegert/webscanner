import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Company } from '../types/companies';
import { CompanyParams } from '../types/companyparams';
import { LatLng } from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class CompanyMapperService {


  public dataSource = new BehaviorSubject<Company[]>([]);
  currentJSON: Observable<Company[]> = this.dataSource.asObservable();


    parseCompanyFromJSON(place: any) : void{
    const location = new LatLng(place.lat, place.lon)
    const companyParams : CompanyParams = {
      location: location,
      name: place?.tags?.name ?? "",
      city: place.tags?.["addr:city"] ?? "",
      craft: place?.tags?.craft ?? "",
      emails: place.tags.email? [place.tags.email]: [],
      website: place.tags.website? [place.tags.website] : []
    }
    const company = new Company(companyParams);
    const tmp = this.dataSource.value;
    tmp.push(company);
    this.dataSource.next(tmp);
  }
}


