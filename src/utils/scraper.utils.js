import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// User Agent rotation to avoid blocking
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

/**
 * Fetch HTML content from a URL with retry logic
 * @param {string} url - The URL to fetch
 * @param {Object} options - Axios config options
 * @param {number} retries - Number of retries
 * @returns {Promise<string>} HTML content
 */
export async function fetchHtml(url, options = {}, retries = 3) {
    try {
        const config = {
            headers: {
                "User-Agent": getRandomUserAgent(),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Cache-Control": "max-age=0",
                ...options.headers
            },
            httpsAgent: httpsAgent,
            timeout: 30000, // Increased timeout
            maxRedirects: 5,
            ...options
        };

        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        if (retries > 0) {
            // Log specific error codes for better debugging
            const status = error.response ? error.response.status : error.code;
            console.warn(`Error fetching ${url} (${status}: ${error.message}), retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 3000 * (4 - retries))); // Exponential backoff
            return fetchHtml(url, options, retries - 1);
        }
        console.error(`Failed to fetch HTML from ${url} after retries:`, error.message);
        throw error;
    }
}

/**
 * Clean text content (remove extra whitespace, newlines)
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
export function cleanText(text) {
    if (!text) return "";
    return text.toString().replace(/\s+/g, " ").trim();
}

/**
 * Extract links from a cheerio object based on a selector
 * @param {Object} $ - Cheerio instance
 * @param {string} selector - CSS selector for links
 * @param {string} baseUrl - Base URL to resolve relative links
 * @returns {Array<{text: string, url: string}>}
 */
export function extractLinks($, selector, baseUrl) {
    const links = [];
    $(selector).each((_, el) => {
        const text = cleanText($(el).text());
        let url = $(el).attr("href");
        if (url) {
            try {
                // Handle relative URLs
                url = new URL(url, baseUrl).href;
                links.push({ text, url });
            } catch (e) {
                // Invalid URL, skip
            }
        }
    });
    return links;
}

/**
 * Download a file from a URL to a local path
 * @param {string} url - URL to download
 * @param {string} outputPath - Local file path
 * @returns {Promise<string>} Path to downloaded file
 */
export async function downloadFile(url, outputPath) {
    const writer = fs.createWriteStream(outputPath);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers: { "User-Agent": getRandomUserAgent() }
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(outputPath));
        writer.on('error', reject);
    });
}


/**
 * Base class for all scrapers to enforce structure
 */
export class BaseScraper {
    constructor(name, baseUrl, category) {
        this.name = name;
        this.baseUrl = baseUrl;
        this.category = category;
    }

    async fetch(url = this.baseUrl) {
        return fetchHtml(url);
    }

    async scrape() {
        throw new Error("scrape() method must be implemented");
    }

    log(message) {
        console.log(`[${this.name}] ${message}`);
    }

    error(message, err) {
        console.error(`[${this.name}] Error: ${message}`, err ? err.message : "");
    }
}
