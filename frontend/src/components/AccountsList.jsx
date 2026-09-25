import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  ShieldAlert, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function AccountsList({ 
  accounts, 
  balances, 
  loading, 
  onRefresh, 
  onRefreshSingleBalance, 
  onCreateAccount,
  onInitiateTransfer,
  onInitiateSystemFund
}) {
  const toast = useToast();
  const [copiedId, setCopiedId] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.info('Account ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSingleRefresh = async (id) => {
    setRefreshingId(id);
    try {
      await onRefreshSingleBalance(id);
    } finally {
      setTimeout(() => setRefreshingId(null), 400);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await onCreateAccount();
    } finally {
      setCreating(false);
    }
  };

  if (!loading && accounts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Wallet size={32} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>No Ledger Accounts Yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto' }}>
            Open your first active ledger account to start transacting, transferring funds, and maintaining double-entry balance records.
          </p>
        </div>
        <button
          id="empty-create-account-btn"
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleCreate}
          disabled={creating}
        >
          <Plus size={18} />
          <span>{creating ? 'Creating Account...' : 'Open Your First Account'}</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Action Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem' }}>Your Ledger Accounts</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            Manage double-entry balance sheets and transfer endpoints
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            id="refresh-all-accounts-btn"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh accounts and live balances"
          >
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            <span>Refresh All</span>
          </button>

          <button
            id="create-new-account-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleCreate}
            disabled={creating}
          >
            <Plus size={15} />
            <span>{creating ? 'Creating...' : 'Open New Account'}</span>
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="accounts-grid">
        {accounts.map((acc) => {
          const balance = balances[acc._id] ?? 0;
          const isRefreshing = refreshingId === acc._id;
          const isCopied = copiedId === acc._id;

          const createdDate = acc.createdAt
            ? new Date(acc.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Active';

          return (
            <div key={acc._id} className="account-card" id={`account-card-${acc._id}`}>
              {/* Card Header */}
              <div className="account-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="account-type-icon">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
                      Checking Ledger
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      <Calendar size={11} />
                      <span>{createdDate}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge badge-${acc.status?.toLowerCase() || 'active'}`}>
                    {acc.status || 'ACTIVE'}
                  </span>
                </div>
              </div>

              {/* Account ObjectId Box with 1-click Copy */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Account ID (MongoDB ObjectId)</span>
                  <span style={{ color: 'var(--emerald-400)', fontSize: '0.65rem' }}>
                    {isCopied ? 'Copied!' : 'Click to copy'}
                  </span>
                </div>
                <div 
                  className="account-id-box" 
                  onClick={() => handleCopy(acc._id)}
                  style={{ cursor: 'pointer' }}
                  title="Click to copy Account ID"
                >
                  <span className="account-id-text">{acc._id}</span>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(acc._id);
                    }}
                    aria-label="Copy account id"
                  >
                    {isCopied ? <Check size={14} style={{ color: 'var(--emerald-400)' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Calculated Balance Section */}
              <div className="account-balance-section">
                <div>
                  <div className="balance-label">Current Ledger Balance</div>
                  <div className="balance-amount">
                    <span style={{ fontSize: '1.25rem', color: 'var(--emerald-400)', marginRight: '0.2rem' }}>
                      ₹
                    </span>
                    {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleSingleRefresh(acc._id)}
                  disabled={isRefreshing}
                  title="Fetch latest balance from backend ledger aggregation"
                >
                  <RefreshCw size={13} className={isRefreshing ? 'spinner' : ''} />
                  <span>Update</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="account-card-actions">
                <button
                  id={`transfer-from-${acc._id}`}
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => onInitiateTransfer(acc._id)}
                  title="Send money from this account"
                >
                  <Send size={13} />
                  <span>Transfer</span>
                </button>

                <button
                  id={`fund-account-${acc._id}`}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onInitiateSystemFund(acc._id)}
                  title="Initial Funds deposit tool"
                >
                  <Download size={13} />
                  <span>Fund</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
