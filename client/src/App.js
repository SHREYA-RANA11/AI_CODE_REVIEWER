// client/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Reads REACT_APP_API_URL from client/.env, falls back to the deployed Render backend
const API_URL = process.env.REACT_APP_API_URL || 'https://ai-code-reviewer-iqxz.onrender.com';

// Replace these with PRs you have opened in your browser and confirmed are real pull requests
const EXAMPLES = [
  { label: 'next.js/pull/70001', url: 'https://github.com/vercel/next.js/pull/70001' },
  { label: 'react/pull/1234', url: 'https://github.com/facebook/react/pull/1234' },
];

const PR_URL_REGEX = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/;

const TABS = [
  { key: 'bugs', label: 'Bugs', empty: 'No bugs found — quality code' },
  { key: 'security', label: 'Security', empty: 'No security issues found' },
  { key: 'performance', label: 'Performance', empty: 'No performance issues found' },
  { key: 'suggestions', label: 'Suggestions', empty: 'No suggestions for improvement' },
];

const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
};

const SEVERITY_LABELS = { critical: 'CRITICAL', warning: 'WARNING', minor: 'MINOR' };

function IssueList({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <div className="no-issues">{emptyText}</div>;
  }
  return (
    <div className="issues-list">
      {items.map((item, idx) =>
        item.severity ? (
          <div key={idx} className={`issue-card ${item.severity}`}>
            <div className="issue-header">
              <span className={`severity-badge ${item.severity}`}>
                {SEVERITY_LABELS[item.severity] || 'INFO'}
              </span>
              <span className="issue-location">{item.line}</span>
            </div>
            <p className="issue-message">{item.message}</p>
          </div>
        ) : (
          <div key={idx} className="suggestion-card">
            <p className="suggestion-message">{item.message}</p>
          </div>
        )
      )}
    </div>
  );
}

function App() {
  const [prUrl, setPrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bugs');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const url = prUrl.trim();

    if (!url) {
      setError('Please enter a PR URL');
      return;
    }
    if (!PR_URL_REGEX.test(url)) {
      setError('That does not look like a GitHub PR link. Example: https://github.com/owner/repo/pull/123');
      return;
    }

    setLoading(true);
    setError(null);
    setReview(null);

    try {
      const response = await axios.post(`${API_URL}/api/review-pr`, { prUrl: url });

      if (response.data.success) {
        setReview(response.data.review);
        setActiveTab('bugs');
      } else {
        setError(response.data.error || 'Something went wrong');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Could not reach the server at ${API_URL}. Make sure the backend is running.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI Code Reviewer</h1>
        <p>Instant intelligence for your pull requests</p>
      </header>

      <div className="container">
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            placeholder="https://github.com/facebook/react/pull/1234"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            className="url-input"
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="review-btn">
            {loading ? 'Reviewing...' : 'Review PR'}
          </button>
        </form>

        <div className="example-prs" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.75rem' }}>
            Try these examples (click to fill):
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.url}
                type="button"
                disabled={loading}
                onClick={() => setPrUrl(ex.url)}
                style={{
                  background: 'rgba(96, 165, 250, 0.15)',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '2rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: '#60a5fa',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching PR and analyzing code with AI...</p>
            <small>This can take 5-20 seconds</small>
          </div>
        )}

        {review && (
          <div className="review-container">
            {review.truncated && (
              <div className="error-message" style={{ marginBottom: '1rem' }}>
                This PR is large, so only the first part of the diff was reviewed.
              </div>
            )}

            <div className="score-section">
              <div className="score-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={getScoreColor(review.score)}
                    strokeWidth="8"
                    strokeDasharray={`${review.score * 2.83} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="score-text">
                  <span className="score-number">{review.score}</span>
                  <span className="score-label">/100</span>
                </div>
              </div>
              <div className="summary">
                <h3>Summary</h3>
                <p>{review.summary}</p>
              </div>
            </div>

            <div className="stats">
              {TABS.map((t) => (
                <div className="stat" key={t.key}>
                  <span className="stat-number">{review[t.key]?.length || 0}</span>
                  <span className="stat-label">{t.label}</span>
                </div>
              ))}
            </div>

            <div className="tabs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`tab ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label} ({review[t.key]?.length || 0})
                </button>
              ))}
            </div>

            <div className="tab-content">
              <IssueList
                items={review[activeTab]}
                emptyText={TABS.find((t) => t.key === activeTab).empty}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;