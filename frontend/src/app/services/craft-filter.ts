import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CraftFilter {
    public craftSource = new BehaviorSubject<Set<string>>(new Set());

  changeToggles(selectedBranches: Set<string>){
    this.craftSource.next(selectedBranches);
  }

}
