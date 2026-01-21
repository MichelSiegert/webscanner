import { Component, OnInit } from '@angular/core';
import { MatInputModule } from "@angular/material/input";
import { JsonReaderService } from '../../services/json-reader';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CraftFilter } from '../../services/craft-filter';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Company } from '../../types/companies';
import CrawlerState from  '../../types/crawlstate';
import EmailState from '../../types/emailstate';

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

  constructor(private jsonReader: JsonReaderService, private http: HttpClient, private craftFilter: CraftFilter) {}
  ngOnInit(): void {
    this.jsonReader.currentJSON.subscribe((e: Company[])=>{
      this.entries = e
    });

    this.craftFilter.craftSource.subscribe((crafts) => {
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
    const links = (result?.websites || []).map((r: any) => r.link).filter((link: any) => !!link);
    company.companyParams.website = links;
    company.companyParams.emails = result?.emails || [];
    this.updateEntry(company);
  });
}

sendMail(company: Company) {
  if([EmailState.PENDING, EmailState.SUCCESS].includes(company.emailState)) return;

  this.http.get(`/email?website=${company.selectedWebsite}&email=${company.selectedEmail}`)
  .subscribe((result: any)=>{
    if(result.status == 200) {
      company.emailState = EmailState.SUCCESS;
      this.updateEntry(company)
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
    this.currentPageIndex = 0;
    this.updatePagination();
  }


  persistSelection(company: Company, property: 'selectedEmail' | 'selectedWebsite', value: string) {
    company[property] = value;

    const currentCompanies = this.jsonReader.dataSource.value;
    const updatedList = currentCompanies.map(c =>
      c === company ? company : c
    );
    this.jsonReader.dataSource.next(updatedList);
}
  private updateEntry(company: Company){
    const updatedList = this.jsonReader.dataSource.value.map((c: Company) =>
    company.companyParams.name === company.companyParams.name
      ? company
      : c
    );
    this.jsonReader.dataSource.next(updatedList)
  }
}
