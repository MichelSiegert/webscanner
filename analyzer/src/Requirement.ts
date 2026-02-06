import { Page } from "puppeteer";
import RequirementStatus from "./RequirementStatus.js";

interface Requirement {
    name: string;
    url: string;
    succeed: RequirementStatus;
    timestamp: number;

    evalutate(page: Page): Promise<RequirementStatus>;
}

export default Requirement;
