
export function parsePRUrl(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== "github.com") {
      throw new Error("Please enter a valid GitHub URL.");
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (
      parts.length < 4 ||
      parts[2] !== "pull" ||
      !/^\d+$/.test(parts[3])
    ) {
      throw new Error("Invalid Pull Request URL.");
    }

    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/, ""),
      pullNumber: Number(parts[3]),
    };
  } catch (error) {
    throw new Error(error.message || "Invalid GitHub URL.");
  }
}

export async function fetchPRDiff(
  owner,
  repo,
  pullNumber,
  githubToken
) {
  const url =
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;

  const headers = {
    Accept: "application/vnd.github.v3.diff",
    "User-Agent": "AI-Code-Reviewer",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const details = await response.text();

    console.error("GitHub API Error:", response.status, details);

    if (response.status === 404) {
      throw new Error(
        "Pull Request not found. Check the repository, PR number, and repository access permissions."
      );
    }

    if (response.status === 401) {
      throw new Error(
        "GitHub token is invalid or expired."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "GitHub API access denied. Check token permissions and API rate limits."
      );
    }

    throw new Error(`GitHub API error: ${response.status}`);
  }

  const diff = await response.text();

  if (!diff.trim()) {
    throw new Error("The Pull Request contains no reviewable diff.");
  }

  return diff;
}
