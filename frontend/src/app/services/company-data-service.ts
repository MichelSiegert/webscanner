import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Company } from '../types/companies';
import { OverpassService } from './overpass-service';
import { CompanyMapperService } from './company-mapper-service';
import { CompanyDbService } from './company-db-servervice';

@Injectable({ providedIn: 'root' })
export class CompanyDataService {
    private dataSource = new BehaviorSubject<Company[]>([]);
    companies$ = this.dataSource.asObservable();

    constructor(
      private overpassService: OverpassService,
      private mapper: CompanyMapperService,
      private companyDbService: CompanyDbService
    ) {
      this.companyDbService.getCompanies().subscribe((e: Company[])=>{
        this.refreshCompanies();
      });
    }

    refreshCompanies() {
      this.companyDbService.getCompanies().subscribe({
        next: (companies) => this.dataSource.next(companies),
        error: (err) => console.error('Error loading companies', err)
      });
    }

    public fetchCompanies(lat: number, lng: number): void {
        this.overpassService.getNearbyCompanies(lat, lng).subscribe((places: any) => {
            const currentCompanies = this.dataSource.value;

            const newCompanies = places.elements
                .filter((p: any) => p.lat && p.lon && !this.exists(p?.tags?.name ?? "", currentCompanies))
                .map((p: any) => {
                  const c: Company = this.mapper.parseCompanyFromJSON(p);
                  this.companyDbService.createCompany(c);
                  return c;
                });

            if (newCompanies.length > 0) {
                this.dataSource.next([...currentCompanies, ...newCompanies]);
            }
        });
    }

    private exists(name: string, list: Company[]): boolean {
        return list.some((c:Company) => c.companyParams.name === name);
    }

  public persistSelection(company: Company, property: 'selectedEmail' | 'selectedWebsite', value: string) {
    company[property] = value;

    const currentCompanies = this.dataSource.value;
    const updatedList = currentCompanies.map(c =>
      c === company ? company : c
    );
    this.dataSource.next(updatedList);
}

  public updateEntry(updatedCompany: Company){
    const updatedList = this.dataSource.value.map((c: Company) =>
      {
        const isMatch = c.companyParams.name === updatedCompany.companyParams.name;
        return isMatch ? updatedCompany : c;}
    );
    this.dataSource.next(updatedList)
  }
}
