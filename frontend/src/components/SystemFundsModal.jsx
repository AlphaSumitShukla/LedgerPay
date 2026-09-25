import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function SystemFundsModal({ 
  isOpen, 
  onClose, 
  accounts, 
  initialToAccountId, 
  onSuccess 
}) {
  const toast = useToast();

  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('1000');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setToAccount(initialToAccountId || (accounts.length > 0 ? accounts[0]._id : ''));
      setAmount('1000');
      setIdempotencyKey(generateUUID());
      setServerError('');
      setIsSuccess(false);
      setCountdown(15);
      setResultMessage('');
    }
  }, [isOpen, initialToAccountId, accounts]);

  // Handle visual timer countdown while waiting for the backend's 15s simulated delay
  useEffect(() => {
    let timer;
    if (loading && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading, countdown]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setLoading(true);
    setCountdown(15);

    try {
      const payload = {
        toAccount: toAccount.trim(),
        amount: parseFloat(amount),
        idempotencyKey: idempotencyKey.trim(),
      };

      const res = await api.transactions.createInitialFunds(payload);
      setIsSuccess(true);
      setResultMessage(res.message || 'Initial funds successfully deposited!');
      toast.success('Initial funds deposited into account!');
      
      if (onSuccess) {
        onSuccess({ ...(res.transaction || payload), type: 'INITIAL_FUNDS' });
      }
    } catch (err) {
      setServerError(
        err.message || 'Initial funds transaction failed. Ensure the account is active and you have system user privileges.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--indigo-400)'
            }}>
              <Download size={18} />
            </div>
            <span>System Initial Funds Deposit</span>
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

        <div className="modal-body">
          {!isSuccess ? (
            <form onSubmit={handleSubmit}>
              <div className="callout callout-info" style={{ marginBottom: '1.25rem' }}>
                <Info size={18} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>System Initial Funds Endpoint</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Calls <code className="mono">POST /api/transactions/system/initial-funds</code>. Note: The backend incorporates an intentional 15-second reserve settlement delay before finalizing the credit entry in the ledger.
                  </div>
                </div>
              </div>

              {serverError && (
                <div className="callout callout-warning" style={{ background: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#ffe4e6' }}>
                  <AlertCircle size={18} style={{ color: 'var(--rose-400)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>System User Restriction</div>
                    <div style={{ fontSize: '0.8rem' }}>{serverError}</div>
                  </div>
                </div>
              )}

              {/* Target Account Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="system-fund-account">
                  <span>Destination Account ID (Credit)</span>
                </label>
                <select
                  id="system-fund-account"
                  className="form-select"
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  disabled={loading}
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc._id} ({acc.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="system-fund-amount">
                  <span>Deposit Amount (INR)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--indigo-400)',
                    fontWeight: 700,
                  }}>
                    ₹
                  </span>
                  <input
                    id="system-fund-amount"
                    type="number"
                    min="1"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Countdown Progress during 15-second backend delay */}
              {loading && (
                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--amber-400)', fontSize: '0.85rem' }}>
                    <Clock size={16} />
                    <span>Backend 15s Settlement in progress (~{countdown}s remaining)...</span>
                  </div>
                  <div className="countdown-bar-wrapper">
                    <div 
                      className="countdown-bar-fill" 
                      style={{ width: `${((15 - countdown) / 15) * 100}%` }}
                    />
                  </div>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                    Executing MongoDB transaction session & ledger debit/credit ledger pair.
                  </p>
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  id="system-deposit-submit-btn"
                  type="submit"
                  className="btn btn-accent"
                  disabled={loading || !toAccount.trim() || parseFloat(amount) <= 0}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Processing ({countdown}s)...</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>Execute Initial Deposit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--emerald-400)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <CheckCircle2 size={32} />
              </div>

              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
                {resultMessage || 'Deposit Completed!'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Funds have been credited to account <code className="mono">{toAccount}</code>.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={onClose}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
