import React, { useState } from 'react';
import { 
  History, 
  ArrowUpRight, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Trash2, 
  Send, 
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function TransferHistory({ 
  history, 
  onClearHistory, 
  onSendAgain 
}) {
  const toast = useToast();
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'TRANSFER' | 'SYSTEM'

  const handleCopy = (text, label = 'Account ID') => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.info(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filter history
  const filteredHistory = history.filter((item) => {
    // Type filter
    if (filterType === 'TRANSFER' && item.type === 'INITIAL_FUNDS') return false;
    if (filterType === 'SYSTEM' && item.type !== 'INITIAL_FUNDS') return false;

    // Search term filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const dest = (item.toAccount || '').toLowerCase();
    const src = (item.fromAccount || '').toLowerCase();
    const txId = (item._id || item.transactionId || '').toLowerCase();
    const amt = item.amount ? item.amount.toString() : '';

    return dest.includes(term) || src.includes(term) || txId.includes(term) || amt.includes(term);
  });

  // Calculate summary metrics
  const totalTransferredOut = history
    .filter(item => item.type !== 'INITIAL_FUNDS')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const transferCount = history.filter(item => item.type !== 'INITIAL_FUNDS').length;

  return (
    <div className="history-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald-400)'
            }}>
              <History size={18} />
            </div>
            <h2 style={{ fontSize: '1.35rem' }}>Transfer History & Ledger Records</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
            Log of transfers sent to destination accounts with full double-entry ledger proof
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {history.length > 0 && (
            <button
              id="clear-history-btn"
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--rose-400)' }}
              onClick={onClearHistory}
              title="Clear transfer logs from this browser"
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Banner */}
      {history.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald-400)'
            }}>
              <ArrowUpRight size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Transferred Out
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                ₹{totalTransferredOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--indigo-400)'
            }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Transfers Executed
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                {transferCount} {transferCount === 1 ? 'Transfer' : 'Transfers'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {history.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.3)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
            <Search size={15} style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)'
            }} />
            <input
              id="history-search-input"
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem', fontSize: '0.85rem', height: '38px' }}
              placeholder="Search destination account, ID, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('ALL')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'TRANSFER' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('TRANSFER')}
            >
              Transfers Sent
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'SYSTEM' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('SYSTEM')}
            >
              Initial Deposits
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
          <div className="empty-state-icon">
            <History size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>No Transfer History Recorded</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '440px' }}>
              Whenever you transfer money to a destination account or receive initial funds, the real transaction record returned by the backend will be logged here.
            </p>
          </div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem 1.5rem' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            No records match your search filter "{searchTerm}".
          </div>
        </div>
      ) : (
        /* History Items List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredHistory.map((item, idx) => {
            const isInitialFunds = item.type === 'INITIAL_FUNDS';
            const txId = item._id || item.transactionId || `tx-${idx}`;
            const isCopiedDest = copiedId === item.toAccount;
            const isCopiedTx = copiedId === txId;

            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently completed';

            return (
              <div 
                key={txId + idx}
                className="glass-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  borderLeft: isInitialFunds ? '4px solid var(--indigo-500)' : '4px solid var(--emerald-500)'
                }}
              >
                {/* Top Row: Amount & Destination Account Title */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: isInitialFunds ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isInitialFunds ? 'var(--indigo-400)' : 'var(--emerald-400)'
                    }}>
                      {isInitialFunds ? <Download size={20} /> : <ArrowUpRight size={20} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                          {isInitialFunds ? 'Initial Funds Seeded' : 'Transferred to Destination'}
                        </span>
                        <span className={`badge ${item.status === 'COMPLETED' ? 'badge-success' : 'badge-pending'}`}>
                          {item.status || 'COMPLETED'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        <Clock size={12} />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transferred Amount Highlight */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: isInitialFunds ? 'var(--indigo-400)' : 'var(--emerald-400)',
                      fontFamily: 'var(--font-heading)'
                    }}>
                      {isInitialFunds ? '+' : '-'} ₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      INR Currency
                    </div>
                  </div>
                </div>

                {/* Account Details & Metadata Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem'
                }}>
                  {/* Destination Account */}
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginBottom: '0.15rem' }}>
                      Destination Account (Payee):
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <code className="mono" style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>
                        {item.toAccount || 'N/A'}
                      </code>
                      {item.toAccount && (
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => handleCopy(item.toAccount, 'Destination Account ID')}
                          title="Copy destination account ID"
                        >
                          {isCopiedDest ? <Check size={12} style={{ color: 'var(--emerald-400)' }} /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Source Account */}
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginBottom: '0.15rem' }}>
                      Source Account (Debited):
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <code className="mono" style={{ color: 'var(--text-muted)' }}>
                        {item.fromAccount || 'System Account'}
                      </code>
                    </div>
                  </div>

                  {/* Transaction ID & Re-send Action */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginBottom: '0.15rem' }}>
                        Transaction ID:
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <code className="mono" style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                          {txId.length > 18 ? `${txId.slice(0, 8)}...${txId.slice(-6)}` : txId}
                        </code>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => handleCopy(txId, 'Transaction ID')}
                          title="Copy full transaction ID"
                        >
                          {isCopiedTx ? <Check size={12} style={{ color: 'var(--emerald-400)' }} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Quick "Send Again" button */}
                    {!isInitialFunds && onSendAgain && item.toAccount && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.725rem' }}
                        onClick={() => onSendAgain(item.fromAccount, item.toAccount, item.amount)}
                        title="Send money again to this destination account"
                      >
                        <Send size={12} />
                        <span>Send Again</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
