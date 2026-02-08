import RequestState from "./requestState";
import { CompanyParams } from "./companyparams";
import { v4 as uuidv4 } from 'uuid';
import { Requirements } from "./Requirements";

export class Company {
  selectedEmail: string;
  selectedWebsite: string;

  constructor(
    public companyParams: CompanyParams,
    public emailState: RequestState = RequestState.NOT_STARTED,
    public crawlerState: RequestState = RequestState.NOT_STARTED,
    public analyzeState: RequestState = RequestState.NOT_STARTED,
    public requirements: Requirements[] = [],
    public id: string = uuidv4(),

  ) {
    this.selectedEmail = companyParams.emails?.[0] || "";
    this.selectedWebsite = companyParams.website?.[0] || "";
  }
}
