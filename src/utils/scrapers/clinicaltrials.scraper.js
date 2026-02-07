import axios from "axios";
import { BaseScraper } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const CT_API_URL = "https://clinicaltrials.gov/api/v2/studies";

export class ClinicalTrialsScraper extends BaseScraper {
    constructor() {
        super("ClinicalTrials.gov", CT_API_URL, DocumentCategoryEnum.TRIAL);
    }

    async scrape() {
        this.log("Starting scrape via API...");
        try {
            // Fetch recent studies, possibly filtering for India location if supported by query
            // Using a simple query for 'India' to get relevant trials
            const response = await axios.get(this.baseUrl, {
                params: {
                    "query.locn": "India",
                    "pageSize": 5,
                    "sort": "LastUpdatePostDate:desc"
                }
            });

            const studies = response.data.studies || [];
            const results = [];

            for (const study of studies) {
                const protocolSection = study.protocolSection;
                const id = protocolSection?.identificationModule?.nctId;
                const title = protocolSection?.identificationModule?.officialTitle || protocolSection?.identificationModule?.briefTitle;
                const summary = protocolSection?.descriptionModule?.briefSummary || "No summary available";

                if (id && title) {
                    results.push({
                        title: `Clinical Trial: ${title}`,
                        content: `NCT ID: ${id}\nTitle: ${title}\nSummary: ${summary}\nSource: ClinicalTrials.gov`,
                        sourceUrl: `https://clinicaltrials.gov/study/${id}`,
                        metadata: {
                            category: this.category,
                            sourceType: DataSourceTypeEnum.API,
                            siteName: "ClinicalTrials.gov",
                            source: "ClinicalTrials.gov",
                            name: title,
                            trialId: id
                        }
                    });
                }
            }

            this.log(`Found ${results.length} trials via API.`);
            return results;
        } catch (error) {
            this.error("Failed to fetch from ClinicalTrials.gov API", error);
            // Fallback: return empty or try scraping if needed (omitted for now)
            return [];
        }
    }
}

export const scrapeClinicalTrials = async () => {
    const scraper = new ClinicalTrialsScraper();
    return scraper.scrape();
};
