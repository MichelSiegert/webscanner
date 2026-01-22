import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CraftFilterService {
    public craftSource = new BehaviorSubject<Set<string>>(new Set());

  changeToggles(selectedBranches: Set<string>){
    this.craftSource.next(selectedBranches);
  }

}
