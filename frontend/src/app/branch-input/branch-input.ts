import { Component, OnInit } from '@angular/core';
import { BranchService } from '../services/branch-service';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-branch-input',
  imports: [MatFormFieldModule, MatInputModule, MatFormField, FormsModule],
  templateUrl: './branch-input.html',
  styleUrl: './branch-input.css'
})

export class BranchInput {
    branch: string = '';
  currentValue: string = '';

  constructor(private branchService: BranchService){}

  ngOnInit() {
    this.branchService.currentBranch.subscribe(value => {
      this.currentValue = value;
      this.branch = value;
    });
  }

  onBranchChange(value: string) {
    this.branchService.setMessage(value);
  }

}
