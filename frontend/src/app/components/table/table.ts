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
import { CompanyDataService } from '../../services/company-data-service';
import { SnackbarService } from '../../services/snackbar-service';
import RequestState from '../../types/requestState';
import { Requirements } from '../../types/Requirements';

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
  public RequestState = RequestState;


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
  if ([RequestState.PENDING, RequestState.SUCCESS].includes(company.crawlerState)) return;

  company.crawlerState = RequestState.PENDING;

  this.http.post(`/crawler/search`, {
    city: company.companyParams.city ?? "",
    company: company.companyParams.name
  })
  .subscribe({
    next: (result: any) => {
      if (!result?.websites?.length) {
        this.handleFailure(company, "crawlerState", "No websites found for this company.");
        return;
      }

      company.crawlerState = RequestState.SUCCESS;
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
      this.handleFailure(company, "crawlerState", errorMessage);
    }
  });
}

analyzePage(company: Company) {
  if([RequestState.PENDING, RequestState.SUCCESS].includes(company.analyzeState)) return;

  company.analyzeState = RequestState.PENDING;

  this.http.get<HttpResponse<any>>("/analyzer",
    {
      params: {
        url: company.selectedWebsite,
      },
      observe: "response"
    })
  .subscribe({
    next:(mailSentResponse: HttpResponse<any>)=>{
    if(mailSentResponse.status == HttpStatusCode.Ok ) {
      const analysisResults = JSON.parse(mailSentResponse.body);
      console.log(analysisResults);
      company.requirements.push(...(analysisResults?.requirements ?? []).map((e:any)=>{
        return new Requirements(e.name, e.url, e.succeed === "SUCCESS", e.timestamp);
      }));
      company.analyzeState = RequestState.SUCCESS;
      this.companyDataService.updateEntry(company);
      this.snackbarService.showSuccessMessage(`Successfully analyzed ${company.companyParams.name} website ${company.selectedWebsite}!`);
    } else {
      this.handleFailure(company, "analyzeState", `Unexpected status: ${mailSentResponse.status}`);
    }
    },
    error: (err) => {
    const errorDetail = err.error?.detail || err.message || "Server error";
      this.handleFailure(company, "analyzeState", `Error: ${errorDetail}`);
    }
});
}

sendMail(company: Company) {
  if([RequestState.PENDING, RequestState.SUCCESS].includes(company.emailState)) return;

  company.emailState = RequestState.PENDING;

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
      company.emailState = RequestState.SUCCESS;
      this.companyDataService.updateEntry(company);
      this.snackbarService.showSuccessMessage(`The email for company ${company.companyParams.name} has been sent to ${company.selectedEmail}!`);
    } else {
      this.handleFailure(company, "emailState", `Unexpected status: ${mailSentResponse.status}`);      }
    },
    error: (err) => {
    const errorDetail = err.error?.detail || err.message || "Server error";
      this.handleFailure(company, "emailState", `Error: ${errorDetail}`);
    }
});
}

private handleFailure(company: Company, stateKey: keyof Company, message: string) {
  this.snackbarService.showErrorMessage(message);
  (company[stateKey] as any) = RequestState.NOT_STARTED;
  this.companyDataService.updateEntry(company);
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
