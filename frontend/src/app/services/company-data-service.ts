import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, switchMap, take, tap } from 'rxjs';
import { Company } from '../types/companies';
import { OverpassService } from './overpass-service';
import { CompanyMapperService } from './company-mapper-service';
import { CompanyDbService } from './company-db-service';

@Injectable({ providedIn: 'root' })
export class CompanyDataService {
    private dataSource = new BehaviorSubject<Company[]>([]);
    companies$ = this.dataSource.asObservable();

    constructor(
      private overpassService: OverpassService,
      private mapper: CompanyMapperService,
      private companyDbService: CompanyDbService
    ) {
      this.refreshCompanies();
    }

    refreshCompanies() {
      this.companyDbService.getCompanies().subscribe({
        next: (companies) => this.dataSource.next(companies),
        error: (err) => console.error('Error loading companies', err)
      });
    }

    public fetchCompanies(lat: number, lng: number): void {
        this.overpassService.getNearbyCompanies(lat, lng).pipe(
          map((places: any)=>{
            const currentCompanies = this.dataSource.value;
            return places.elements
                .filter((p: any) => p.lat && p.lon && !this.exists(p?.tags?.name ?? "", currentCompanies))
                .map((p: any) => this.mapper.parseCompanyFromJSON(p));
          }),

          filter(newCompanies => newCompanies.length > 0),

          tap(newCompanies => {
            const current = this.dataSource.value;
            this.dataSource.next([...current, ...newCompanies]);
          }),
          switchMap(newCompanies => this.companyDbService.bulkCreateCompanies(newCompanies)),
          take(1)

        ).subscribe()
    }

    private exists(name: string, list: Company[]): boolean {
        return list.some((c:Company) => c.companyParams.name === name);
    }

  public persistSelection(company: Company, property: 'selectedEmail' | 'selectedWebsite', value: string) {
    company[property] = value;

    const currentCompanies = this.dataSource.value;
    const updatedList = currentCompanies.map(c => c.id === company.id ? company : c);
    this.companyDbService.updateCompany(company).subscribe((e)=>{console.log(e)});
    this.dataSource.next(updatedList);
}

public updateEntry(updatedCompany: Company) {
  const previousList = this.dataSource.value;

  const updatedList = previousList.map(c =>
    c.id === updatedCompany.id ? updatedCompany : c
  );
  this.dataSource.next(updatedList);

  this.companyDbService.updateCompany(updatedCompany).pipe(
    take(1)
  ).subscribe({
    error: (err) => {
      console.error("Database sync failed, rolling back...", err);
      this.dataSource.next(previousList);
    }
  });
}
}
