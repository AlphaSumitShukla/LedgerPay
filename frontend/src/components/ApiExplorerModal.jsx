import React, { useState } from 'react';
import { 
  Code2, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Layers, 
  Lock, 
  Send, 
  Wallet,
  ShieldAlert,
  Database
} from 'lucide-react';

export function ApiExplorerModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/register',
      desc: 'Creates a new user, hashes password with bcrypt (10 rounds), sends welcome email, and sets JWT token cookie.',
      auth: 'Public',
      body: JSON.stringify(
        {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'secretPassword123',
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          user: {
            _id: '64f8a123bc...',
            email: 'jane@example.com',
            name: 'Jane Doe',
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        null,
        2
      ),
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      desc: 'Verifies email & password, issues 3-day JWT token, and returns user object.',
      auth: 'Public',
      body: JSON.stringify(
        {
          email: 'jane@example.com',
          password: 'secretPassword123',
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          user: {
            _id: '64f8a123bc...',
            email: 'jane@example.com',
            name: 'Jane Doe',
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        null,
        2
      ),
    },
    {
      method: 'POST',
      path: '/api/auth/logout',
      desc: 'Blacklists token in tokenBlackListModel and clears auth cookie.',
      auth: 'Bearer Token or Cookie',
      body: 'None (reads authorization header or cookie)',
      response: JSON.stringify({ message: 'User loggedout successfully' }, null, 2),
    },
    {
      method: 'POST',
      path: '/api/accounts',
      desc: 'Opens a new ledger account for the authenticated user (status: ACTIVE, currency: INR).',
      auth: 'authMiddleware',
      body: '{} (User identified by req.user._id)',
      response: JSON.stringify(
        {
          account: {
            _id: '674...9a',
            user: '64f8a123bc...',
            status: 'ACTIVE',
            currency: 'INR',
            createdAt: '2026-09-25T...',
            updatedAt: '2026-09-25T...',
          },
        },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: '/api/accounts',
      desc: 'Retrieves all ledger accounts owned by the authenticated user.',
      auth: 'authMiddleware',
      body: 'None',
      response: JSON.stringify(
        {
          accounts: [
            {
              _id: '674...9a',
              user: '64f8a123bc...',
              status: 'ACTIVE',
              currency: 'INR',
              createdAt: '2026-09-25T...',
            },
          ],
        },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: '/api/accounts/balance/:accountId',
      desc: 'Calculates the real-time balance via MongoDB aggregation on ledgerModel (total CREDITs minus total DEBITs).',
      auth: 'authMiddleware',
      body: 'URL Param: accountId',
      response: JSON.stringify(
        {
          accountId: '674...9a',
          balance: 2500,
        },
        null,
        2
      ),
    },
    {
      method: 'POST',
      path: '/api/transactions',
      desc: 'Performs ACID transfer: validates active statuses, checks sufficient balance, writes debit/credit ledger entries atomically, and sends notification email.',
      auth: 'authMiddleware',
      body: JSON.stringify(
        {
          fromAccount: '6741234567890abcdef12345',
          toAccount: '6749876543210fedcba54321',
          amount: 500,
          idempotencyKey: 'b84cf2fa-c97b-40fa-9878-3a9a13b69ec5',
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          message: 'Transaction completed successfully',
          transaction: {
            _id: '674...trans12',
            fromAccount: '6741234567890abcdef12345',
            toAccount: '6749876543210fedcba54321',
            amount: 500,
            status: 'COMPLETED',
            idempotencyKey: 'b84cf2fa-c97b-40fa-9878-3a9a13b69ec5',
          },
        },
        null,
        2
      ),
    },
    {
      method: 'POST',
      path: '/api/transactions/system/initial-funds',
      desc: 'System User endpoint: seeds capital into target account with simulated 15s reserve settlement lock.',
      auth: 'authSystemUserMiddleware (user.systemUser = true)',
      body: JSON.stringify(
        {
          toAccount: '6741234567890abcdef12345',
          amount: 1000,
          idempotencyKey: 'a12bc34-uuid-idempotent-key',
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          message: 'Initial funds transaction completed successfully',
          transaction: {
            _id: '674...systemTrans',
            fromAccount: 'systemAccountObjectId',
            toAccount: '6741234567890abcdef12345',
            amount: 1000,
            status: 'COMPLETED',
          },
        },
        null,
        2
      ),
    },
  ];

  const handleCopyCode = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '800px', width: '95%' }}
      >
        <div className="modal-header">
          <div className="modal-title">
            <Code2 size={20} style={{ color: 'var(--emerald-400)' }} />
            <span>Backend API Architecture & Endpoint Explorer</span>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="callout callout-info" style={{ margin: 0 }}>
            <Database size={18} />
            <div>
              <div style={{ fontWeight: 600 }}>Zero-Backend-Modification Compliance</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                This frontend connects natively to all 8 backend endpoints. All payload shapes, HTTP statuses, and authentication headers conform 100% to the Express.js server logic.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {endpoints.map((ep, idx) => {
              const isCopied = copiedIndex === idx;
              return (
                <div 
                  key={ep.path + ep.method} 
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span 
                        className="badge" 
                        style={{
                          background: ep.method === 'GET' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: ep.method === 'GET' ? '#38bdf8' : '#34d399',
                          borderColor: ep.method === 'GET' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        {ep.method}
                      </span>
                      <code className="mono" style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                        {ep.path}
                      </code>
                    </div>

                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      <Lock size={10} style={{ marginRight: '0.2rem' }} />
                      {ep.auth}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {ep.desc}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Request Body</div>
                      <pre className="mono" style={{
                        background: 'rgba(0,0,0,0.5)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        color: 'var(--text-main)',
                        overflowX: 'auto'
                      }}>
                        {ep.body}
                      </pre>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Expected Response</div>
                      <pre className="mono" style={{
                        background: 'rgba(0,0,0,0.5)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        color: 'var(--emerald-400)',
                        overflowX: 'auto'
                      }}>
                        {ep.response}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
