export function parsePRUrl(url) {
  const pattern = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
  const match = url.match(pattern);
  
  if (!match) {
    throw new Error('Invalid GitHub PR URL');
  }
  
  return {
    owner: match[1],
    repo: match[2],
    pullNumber: parseInt(match[3])
  };
}

export async function fetchPRDiff(owner, repo, pullNumber, githubToken) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3.diff',
      'Authorization': `token ${githubToken}`,
      'User-Agent': 'AI-Code-Reviewer'
    }
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  return await response.text();
}