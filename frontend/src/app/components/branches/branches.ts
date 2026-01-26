import { Component, OnInit } from '@angular/core';
import { CompanyMapperService } from '../../services/company-mapper-service';
import { CommonModule } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { CraftFilterService } from '../../services/craft-filter-service';
import { Company } from '../../types/companies';
import { CompanyDataService } from '../../services/company-data-service';

@Component({
  selector: 'app-branches',
  imports: [CommonModule, MatCheckbox],
  templateUrl: './branches.html',
  styleUrl: './branches.css'
})
export class Branches implements OnInit {
  app: Company[] = [];
  uniqueCrafts: string[] = [];
  selectedCrafts = new Set<string>();

  constructor(private companyDataService: CompanyDataService, private craftFilterService: CraftFilterService){}

  ngOnInit(): void {
    this.companyDataService.companies$.subscribe((data: Company[])=>{
      this.app = data;
      this.uniqueCrafts = this.craftFilterService.getUniqueCrafts(data);
    });
  }

  toggleCraft(craft: string, checked: boolean) {
    this.craftFilterService.toggleCraft(craft, checked);
  }

}
