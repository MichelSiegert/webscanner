import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Company } from '../types/companies';

@Injectable({
  providedIn: 'root'
})
export class CraftFilterService {

    private crafts : BehaviorSubject<Set<string>> = new BehaviorSubject<Set<string>>(new Set());
    public crafts$ = this.crafts.asObservable();

  changeToggles(selectedBranches: Set<string>){
    this.crafts.next(selectedBranches);
  }

  public toggleCraft(craft: string, checked: boolean) {
      const selectedCrafts = this.crafts.value;
    checked
      ? selectedCrafts.add(craft)
      : selectedCrafts.delete(craft);
    this.crafts.next(selectedCrafts);
  }

  getUniqueCrafts(companies: Company[]): string[] {
    const crafts = new Set<string>( companies.map((company: Company) => company.companyParams.craft?.trim().toLocaleLowerCase() ?? ""));
    return Array.from(crafts).sort();
  }
}
