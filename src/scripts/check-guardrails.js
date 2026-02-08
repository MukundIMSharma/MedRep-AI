import { redactPII } from '../utils/guardrails.js';

const testCases = [
    {
        name: "Email Redaction",
        input: "Send clinical report to mukund@gmail.com immediately.",
        expected: "Send clinical report to [REDACTED_EMAIL] immediately."
    },
    {
        name: "Indian Phone Redaction",
        input: "Call Dr. Sharma at +91 9876543210 regarding the dosage.",
        expected: "Call Dr. Sharma at [REDACTED_PHONE] regarding the dosage."
    },
    {
        name: "Aadhaar Redaction",
        input: "Patient ID: 1234 5678 1234. Verify their Ayushman Bharat status.",
        expected: "Patient ID: [REDACTED_AADHAAR]. Verify their Ayushman Bharat status."
    },
    {
        name: "Mixed PII",
        input: "User test_user@yahoo.co.in with phone 09876543210 is inquiring.",
        expected: "User [REDACTED_EMAIL] with phone [REDACTED_PHONE] is inquiring."
    }
];

console.log("=== PII GUARDRAIL VERIFICATION ===\n");

let passed = 0;
testCases.forEach((test, index) => {
    const result = redactPII(test.input);
    const isMatch = result === test.expected;

    console.log(`Test ${index + 1}: ${test.name}`);
    console.log(`Input:    ${test.input}`);
    console.log(`Output:   ${result}`);

    if (isMatch) {
        console.log("Result:   ✅ PASS\n");
        passed++;
    } else {
        console.log("Result:   ❌ FAIL");
        console.log(`Expected: ${test.expected}\n`);
    }
});

console.log(`Verification Complete: ${passed}/${testCases.length} tests passed.`);
