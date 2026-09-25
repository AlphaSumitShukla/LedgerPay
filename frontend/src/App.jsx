import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AccountsList } from './components/AccountsList';
import { TransferModal } from './components/TransferModal';
import { SystemFundsModal } from './components/SystemFundsModal';
import { ApiExplorerModal } from './components/ApiExplorerModal';
import { TransferHistory } from './components/TransferHistory';
import { 
  Building2, 
  Send, 
  Plus, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Wallet,
  RefreshCw,
  ExternalLink,
  Code2,
  History,
  Layers
} from 'lucide-react';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Active view tab: 'all' | 'accounts' | 'history'
  const [activeTab, setActiveTab] = useState('all');

  // Transfer history state (stored per user in localStorage)
  const [history, setHistory] = useState(() => {
    if (!user?._id) return [];
    try {
      const saved = localStorage.getItem(`ledger_tx_history_${user._id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal States
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedTransferFromId, setSelectedTransferFromId] = useState(null);
  const [selectedTransferToId, setSelectedTransferToId] = useState('');
  const [selectedTransferAmount, setSelectedTransferAmount] = useState('');
  const [systemFundModalOpen, setSystemFundModalOpen] = useState(false);
  const [selectedSystemFundToId, setSelectedSystemFundToId] = useState(null);
  const [apiExplorerOpen, setApiExplorerOpen] = useState(false);

  // Load history whenever authenticated user changes
  useEffect(() => {
    if (user?._id) {
      try {
        const saved = localStorage.getItem(`ledger_tx_history_${user._id}`);
        setHistory(saved ? JSON.parse(saved) : []);
      } catch {
        setHistory([]);
      }
    }
  }, [user?._id]);

  // Fetch all accounts and their respective balances
  const loadAccountsAndBalances = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingAccounts(true);

    try {
      const data = await api.accounts.getAll();
      const userAccounts = data.accounts || [];
      setAccounts(userAccounts);

      // Fetch balances for each account concurrently
      const balanceMap = {};
      await Promise.all(
        userAccounts.map(async (acc) => {
          try {
            const balData = await api.accounts.getBalance(acc._id);
            balanceMap[acc._id] = balData.balance;
          } catch (err) {
            console.warn(`Failed to fetch balance for account ${acc._id}:`, err);
            balanceMap[acc._id] = 0;
          }
        })
      );
      setBalances(balanceMap);
    } catch (err) {
      toast.error(err.message || 'Failed to retrieve accounts from server.');
    } finally {
      setLoadingAccounts(false);
    }
  }, [isAuthenticated, toast]);

  // Load accounts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAccountsAndBalances();
    }
  }, [isAuthenticated, loadAccountsAndBalances]);

  // Record a newly executed transfer in the history log
  const handleAddTransactionToHistory = (newTx) => {
    if (!newTx) return;
    setHistory((prev) => {
      const updated = [
        {
          ...newTx,
          createdAt: newTx.createdAt || new Date().toISOString(),
        },
        ...prev,
      ];
      if (user?._id) {
        localStorage.setItem(`ledger_tx_history_${user._id}`, JSON.stringify(updated));
      }
      return updated;
    });

    // Refresh accounts and balances
    loadAccountsAndBalances();
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local transfer history?')) {
      setHistory([]);
      if (user?._id) {
        localStorage.removeItem(`ledger_tx_history_${user._id}`);
      }
      toast.info('Transfer history cleared.');
    }
  };

  // Quick "Send Again" action from history item
  const handleSendAgain = (fromAcc, toAcc, amt) => {
    setSelectedTransferFromId(fromAcc || (accounts.length > 0 ? accounts[0]._id : null));
    setSelectedTransferToId(toAcc || '');
    setSelectedTransferAmount(amt || '');
    setTransferModalOpen(true);
  };

  // Fetch balance for a single account
  const handleRefreshSingleBalance = async (accountId) => {
    try {
      const res = await api.accounts.getBalance(accountId);
      setBalances((prev) => ({
        ...prev,
        [accountId]: res.balance,
      }));
      toast.info(`Updated balance for account ${accountId.slice(0, 6)}...: ₹${res.balance}`);
    } catch (err) {
      toast.error(`Error updating balance: ${err.message}`);
    }
  };

  // Open a new account via POST /api/accounts/
  const handleCreateAccount = async () => {
    try {
      const res = await api.accounts.create();
      toast.success('New ledger account created successfully!');
      await loadAccountsAndBalances();
    } catch (err) {
      toast.error(err.message || 'Failed to create new account.');
    }
  };

  // Initiate transfer from a specific account
  const handleInitiateTransfer = (fromAccountId) => {
    setSelectedTransferFromId(fromAccountId);
    setSelectedTransferToId('');
    setSelectedTransferAmount('');
    setTransferModalOpen(true);
  };

  // Initiate system fund deposit for a specific account
  const handleInitiateSystemFund = (toAccountId) => {
    setSelectedSystemFundToId(toAccountId);
    setSystemFundModalOpen(true);
  };

  // Calculate aggregated net balance across all accounts
  const totalBalance = Object.values(balances).reduce((sum, b) => sum + (Number(b) || 0), 0);

  if (!isAuthenticated) {
    return (
      <>
        <Navbar 
          accountsCount={0}
          totalBalance={0}
        />
        <main style={{ flex: 1 }}>
          <AuthModal />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar 
        onOpenNewAccount={handleCreateAccount}
        accountsCount={accounts.length}
        totalBalance={totalBalance}
      />

      <main className="dashboard-container">
        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-grid">
            <div>
              <div className="hero-greeting">
                <Sparkles size={16} />
                <span>Welcome to your Institutional Ledger</span>
              </div>
              <h1 className="hero-title">
                Hello, {user?.name || 'Account Holder'}
              </h1>
              <p className="hero-subtitle">
                Your portfolio is protected with double-entry cryptographic verification, 
                ACID transactional isolation, and immutable ledger journaling.
              </p>

              {/* Quick Actions in Hero */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  id="hero-transfer-btn"
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedTransferFromId(accounts.length > 0 ? accounts[0]._id : null);
                    setSelectedTransferToId('');
                    setSelectedTransferAmount('');
                    setTransferModalOpen(true);
                  }}
                  disabled={accounts.length === 0}
                >
                  <Send size={15} />
                  <span>Transfer Funds</span>
                </button>

                <button
                  id="hero-new-account-btn"
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCreateAccount}
                >
                  <Plus size={15} />
                  <span>Open New Account</span>
                </button>

                <button
                  id="hero-fund-btn"
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedSystemFundToId(accounts.length > 0 ? accounts[0]._id : null);
                    setSystemFundModalOpen(true);
                  }}
                  disabled={accounts.length === 0}
                >
                  <Download size={15} />
                  <span>Deposit Initial Funds</span>
                </button>
              </div>
            </div>

            {/* Total Balance Card */}
            <div className="hero-balance-card">
              <div className="hero-balance-label">Total Net Portfolio Balance</div>
              <div className="hero-balance-value">
                <span className="hero-balance-currency">₹</span>
                <span>{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <ShieldCheck size={14} style={{ color: 'var(--emerald-400)' }} />
                <span>Double-Entry Verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Navigation Tabs */}
        <section className="action-bar" style={{ marginBottom: '-0.5rem' }}>
          <div className="action-bar-tabs">
            <button
              id="tab-view-all"
              type="button"
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <Layers size={14} />
              <span>All Overview</span>
            </button>
            <button
              id="tab-view-accounts"
              type="button"
              className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
              onClick={() => setActiveTab('accounts')}
            >
              <Wallet size={14} />
              <span>Accounts ({accounts.length})</span>
            </button>
            <button
              id="tab-view-history"
              type="button"
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} />
              <span>Transfer History ({history.length})</span>
            </button>
          </div>
        </section>

        {/* Accounts Section */}
        {(activeTab === 'all' || activeTab === 'accounts') && (
          <section>
            <AccountsList
              accounts={accounts}
              balances={balances}
              loading={loadingAccounts}
              onRefresh={loadAccountsAndBalances}
              onRefreshSingleBalance={handleRefreshSingleBalance}
              onCreateAccount={handleCreateAccount}
              onInitiateTransfer={handleInitiateTransfer}
              onInitiateSystemFund={handleInitiateSystemFund}
            />
          </section>
        )}

        {/* Transfer History Section */}
        {(activeTab === 'all' || activeTab === 'history') && (
          <section style={{ marginTop: activeTab === 'all' ? '1rem' : 0 }}>
            <TransferHistory
              history={history}
              onClearHistory={handleClearHistory}
              onSendAgain={handleSendAgain}
            />
          </section>
        )}


      </main>

      {/* Modals */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        accounts={accounts}
        balances={balances}
        initialFromAccountId={selectedTransferFromId}
        initialToAccountId={selectedTransferToId}
        initialAmount={selectedTransferAmount}
        onTransactionSuccess={handleAddTransactionToHistory}
      />

      <SystemFundsModal
        isOpen={systemFundModalOpen}
        onClose={() => setSystemFundModalOpen(false)}
        accounts={accounts}
        initialToAccountId={selectedSystemFundToId}
        onSuccess={handleAddTransactionToHistory}
      />

      <ApiExplorerModal
        isOpen={apiExplorerOpen}
        onClose={() => setApiExplorerOpen(false)}
      />

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        background: 'var(--footer-bg)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            LedgerPay &copy; 2026. Built with React & Vite. Real backend on port 3000.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>MongoDB Ledger Engine</span>
            <span>&bull;</span>
            <span>JWT Session Guard</span>
            <span>&bull;</span>
            <span>Idempotent Transaction Pipeline</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

