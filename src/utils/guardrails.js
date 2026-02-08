/**
 * PII Guardrails Utility
 * Provides regex-based redaction for sensitive user information.
 */

const PII_PATTERNS = {
    // Email regex (standard)
    EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

    // Phone numbers (Handles Indian variations: +91, 0, or just 10 digits)
    PHONE: /(?:\+91|0)?[6-9]\d{9}|(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,

    // Aadhaar number (Indian unique ID: 12 digits, often with spaces)
    AADHAAR: /\b\d{4}\s\d{4}\s\d{4}\b|\b\d{12}\b/g,

    // Basic Credit Card (Generic 13-16 digits)
    CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/g,
};

/**
 * Redacts Personally Identifiable Information from a string.
 * @param {string} text - The input text to sanitize.
 * @returns {string} - The sanitized text with PII redacted.
 */
export function redactPII(text) {
    if (!text) return text;

    let sanitized = text;
    let detections = [];

    // Check for each pattern and redact
    for (const [key, pattern] of Object.entries(PII_PATTERNS)) {
        if (pattern.test(sanitized)) {
            detections.push(key);
            // Reset regex state since we used test() with 'g' flag
            pattern.lastIndex = 0;
            sanitized = sanitized.replace(pattern, `[REDACTED_${key}]`);
        }
    }

    if (detections.length > 0) {
        console.log(`[GUARDRAIL] PII Detected and Redacted: ${detections.join(', ')}`);
    }

    return sanitized;
}

/**
 * Checks if a string contains any PII without redacting.
 * @param {string} text 
 * @returns {boolean}
 */
export function hasPII(text) {
    if (!text) return false;
    return Object.values(PII_PATTERNS).some(pattern => {
        const result = pattern.test(text);
        pattern.lastIndex = 0; // Reset
        return result;
    });
}
