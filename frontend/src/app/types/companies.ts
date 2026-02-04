import RequestState from "./requestState";
import { CompanyParams } from "./companyparams";
import { v4 as uuidv4 } from 'uuid';
import { Benchmark } from "./benchmark";

export class Company {
  selectedEmail: string;
  selectedWebsite: string;

  constructor(
    public companyParams: CompanyParams,
    public id: string = uuidv4(),
    public emailState = RequestState.NOT_STARTED,
    public crawlerState = RequestState.NOT_STARTED,
    public analyzeState = RequestState.NOT_STARTED,
    public benchmarks = [],
  ) {
    this.selectedEmail = companyParams.emails?.[0] || "";
    this.selectedWebsite = companyParams.website?.[0] || "";
  }
}
