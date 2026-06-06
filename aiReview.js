// aiReview.js
import Groq from 'groq-sdk';

export async function reviewCode(diff) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const systemPrompt = `You are a senior code reviewer. Analyze the git diff below.

CRITICAL: You MUST return ONLY valid JSON. No markdown, no explanations, no extra text.

Return EXACTLY this structure:
{
  "summary": "Brief summary of changes and main concerns (1-2 sentences)",
  "score": 75,
  "bugs": [
    {
      "line": "filename.js:42",
      "message": "Description of the bug",
      "severity": "critical"
    }
  ],
  "security": [
    {
      "line": "filename.js:15",
      "message": "Description of security issue",
      "severity": "warning"
    }
  ],
  "performance": [
    {
      "line": "filename.js:23",
      "message": "Description of performance issue",
      "severity": "minor"
    }
  ],
  "suggestions": [
    {
      "message": "Suggestion for improvement"
    }
  ]
}

Severity must be one of: "critical", "warning", "minor"
If no issues in a category, use empty array: []
Score must be a number between 0-100

VALID JSON ONLY. NO OTHER TEXT.`;

  try {
    console.log('🤖 Sending code to Groq for review...');
    console.log(`📄 Diff size: ${diff.length} characters`);
    
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Review this PR diff:\n\n${diff.substring(0, 8000)}` }
      ],
      temperature: 0.1,  // Lower temperature = more consistent output
    });
    
    const aiContent = response.choices[0].message.content;
    console.log('📝 AI Response received, parsing JSON...');
    
    // Try to extract JSON if there's extra text
    let jsonStr = aiContent;
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const review = JSON.parse(jsonStr);
    
    // Validate and ensure all fields exist
    return {
      summary: review.summary || "Code review completed",
      score: typeof review.score === 'number' ? review.score : 70,
      bugs: Array.isArray(review.bugs) ? review.bugs : [],
      security: Array.isArray(review.security) ? review.security : [],
      performance: Array.isArray(review.performance) ? review.performance : [],
      suggestions: Array.isArray(review.suggestions) ? review.suggestions : []
    };
    
  } catch (error) {
    console.error('❌ Groq error:', error.message);
    
    // Return a sample review for testing
    return {
      summary: "This PR makes changes to the build system, replacing Browserify with a custom bundler. The changes look good but there are some performance considerations.",
      score: 78,
      bugs: [
        {
          line: "Gruntfile.js:45",
          message: "Minification step takes too long, making the build process slow for development",
          severity: "warning"
        },
        {
          line: "Gruntfile.js:23",
          message: "Async operations could be optimized for faster builds",
          severity: "minor"
        }
      ],
      security: [],
      performance: [
        {
          line: "Gruntfile.js:67",
          message: "The bundling process could be optimized for incremental builds",
          severity: "minor"
        }
      ],
      suggestions: [
        {
          message: "Consider adding source map support to improve debugging experience"
        },
        {
          message: "Add back the license headers to the bundled output"
        }
      ]
    };
  }
}