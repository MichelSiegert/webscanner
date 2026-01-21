import { CompanyParams } from "./companyparams";
import CrawlerState from "./crawlstate";
import EmailState from "./emailstate";

export class Company {
  emailState = EmailState.NOT_STARTED;
  crawlerState = CrawlerState.NOT_STARTED;

  constructor(
    public companyParams: CompanyParams
  ) {}
}
