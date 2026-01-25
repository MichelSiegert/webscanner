import { Component, OnInit } from '@angular/core';
import { MatInputModule } from "@angular/material/input";
import { CompanyMapperService } from '../../services/company-mapper-service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CraftFilterService } from '../../services/craft-filter-service';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Company } from '../../types/companies';
import CrawlerState from  '../../types/crawlstate';
import EmailState from '../../types/emailstate';
import { CompanyDataService } from '../../services/company-data-service';

@Component({
  selector: 'app-table',
  imports: [
    MatInputModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class Table implements OnInit{

  public entries : Company[]= [];
  public filteredEntries: any[] = [];
  public paginatedEntries: any[] = [];
  private currentPageSize = 5;
  public currentPageIndex = 0;
  public CrawlerState = CrawlerState;
  public EmailState = EmailState;

  private selectedCrafts: Set<string> = new Set();

  constructor(protected companyDataService: CompanyDataService, private http: HttpClient, private craftFilterService: CraftFilterService) {}
  ngOnInit(): void {
    this.companyDataService.companies$.subscribe((e: Company[])=>{
      this.entries = e
      this.applyFilter();
    });

    this.craftFilterService.craftSource.subscribe((crafts) => {
      this.currentPageIndex= 0;
      this.selectedCrafts = crafts;
      this.applyFilter();
    });
  }

  updatePagination() {
    const startIndex = this.currentPageIndex * this.currentPageSize;
    const endIndex = startIndex + this.currentPageSize;
    this.paginatedEntries = this.filteredEntries.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.currentPageSize = event.pageSize;
    this.currentPageIndex = event.pageIndex;
    this.updatePagination();
  }

triggerAction(company: Company) {
  if ([CrawlerState.PENDING, CrawlerState.SUCCESS].includes(company.crawlerState)) return;
  company.crawlerState = CrawlerState.PENDING;
  this.http.get(`/api/search?company=${company.companyParams.name}&city=${company.companyParams.city}`)
  .subscribe((result:any)=>{
    company.crawlerState = CrawlerState.SUCCESS;
    const links = (result?.websites || []).map((r: any) => r.link).filter((link: any) => !!link);

    company.companyParams.website = links ?? [];
    if(company.companyParams.website!.length)company.selectedWebsite = company.companyParams.website![0];
    company.companyParams.emails = result?.emails || [];
    if(company.companyParams.emails!.length)company.selectedEmail= company.companyParams.emails![0]

    this.companyDataService.updateEntry(company);
  });
}

sendMail(company: Company) {
  if([EmailState.PENDING, EmailState.SUCCESS].includes(company.emailState)) return;

  this.http.get(`/email?website=${company.selectedWebsite}&email=${company.selectedEmail}`)
  .subscribe((result: any)=>{
    if(result.status == 200) {
      company.emailState = EmailState.SUCCESS;
      this.companyDataService.updateEntry(company);
    }
  });
}

  private applyFilter() {
    if (this.selectedCrafts.size === 0) {
      this.filteredEntries = [...this.entries];
    } else {
      this.filteredEntries = this.entries.filter(entry =>
        this.selectedCrafts.has(entry.companyParams.craft?.trim() ?? "")
      );
    }
    this.updatePagination();
  }
}
