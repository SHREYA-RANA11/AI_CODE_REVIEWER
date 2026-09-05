import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function reviewCode(diff) {
  if (!diff || diff.trim().length === 0) {
    throw new Error("No Pull Request diff found.");
  }

  const systemPrompt = `
You are an expert software engineer.

Review the GitHub Pull Request diff.

Respond ONLY with valid JSON.

{
  "summary": "",
  "score": 0,
  "bugs": [],
  "security": [],
  "performance": [],
  "suggestions": []
}

Each bug/security/performance item must contain:

{
  "line": "",
  "message": "",
  "severity": "critical"
}

Severity must be one of:

critical
warning
minor

Do not include markdown.
Do not include explanations.
Do not wrap JSON in backticks.
`;

  try {
    console.log("================================");
    console.log("Starting AI Review");
    console.log(process.env.GROQ_MODEL);
    console.log("================================");

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Review this GitHub Pull Request diff:

${diff.slice(0, 12000)}
`,
        },
      ],

      temperature: 0.1,
    });

    const aiContent = response.choices[0].message.content;

    console.log("AI Response:");
    console.log(aiContent);

    let review;

    try {
      review = JSON.parse(aiContent);
    } catch {
      const match = aiContent.match(/\{[\s\S]*\}/);

      if (!match) {
        throw new Error("Model did not return valid JSON.");
      }

      review = JSON.parse(match[0]);
    }

    return {
      summary: review.summary || "Review completed.",

      score: typeof review.score === "number" ? review.score : 70,

      bugs: Array.isArray(review.bugs) ? review.bugs : [],

      security: Array.isArray(review.security) ? review.security : [],

      performance: Array.isArray(review.performance) ? review.performance : [],

      suggestions: Array.isArray(review.suggestions) ? review.suggestions : [],
    };
  } catch (err) {
    console.error(err);

    throw new Error(`Groq API Error: ${err.message}`);
  }
}
