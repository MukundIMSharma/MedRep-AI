/**
 * Simple Sparse Embedder Service
 * Generates sparse vectors (indices and values) for keyword matching.
 */

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'from',
    'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'to', 'in', 'on', 'of', 'for', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'shall', 'should', 'would', 'can', 'could', 'may', 'might', 'must',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their'
]);

/**
 * Basic tokenizer for sparse embeddings
 * @param {string} text 
 * @returns {Array<string>}
 */
function tokenize(text) {
    if (!text) return [];
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ') // alphanumeric + dash + whitespace
        .split(/\s+/)
        .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Simple hashing function for token indices
 * @param {string} str 
 * @returns {number}
 */
function hashToken(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Generates a sparse vector from text
 * @param {string} text 
 * @returns {Object} { indices: Array<number>, values: Array<number> }
 */
export function embedSparse(text) {
    const tokens = tokenize(text);
    const counts = {};

    tokens.forEach(token => {
        const index = hashToken(token);
        counts[index] = (counts[index] || 0) + 1;
    });

    const indices = Object.keys(counts).map(Number).sort((a, b) => a - b);

    // Normalize values (simple frequency normalization)
    const maxFreq = Math.max(...Object.values(counts)) || 1;
    const values = indices.map(idx => counts[idx] / maxFreq);

    return { indices, values };
}
