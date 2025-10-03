import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private branchSource = new BehaviorSubject<string>("");
    currentBranch = this.branchSource.asObservable();

  setMessage(branch: string):void{
    this.branchSource.next(branch);
  }
  constructor(){}
}
