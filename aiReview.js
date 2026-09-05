// aiReview.js

import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function reviewCode(diff) {

    // Validate input
    if (!diff || diff.trim().length === 0) {
        throw new Error("No Pull Request diff found.");
    }

    // System Prompt
    const systemPrompt = `
You are a Senior Software Engineer and Code Reviewer.

Analyze the GitHub Pull Request diff carefully.

Return ONLY valid JSON.

Do NOT return markdown.
Do NOT use triple backticks.
Do NOT explain anything outside JSON.

Return EXACTLY this structure:

{
  "summary": "Brief summary of changes and overall review",
  "score": 75,
  "bugs": [
    {
      "line": "filename.js:42",
      "message": "Bug description",
      "severity": "critical"
    }
  ],
  "security": [
    {
      "line": "filename.js:15",
      "message": "Security issue",
      "severity": "warning"
    }
  ],
  "performance": [
    {
      "line": "filename.js:23",
      "message": "Performance issue",
      "severity": "minor"
    }
  ],
  "suggestions": [
    {
      "message": "Suggestion for improvement"
    }
  ]
}

Rules:

- Score must be between 0 and 100.
- Severity must be:
  - critical
  - warning
  - minor
- If no issues exist, return empty arrays.
- JSON only.
`;

    try {

        console.log("=================================");
        console.log("🤖 Starting AI Code Review");
        console.log(`📄 Diff Size : ${diff.length} characters`);
        console.log(`🧠 Model     : ${process.env.GROQ_MODEL}`);
        console.log("=================================");

        const response = await groq.chat.completions.create({

            model:
                process.env.GROQ_MODEL ||
                "openai/gpt-oss-20b",

            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: `Review this GitHub Pull Request Diff:

${diff.slice(0, 12000)}`
                }
            ],

            temperature: 0.1,

            response_format: {
                type: "json_object"
            }

        });

        const aiContent = response.choices[0].message.content;

        console.log("✅ AI Review Received");

        const review = JSON.parse(aiContent);

        return {

            summary:
                review.summary ||
                "AI review completed successfully.",

            score:
                typeof review.score === "number"
                    ? review.score
                    : 70,

            bugs:
                Array.isArray(review.bugs)
                    ? review.bugs
                    : [],

            security:
                Array.isArray(review.security)
                    ? review.security
                    : [],

            performance:
                Array.isArray(review.performance)
                    ? review.performance
                    : [],

            suggestions:
                Array.isArray(review.suggestions)
                    ? review.suggestions
                    : []

        };

    } catch (error) {

        console.error("=================================");
        console.error("❌ AI Review Failed");
        console.error(error.message);
        console.error("=================================");

        throw new Error(
            `Groq API Error: ${error.message}`
        );

    }

}