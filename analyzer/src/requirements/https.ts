import { Page } from "puppeteer";
import Requirement from "../types/Requirement.js";
import RequirementStatus from "../types/RequirementStatus.js";
import https from 'https';
import { IncomingMessage } from "http";

class HttpsRequirement implements Requirement {
    name: string ="HttpsCheck";
    url: string;
    succeed: RequirementStatus;
    timestamp: number;

    constructor(url: string) {
        this.url = url;
        this.succeed = RequirementStatus.PENDING;
        this.timestamp = Date.now();
    }

    async evaluate(_page: Page): Promise<RequirementStatus> {
        return new Promise((resolve) => {
        const options = {
            method: 'GET',
            rejectUnauthorized: false,
            timeout: 5000
        };

        const req = https.request(this.url, options, (res: IncomingMessage) => {
            const socket = (res.socket as any);
            const cert = socket.getPeerCertificate();
            
            if (!cert || Object.keys(cert).length === 0) {
                this.succeed = RequirementStatus.FAILED;
                return resolve(this.succeed);
            }

            const isSelfSigned = cert.issuer.CN === cert.subject.CN;
            
            this.succeed = isSelfSigned ? RequirementStatus.FAILED : RequirementStatus.SUCCESS;
            resolve(this.succeed);
        });

        req.on('error', (e: any) => {
            this.succeed = RequirementStatus.FAILED;
            resolve(this.succeed);
        });

        req.on('timeout', () => {
            req.destroy();
            this.succeed = RequirementStatus.FAILED;
            resolve(this.succeed);
        });

        req.end();
    });

}
}
export default HttpsRequirement;
