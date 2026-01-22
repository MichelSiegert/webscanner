import { Component, OnInit } from '@angular/core';
import { CompanyMapperService } from '../../services/company-mapper-service';
import { CommonModule } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { CraftFilterService } from '../../services/craft-filter-service';
import { Company } from '../../types/companies';

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

  constructor(private companyMapperService: CompanyMapperService, private craftFilterService: CraftFilterService){}

  ngOnInit(): void {
    this.companyMapperService.dataSource.subscribe((data: Company[])=>{
      this.app = data;
      this.uniqueCrafts = this.getUniqueCrafts(data);
    })
  }

  toggleCraft(craft: string, checked: boolean) {
    checked
      ? this.selectedCrafts.add(craft)
      : this.selectedCrafts.delete(craft);
    this.craftFilterService.craftSource.next(this.selectedCrafts);
  }

  getUniqueCrafts(data: Company[]): string[]{
    const crafts = new Set<string>( data.map((e: Company) => e.companyParams.craft ?? ""));
    return Array.from(crafts);
  }
}
