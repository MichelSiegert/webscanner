import { CompanyParams } from "./companyparams";
import CrawlerState from "./crawlstate";
import EmailState from "./emailstate";

export class Company {
  emailState = EmailState.NOT_STARTED;
  crawlerState = CrawlerState.NOT_STARTED;
  selectedEmail: string;
  selectedWebsite: string;

  constructor(
    public companyParams: CompanyParams
  ) {
    this.selectedEmail = companyParams.emails?.[0] || "";
    this.selectedWebsite = companyParams.website?.[0] || "";
  }
}
