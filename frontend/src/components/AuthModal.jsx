import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle
} from 'lucide-react';

const POPULAR_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];

export function AuthModal() {
  const { login, register, loading } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form Fields - Always start strictly blank
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email Autocomplete Suggestion state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const emailInputRef = useRef(null);

  // Validation & Error state
  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Clear all fields on initial render
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setServerError('');
    setClientErrors({});
    setShowSuggestions(false);
  }, []);

  // Switch tabs and ensure all fields are completely cleared
  const handleSwitchTab = (toLogin) => {
    setIsLoginTab(toLogin);
    setName('');
    setEmail('');
    setPassword('');
    setServerError('');
    setClientErrors({});
    setShowSuggestions(false);
  };

  // Compute email suggestions while typing
  const getEmailSuggestions = () => {
    const trimmed = email.trim();
    if (!trimmed) return [];

    const atIndex = trimmed.indexOf('@');
    if (atIndex === -1) {
      if (trimmed.length < 2) return [];
      return POPULAR_DOMAINS.map((domain) => ({
        full: `${trimmed}@${domain}`,
        prefix: trimmed,
        domain: `@${domain}`,
      }));
    }

    const prefix = trimmed.slice(0, atIndex);
    const domainQuery = trimmed.slice(atIndex + 1).toLowerCase();

    if (!prefix) return [];

    const matching = POPULAR_DOMAINS.filter((d) => d.startsWith(domainQuery));
    if (matching.length === 0 || (matching.length === 1 && matching[0] === domainQuery)) {
      return [];
    }

    return matching.map((domain) => ({
      full: `${prefix}@${domain}`,
      prefix: prefix,
      domain: `@${domain}`,
    }));
  };

  const suggestions = getEmailSuggestions();

  const handleSelectSuggestion = (suggestedEmail) => {
    setEmail(suggestedEmail);
    setShowSuggestions(false);
    if (clientErrors.email) setClientErrors((prev) => ({ ...prev, email: null }));
  };


  // Email regex matching the exact backend userSchema pattern
  const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errs.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.';
    }

    if (!isLoginTab && !name.trim()) {
      errs.name = 'Full name is required for registration.';
    }

    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    try {
      if (isLoginTab) {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err) {
      setServerError(err.message || 'Authentication error. Please try again.');
    }
  };

  return (
    <div className="auth-page-wrapper" style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div className="glass-card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.5rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg), 0 0 40px rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #10b981, #047857)',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: '0 0 25px var(--emerald-glow)'
          }}>
            <Building2 size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
            {isLoginTab ? 'Sign in to LedgerPay' : 'Create an Account'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isLoginTab 
              ? 'Access your immutable double-entry ledger accounts' 
              : 'Join the institutional grade ledger platform'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '0.3rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.75rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            id="tab-login"
            type="button"
            className={`tab-btn ${isLoginTab ? 'active' : ''}`}
            onClick={() => handleSwitchTab(true)}
            style={{ justifyContent: 'center' }}
          >
            Sign In
          </button>
          <button
            id="tab-register"
            type="button"
            className={`tab-btn ${!isLoginTab ? 'active' : ''}`}
            onClick={() => handleSwitchTab(false)}
            style={{ justifyContent: 'center' }}
          >
            Register
          </button>
        </div>

        {/* Server Error Alert Banner */}
        {serverError && (
          <div className="callout callout-warning" style={{ background: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#ffe4e6' }}>
            <AlertCircle size={18} style={{ color: 'var(--rose-400)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Authentication Failed</div>
              <div style={{ fontSize: '0.8rem' }}>{serverError}</div>
            </div>
          </div>
        )}

        {/* Auth Form with autocomplete disabled */}
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          {/* Name Field (Register only) */}
          {!isLoginTab && (
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                <span>Full Name</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Satoshi Nakamoto"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (clientErrors.name) setClientErrors({ ...clientErrors, name: null });
                  }}
                  disabled={loading}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                />
              </div>
              {clientErrors.name && (
                <div className="form-error-text">
                  <AlertCircle size={13} />
                  <span>{clientErrors.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Email Field with Auto-Suggestion */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="auth-email">
              <span>Email Address</span>
              {suggestions.length > 0 && showSuggestions && (
                <span style={{ fontSize: '0.7rem', color: 'var(--emerald-400)' }}>
                  Suggestions available
                </span>
              )}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="auth-email"
                ref={emailInputRef}
                type="email"
                className="form-input"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setShowSuggestions(true);
                  if (clientErrors.email) setClientErrors({ ...clientErrors, email: null });
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
                    e.preventDefault();
                    handleSelectSuggestion(suggestions[0].full);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                disabled={loading}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="email-suggestions-menu">
                  <div style={{
                    fontSize: '0.6875rem',
                    color: 'var(--text-dim)',
                    padding: '0.25rem 0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Quick Suggestions</span>
                    <span>Press Tab ⇥</span>
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item.full}
                      type="button"
                      className="email-suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion(item.full);
                      }}
                    >
                      <span>
                        <span className="suggestion-prefix">{item.prefix}</span>
                        <span className="suggestion-domain">{item.domain}</span>
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {clientErrors.email && (
              <div className="form-error-text">
                <AlertCircle size={13} />
                <span>{clientErrors.email}</span>
              </div>
            )}
          </div>


          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              <span>Password</span>
              {isLoginTab && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Min 6 characters
                </span>
              )}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (clientErrors.password) setClientErrors({ ...clientErrors, password: null });
                }}
                disabled={loading}
                autoComplete="new-password"
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {clientErrors.password && (
              <div className="form-error-text">
                <AlertCircle size={13} />
                <span>{clientErrors.password}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>{isLoginTab ? 'Authenticating...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>{isLoginTab ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

