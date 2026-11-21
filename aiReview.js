
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const reviewSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
    },
    score: {
      type: "number",
    },
    bugs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          line: { type: "string" },
          message: { type: "string" },
          severity: {
            type: "string",
            enum: ["critical", "warning", "minor"],
          },
        },
        required: ["line", "message", "severity"],
        additionalProperties: false,
      },
    },
    security: {
      type: "array",
      items: {
        type: "object",
        properties: {
          line: { type: "string" },
          message: { type: "string" },
          severity: {
            type: "string",
            enum: ["critical", "warning", "minor"],
          },
        },
        required: ["line", "message", "severity"],
        additionalProperties: false,
      },
    },
    performance: {
      type: "array",
      items: {
        type: "object",
        properties: {
          line: { type: "string" },
          message: { type: "string" },
          severity: {
            type: "string",
            enum: ["critical", "warning", "minor"],
          },
        },
        required: ["line", "message", "severity"],
        additionalProperties: false,
      },
    },
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "summary",
    "score",
    "bugs",
    "security",
    "performance",
    "suggestions",
  ],
  additionalProperties: false,
};

export async function reviewCode(diff) {
  if (!diff || !diff.trim()) {
    throw new Error("No Pull Request diff found.");
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

  const systemPrompt = `
You are an experienced senior software engineer.

Analyze the supplied GitHub Pull Request diff.

Identify genuine:
1. Bugs and logical errors.
2. Security vulnerabilities.
3. Performance problems.
4. Suggestions for improvement.

Important rules:
- Only report issues supported by the diff.
- Do not invent bugs.
- Use the filename and changed line number when possible.
- If no issue exists, return an empty array.
- Score must be between 0 and 100.
- Higher scores indicate better code quality.
- Return the complete review using the required JSON structure.
`;

  try {
    console.log("================================");
    console.log("Starting AI Code Review");
    console.log("Model:", model);
    console.log("Diff length:", diff.length);
    console.log("================================");

    const response = await groq.chat.completions.create({
      model,

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content:
            "Review the following GitHub Pull Request diff:\n\n" +
            diff.slice(0, 12000),
        },
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "code_review",
          strict: true,
          schema: reviewSchema,
        },
      },

      reasoning_effort: "low",
      max_completion_tokens: 4096,
    });

    const aiContent = response.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("Groq returned an empty AI response.");
    }

    const review = JSON.parse(aiContent);

    if (
      typeof review.score !== "number" ||
      review.score < 0 ||
      review.score > 100
    ) {
      throw new Error("Invalid review score received.");
    }

    console.log("AI Review completed successfully.");

    return {
      summary: review.summary,
      score: review.score,
      bugs: review.bugs,
      security: review.security,
      performance: review.performance,
      suggestions: review.suggestions,
    };

  } catch (error) {
    console.error("Groq Review Error:", error.message);

    throw new Error(
      `AI review failed: ${error.message}`
    );
  }
}
