import Requirement from "./Requirement.js";
import ImpressumRequirement from "./requirements/impressum.js";
import RequirementStatus from "./RequirementStatus.js";

class WebReport {
    requirements: Requirement[] = [];
    
    constructor(public url: string, public timestamp = Date.now()){
        this.requirements.push(new ImpressumRequirement(this.url));
    }

    didFail(): boolean{
        return !this.requirements.some((e: Requirement)=>e.succeed === RequirementStatus.FAILED)
    }
}

export default WebReport;
