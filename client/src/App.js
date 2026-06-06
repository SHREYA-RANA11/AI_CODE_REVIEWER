// client/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [prUrl, setPrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bugs');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prUrl) {
      setError('Please enter a PR URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    setReview(null);
    
    try {
      const response = await axios.post('http://localhost:3001/api/review-pr', {
        prUrl: prUrl
      });
      
      if (response.data.success) {
        setReview(response.data.review);
      } else {
        setError(response.data.error || 'Something went wrong');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to server. Make sure backend is running on port 3001');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'CRITICAL',
      warning: 'WARNING',
      minor: 'MINOR'
    };
    return badges[severity] || 'INFO';
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
          />
          <button type="submit" disabled={loading} className="review-btn">
            {loading ? 'Reviewing...' : 'Review PR'}
          </button>
        </form>

        {/* Example PRs - Click to paste */}
     {/* Example PRs - Click to paste */}
<div className="example-prs" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
  <p style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.75rem' }}>
    Try these working examples (click to test):
  </p>
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    gap: '1rem', 
    flexWrap: 'wrap',
    alignItems: 'center'
  }}>
    <button
      onClick={() => setPrUrl('https://github.com/facebook/react/pull/1234')}
      style={{
        background: 'rgba(96, 165, 250, 0.15)',
        border: '1px solid rgba(96, 165, 250, 0.4)',
        padding: '0.6rem 1.2rem',
        borderRadius: '2rem',
        cursor: 'pointer',
        color: '#60a5fa',
        fontSize: '0.8rem',
        fontWeight: '500',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(96, 165, 250, 0.25)';
        e.target.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'rgba(96, 165, 250, 0.15)';
        e.target.style.transform = 'translateY(0)';
      }}
    >
      react/pull/1234
    </button>
    <button
      onClick={() => setPrUrl('https://github.com/vercel/next.js/pull/70001')}
      style={{
        background: 'rgba(96, 165, 250, 0.15)',
        border: '1px solid rgba(96, 165, 250, 0.4)',
        padding: '0.6rem 1.2rem',
        borderRadius: '2rem',
        cursor: 'pointer',
        color: '#60a5fa',
        fontSize: '0.8rem',
        fontWeight: '500',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(96, 165, 250, 0.25)';
        e.target.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'rgba(96, 165, 250, 0.15)';
        e.target.style.transform = 'translateY(0)';
      }}
    >
      next.js/pull/70001
    </button>
    <button
      onClick={() => setPrUrl('https://github.com/facebook/react/pull/12514')}
      style={{
        background: 'rgba(96, 165, 250, 0.15)',
        border: '1px solid rgba(96, 165, 250, 0.4)',
        padding: '0.6rem 1.2rem',
        borderRadius: '2rem',
        cursor: 'pointer',
        color: '#60a5fa',
        fontSize: '0.8rem',
        fontWeight: '500',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(96, 165, 250, 0.25)';
        e.target.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'rgba(96, 165, 250, 0.15)';
        e.target.style.transform = 'translateY(0)';
      }}
    >
      react/pull/12514
    </button>
  </div>
</div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching PR and analyzing code with AI...</p>
            <small>This takes about 5-10 seconds</small>
          </div>
        )}

        {review && (
          <div className="review-container">
            <div className="score-section">
  <div className="score-circle">
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
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
              <div className="stat">
                <span className="stat-number">{review.bugs?.length || 0}</span>
                <span className="stat-label">Bugs</span>
              </div>
              <div className="stat">
                <span className="stat-number">{review.security?.length || 0}</span>
                <span className="stat-label">Security</span>
              </div>
              <div className="stat">
                <span className="stat-number">{review.performance?.length || 0}</span>
                <span className="stat-label">Performance</span>
              </div>
              <div className="stat">
                <span className="stat-number">{review.suggestions?.length || 0}</span>
                <span className="stat-label">Suggestions</span>
              </div>
            </div>

            <div className="tabs">
              <button className={`tab ${activeTab === 'bugs' ? 'active' : ''}`} onClick={() => setActiveTab('bugs')}>
                Bugs ({review.bugs?.length || 0})
              </button>
              <button className={`tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                Security ({review.security?.length || 0})
              </button>
              <button className={`tab ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>
                Performance ({review.performance?.length || 0})
              </button>
              <button className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`} onClick={() => setActiveTab('suggestions')}>
                Suggestions ({review.suggestions?.length || 0})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'bugs' && (
                <div className="issues-list">
                  {review.bugs?.length === 0 ? (
                    <div className="no-issues">No bugs found — quality code</div>
                  ) : (
                    review.bugs?.map((bug, idx) => (
                      <div key={idx} className={`issue-card ${bug.severity}`}>
                        <div className="issue-header">
                          <span className={`severity-badge ${bug.severity}`}>{getSeverityBadge(bug.severity)}</span>
                          <span className="issue-location">{bug.line}</span>
                        </div>
                        <p className="issue-message">{bug.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="issues-list">
                  {review.security?.length === 0 ? (
                    <div className="no-issues">No security issues found</div>
                  ) : (
                    review.security?.map((issue, idx) => (
                      <div key={idx} className={`issue-card ${issue.severity}`}>
                        <div className="issue-header">
                          <span className={`severity-badge ${issue.severity}`}>{getSeverityBadge(issue.severity)}</span>
                          <span className="issue-location">{issue.line}</span>
                        </div>
                        <p className="issue-message">{issue.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="issues-list">
                  {review.performance?.length === 0 ? (
                    <div className="no-issues">No performance issues found</div>
                  ) : (
                    review.performance?.map((issue, idx) => (
                      <div key={idx} className={`issue-card ${issue.severity}`}>
                        <div className="issue-header">
                          <span className={`severity-badge ${issue.severity}`}>{getSeverityBadge(issue.severity)}</span>
                          <span className="issue-location">{issue.line}</span>
                        </div>
                        <p className="issue-message">{issue.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div className="suggestions-list">
                  {review.suggestions?.length === 0 ? (
                    <div className="no-issues">No suggestions for improvement</div>
                  ) : (
                    review.suggestions?.map((suggestion, idx) => (
                      <div key={idx} className="suggestion-card">
                        <p className="suggestion-message">{suggestion.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;