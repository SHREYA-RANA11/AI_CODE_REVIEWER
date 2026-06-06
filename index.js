// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

// Now import your modules (after dotenv.config)
import { parsePRUrl, fetchPRDiff } from './github.js';
import { reviewCode } from './aiReview.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running with Groq AI!' });
});

// OLD endpoint - just fetches diff
app.post('/api/fetch-diff', async (req, res) => {
  const { prUrl } = req.body;
  
  if (!prUrl) {
    return res.status(400).json({ error: 'PR URL required' });
  }
  
  try {
    const { owner, repo, pullNumber } = parsePRUrl(prUrl);
    const diff = await fetchPRDiff(owner, repo, pullNumber, process.env.GITHUB_TOKEN);
    
    res.json({
      success: true,
      prInfo: { owner, repo, pullNumber },
      diffLength: diff.length,
      diffPreview: diff.substring(0, 500) + (diff.length > 500 ? '...' : '')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW endpoint - fetches diff AND reviews it with Groq AI
app.post('/api/review-pr', async (req, res) => {
  const { prUrl } = req.body;
  
  if (!prUrl) {
    return res.status(400).json({ error: 'PR URL required' });
  }
  
  try {
    console.log(`\n📥 Fetching PR: ${prUrl}`);
    
    const { owner, repo, pullNumber } = parsePRUrl(prUrl);
    const diff = await fetchPRDiff(owner, repo, pullNumber, process.env.GITHUB_TOKEN);
    
    console.log(`📄 Diff size: ${diff.length} characters`);
    console.log('🤖 Sending to Groq for review...');
    
    const review = await reviewCode(diff);
    
    res.json({
      success: true,
      prInfo: { owner, repo, pullNumber },
      review: review
    });
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`\n📡 Available endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/fetch-diff`);
  console.log(`   POST /api/review-pr ✨`);
});