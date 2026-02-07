import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Fetch HTML content from a URL
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} HTML content
 */
export async function fetchHtml(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching HTML from ${url}:`, error.message);
        throw error;
    }
}

/**
 * Clean text content (remove extra whitespace, newlines)
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
export function cleanText(text) {
    return text.replace(/\s+/g, " ").trim();
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
            if (url.startsWith("/")) {
                url = new URL(url, baseUrl).href;
            }
            links.push({ text, url });
        }
    });
    return links;
}
