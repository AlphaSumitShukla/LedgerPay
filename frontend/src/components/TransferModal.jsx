import React, { useState, useEffect } from 'react';
import { 
  Send, 
  X, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Clipboard
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

// Helper to generate UUID v4 for idempotency
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

export function TransferModal({ 
  isOpen, 
  onClose, 
  accounts, 
  balances, 
  initialFromAccountId,
  initialToAccountId,
  initialAmount,
  onTransactionSuccess 
}) {
  const toast = useToast();

  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // Step: 'form' | 'confirm' | 'success'
  const [step, setStep] = useState('form');
  const [successData, setSuccessData] = useState(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultFrom = initialFromAccountId || (accounts.length > 0 ? accounts[0]._id : '');
      setFromAccount(defaultFrom);
      setToAccount(initialToAccountId || '');
      setAmount(initialAmount ? initialAmount.toString() : '');
      setIdempotencyKey(generateUUID());
      setServerError('');
      setStep('form');
      setSuccessData(null);
    }
  }, [isOpen, initialFromAccountId, initialToAccountId, initialAmount, accounts]);


  if (!isOpen) return null;

  const currentFromBalance = fromAccount ? (balances[fromAccount] ?? 0) : 0;
  const numAmount = parseFloat(amount) || 0;
  const remainingBalance = currentFromBalance - numAmount;

  // Validation
  const isAmountValid = numAmount > 0 && numAmount <= currentFromBalance;
  const isToAccountValid = toAccount.trim().length === 24;
  const isSameAccount = fromAccount && toAccount && fromAccount === toAccount;

  const handleQuickAmount = (val) => {
    if (val === 'all') {
      setAmount(currentFromBalance.toString());
    } else {
      setAmount(val.toString());
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setToAccount(text.trim());
        toast.info('Pasted Account ID from clipboard');
      }
    } catch {
      toast.error('Unable to read from clipboard. Please paste manually.');
    }
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    setServerError('');

    if (!fromAccount) {
      setServerError('Please select a source account.');
      return;
    }
    if (!toAccount.trim()) {
      setServerError('Please provide a destination account ID.');
      return;
    }
    if (isSameAccount) {
      setServerError('Source and destination accounts cannot be the same.');
      return;
    }
    if (numAmount <= 0) {
      setServerError('Please enter a valid amount greater than 0.');
      return;
    }
    if (numAmount > currentFromBalance) {
      setServerError(`Insufficient balance! Your current balance is ₹${currentFromBalance}.`);
      return;
    }

    if (!idempotencyKey) {
      setIdempotencyKey(generateUUID());
    }

    setStep('confirm');
  };

  const handleExecuteTransfer = async () => {
    setLoading(true);
    setServerError('');

    try {
      const activeIdempotencyKey = idempotencyKey || generateUUID();
      const payload = {
        fromAccount,
        toAccount: toAccount.trim(),
        amount: numAmount,
        idempotencyKey: activeIdempotencyKey,
      };

      const result = await api.transactions.create(payload);
      setSuccessData(result);
      setStep('success');
      toast.success('Transfer executed successfully!');
      
      if (onTransactionSuccess) {
        onTransactionSuccess(result.transaction);
      }
    } catch (err) {
      setServerError(err.message || 'Transaction failed. Please check the details and try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
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
              <Send size={18} />
            </div>
            <span>
              {step === 'form' && 'Send Money / Ledger Transfer'}
              {step === 'confirm' && 'Review & Confirm Transfer'}
              {step === 'success' && 'Transfer Completed'}
            </span>
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

        {/* Modal Body */}
        <div className="modal-body">
          {/* STEP 1: FORM */}
          {step === 'form' && (
            <form onSubmit={handleProceedToConfirm}>
              {serverError && (
                <div className="callout callout-warning" style={{ background: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#ffe4e6' }}>
                  <AlertCircle size={18} style={{ color: 'var(--rose-400)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>Transaction Error</div>
                    <div style={{ fontSize: '0.8rem' }}>{serverError}</div>
                  </div>
                </div>
              )}

              {/* Source Account Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="from-account-select">
                  <span>Source Account (Debit)</span>
                  <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>
                    Avail: ₹{currentFromBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </label>
                <select
                  id="from-account-select"
                  className="form-select"
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc._id} (₹{(balances[acc._id] ?? 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Account Field */}
              <div className="form-group">
                <div className="form-label">
                  <label htmlFor="to-account-input">Destination Account ID (Credit)</label>
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--indigo-400)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Clipboard size={12} />
                    <span>Paste</span>
                  </button>
                </div>
                <input
                  id="to-account-input"
                  type="text"
                  className="form-input mono"
                  placeholder="24-character MongoDB ObjectId"
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  maxLength={24}
                  required
                />

                {/* Quick selector for other accounts belonging to user */}
                {accounts.filter(a => a._id !== fromAccount).length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>My other accounts:</span>
                    {accounts.filter(a => a._id !== fromAccount).map(a => (
                      <button
                        key={a._id}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => setToAccount(a._id)}
                      >
                        {a._id.slice(0, 6)}...{a._id.slice(-4)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="transfer-amount-input">
                  <span>Transfer Amount (INR)</span>
                  {numAmount > 0 && (
                    <span style={{ fontSize: '0.75rem', color: remainingBalance >= 0 ? 'var(--text-muted)' : 'var(--rose-400)' }}>
                      Remaining: ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--emerald-400)',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    ₹
                  </span>
                  <input
                    id="transfer-amount-input"
                    type="number"
                    step="any"
                    min="1"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', fontSize: '1.1rem', fontWeight: 600 }}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                {/* Quick amount chips */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {[100, 500, 1000, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleQuickAmount(val)}
                    >
                      ₹{val}
                    </button>
                  ))}
                  {currentFromBalance > 0 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: 'var(--emerald-400)' }}
                      onClick={() => handleQuickAmount('all')}
                    >
                      Max (₹{currentFromBalance})
                    </button>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  id="review-transfer-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isAmountValid || !toAccount.trim() || isSameAccount}
                >
                  <span>Review Transfer</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: CONFIRMATION REVIEW */}
          {step === 'confirm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="callout callout-info">
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>ACID Double-Entry Ledger Commitment</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    This transaction executes atomic debit and credit entries verified by the ledger session.
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Amount:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                    ₹{numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>From Account (Debit):</span>
                  <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {fromAccount}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>To Account (Credit):</span>
                  <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {toAccount}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep('form')}
                  disabled={loading}
                >
                  Back to Edit
                </button>
                <button
                  id="confirm-transfer-btn"
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExecuteTransfer}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Committing to Ledger...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Send Funds</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS RECEIPT */}
          {step === 'success' && successData && (
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
                boxShadow: '0 0 25px var(--emerald-glow)'
              }}>
                <CheckCircle2 size={32} />
              </div>

              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                {successData.message || 'Transfer Successful!'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Double-entry ledger verified. Confirmation email dispatched.
              </p>

              {successData.transaction && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Transaction ID:</span>
                    <span className="mono" style={{ color: 'var(--text-main)' }}>{successData.transaction._id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Amount:</span>
                    <span style={{ fontWeight: 700, color: 'var(--emerald-400)' }}>
                      ₹{successData.transaction.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Status:</span>
                    <span className="badge badge-success">{successData.transaction.status}</span>
                  </div>
                </div>
              )}

              <button
                id="transfer-done-btn"
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={onClose}
              >
                Close Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
