import { CompanyParams } from "./companyparams";
import CrawlerState from "./crawlstate";
import EmailState from "./emailstate";
import { v4 as uuidv4 } from 'uuid';

export class Company {
  selectedEmail: string;
  selectedWebsite: string;

  constructor(
    public companyParams: CompanyParams,
    public id: string = uuidv4(),
    public emailState = EmailState.NOT_STARTED,
    public crawlerState = CrawlerState.NOT_STARTED,

  ) {
    this.selectedEmail = companyParams.emails?.[0] || "";
    this.selectedWebsite = companyParams.website?.[0] || "";
  }
}
