import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function reviewCode(diff) {

  if (!diff || diff.trim().length === 0) {
    throw new Error("No Pull Request diff found.");
  }

  const systemPrompt = `
You are a senior software engineer.

Review the following GitHub Pull Request.

Return ONLY valid JSON.

No markdown.
No explanation.
No backticks.

Use exactly this schema:

{
  "summary":"string",
  "score":80,
  "bugs":[
    {
      "line":"filename.js:10",
      "message":"Bug description",
      "severity":"critical"
    }
  ],
  "security":[
    {
      "line":"filename.js:20",
      "message":"Security issue",
      "severity":"warning"
    }
  ],
  "performance":[
    {
      "line":"filename.js:30",
      "message":"Performance issue",
      "severity":"minor"
    }
  ],
  "suggestions":[
    {
      "message":"Suggestion"
    }
  ]
}

Rules:

Score must be between 0 and 100.

Severity must be:
critical
warning
minor

If there are no issues in a category return [].

Return ONLY JSON.
`;

  try {

    console.log("================================");
    console.log("Starting AI Review");
    console.log(process.env.GROQ_MODEL);
    console.log("================================");

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
          content: diff.slice(0, 12000),
        },
      ],

      temperature: 0.1,

    });

    const aiContent =
      response.choices[0].message.content;

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

      summary:
        review.summary ||
        "Review completed.",

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
          : [],

    };

  } catch (err) {

    console.error(err);

    throw new Error(
      `Groq API Error: ${err.message}`
    );

  }

}