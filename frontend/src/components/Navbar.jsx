import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Building2, 
  LogOut, 
  Sun, 
  Moon
} from 'lucide-react';

export function Navbar({ onOpenNewAccount, accountsCount, totalBalance }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand / Logo */}
        <div className="brand-wrapper" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-logo-icon">
            <Building2 size={22} />
          </div>
          <div>
            <div className="brand-name">LedgerPay</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Double-Entry Ledger
            </div>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="header-user-menu">
          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            id="theme-toggle-btn"
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={17} style={{ color: '#fbbf24' }} />
            ) : (
              <Moon size={17} style={{ color: '#6366f1' }} />
            )}
          </button>

          {isAuthenticated && (

            <>
              {/* Quick Balance Pill */}
              <div className="user-pill" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Net:</span>
                <strong style={{ color: 'var(--emerald-400)' }}>
                  ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              {/* User Profile Info */}
              <div className="user-pill">
                <div className="user-avatar" title={user?.email}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--heading-color)', lineHeight: 1.1 }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {accountsCount} {accountsCount === 1 ? 'Account' : 'Accounts'}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                id="logout-btn"
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={logout}
                title="Log out from LedgerPay"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
