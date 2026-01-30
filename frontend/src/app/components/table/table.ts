import { Component, OnInit } from '@angular/core';
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from '@angular/common';
import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { CraftFilterService } from '../../services/craft-filter-service';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Company } from '../../types/companies';
import CrawlerState from  '../../types/crawlstate';
import EmailState from '../../types/emailstate';
import { CompanyDataService } from '../../services/company-data-service';
import { SnackbarService } from '../../services/snackbar-service';

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
  private selectedCrafts: Set<string> = new Set();
  private currentPageSize = 5;

  public entries : Company[]= [];
  public filteredCompanies: Company[] = [];
  public paginatedCompanies: Company[] = [];
  public currentPageIndex = 0;
  public CrawlerState = CrawlerState;
  public EmailState = EmailState;


  constructor(
    protected companyDataService: CompanyDataService,
    private http: HttpClient,
    private craftFilterService: CraftFilterService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.companyDataService.companies$.subscribe((e: Company[])=>{
      this.entries = e
      this.applyFilter();
    });

    this.craftFilterService.crafts$.subscribe((crafts) => {
      this.currentPageIndex= 0;
      this.selectedCrafts = crafts;
      this.applyFilter();
    });
  }

  updatePagination() {
    const startIndex = this.currentPageIndex * this.currentPageSize;
    const endIndex = startIndex + this.currentPageSize;
    this.paginatedCompanies = this.filteredCompanies.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.currentPageSize = event.pageSize;
    this.currentPageIndex = event.pageIndex;
    this.updatePagination();
  }

crawlPage(company: Company) {
  if ([CrawlerState.PENDING, CrawlerState.SUCCESS].includes(company.crawlerState)) return;

  company.crawlerState = CrawlerState.PENDING;

  this.http.post(`/api/search`, {
    city: company.companyParams.city ?? "",
    company: company.companyParams.name
  })
  .subscribe({
    next: (result: any) => {
      if (!result?.websites?.length) {
        this.handleCrawlerFailure(company, "No websites found for this company.");
        return;
      }

      company.crawlerState = CrawlerState.SUCCESS;
      const links = result.websites.map((r: any) => r.link).filter((link: any) => !!link);

      company.companyParams.website = links;
      if(links.length) company.selectedWebsite = links[0];

      company.companyParams.emails = result.emails || [];
      if(company.companyParams.emails?.length) company.selectedEmail = company.companyParams.emails[0];

      this.snackbarService.showSuccessMessage(`Crawler finished for ${company.companyParams.name}`);
      this.companyDataService.updateEntry(company);
    },
    error: (err: any) => {
      const errorMessage = err.error?.message || err.error?.error || "An unknown error occurred";
      this.handleCrawlerFailure(company, errorMessage);
    }
  });
}

private handleCrawlerFailure(company: Company, message: string) {
  company.crawlerState = CrawlerState.FAILED;
  this.snackbarService.showErrorMessage(message);
  company.crawlerState = CrawlerState.NOT_STARTED;
  this.companyDataService.updateEntry(company);
}
sendMail(company: Company) {
  if([EmailState.PENDING, EmailState.SUCCESS].includes(company.emailState)) return;

  company.emailState = EmailState.PENDING;

  this.http.post<HttpResponse<any>>("/email",
    {
      website: company.selectedWebsite,
      email: company.selectedEmail
    },
    {
    observe: "response"
  })
  .subscribe({
    next:(mailSentResponse: HttpResponse<any>)=>{
    if(mailSentResponse.status == HttpStatusCode.Created ) {
      company.emailState = EmailState.SUCCESS;
      this.companyDataService.updateEntry(company);
      this.snackbarService.showSuccessMessage(`The email for company ${company.companyParams.name} has been sent to ${company.selectedEmail}!`);
    } else {
          this.snackbarService.showErrorMessage(`response returned with status  ${mailSentResponse.status}`);
    }
  },
  error: (e: any) => {
    company.emailState = EmailState.FAILED;
    this.snackbarService.showErrorMessage(`error sending email: ${e.message}`);
    company.emailState= EmailState.NOT_STARTED;
    this.companyDataService.updateEntry(company);
  }
});
}
  private applyFilter() {
    if (this.selectedCrafts.size === 0) {
      this.filteredCompanies = [...this.entries];
    } else {
      this.filteredCompanies = this.entries.filter(entry =>
        this.selectedCrafts.has(entry.companyParams.craft?.trim() ?? "")
      );
    }
    this.updatePagination();
  }
}
