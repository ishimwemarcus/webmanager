import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateDailySummary, calculateTradingRatio, generateSystemHealthReport } from '../utils/Reporter';

const load = (key, type, def) => {
  const data = localStorage.getItem(key);
  if (!data) return def;
  try {
    const parsed = JSON.parse(data);
    if (key === 'biztrack_users' && parsed.length === 0) return def;
    return parsed.map(d => ({ 
      ...d, 
      record_type: d.record_type || type,
      id: d.id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)) 
    }));
  } catch(e) { return def; }
};

const StoreContext = createContext();

const DEFAULT_USERS = [
  {
    id: 'admin-master-001',
    record_type: 'user',
    name: 'System Administrator',
    username: 'admin',
    password: 'password123',
    role: 'Master',
    status: 'active'
  }
];

const getCurrentUser = () => {
  return { username: 'admin', role: 'Master' };
};

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState(() => load('biztrack_products', 'product', []));
  const [sales, setSales] = useState(() => load('biztrack_sales', 'sale', []));
  const [expenses, setExpenses] = useState(() => load('biztrack_expenses', 'expense', []));
  const [users, setUsers] = useState(() => load('biztrack_users', 'user', DEFAULT_USERS));
  const [ledgerManual, setLedgerManual] = useState(() => load('biztrack_ledger', 'ledger_entry', []));
  const [waitCredits, setWaitCredits] = useState(() => load('biztrack_wait', 'wait_credit', []));
  const [categories, setCategories] = useState([
    { id: 'cat_001', name: 'Beverages' },
    { id: 'cat_002', name: 'Fruits' }
  ]);
  const [reportArchive, setReportArchive] = useState(() => load('biztrack_reports', 'report', []));
  const [losses, setLosses] = useState(() => load('biztrack_losses', 'loss', []));
  const [reconciliations, setReconciliations] = useState(() => load('biztrack_reconciliations', 'reconciliation', []));
  const [shifts, setShifts] = useState(() => load('biztrack_shifts', 'shift', []));
  const [clearanceGrants, setClearanceGrants] = useState(() => {
    try {
      const saved = localStorage.getItem('biztrack_clearance');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', onConfirm: null, onCancel: null });
  const [notification, setNotification] = useState(null); // { message, type: 'success' | 'error' | 'warning' }
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('biztrack_currency') || '€';
    return (typeof saved === 'string' && !saved.includes('[object')) ? saved : '€';
  });
  const [currentOperator, setCurrentOperator] = useState(() => localStorage.getItem('biztrack_operator') || '');
  const [shiftStart, setShiftStart] = useState(() => localStorage.getItem('biztrack_shift_start') || '');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isShiftEndModalOpen, setIsShiftEndModalOpen] = useState(false);
  const [purgeUnlocked, setPurgeUnlocked] = useState(false);

  
  // Global Internet API URL (Tunnels straight to the shop's XAMPP Server)
  const API_URL = 'https://marcus-live-sync-v2.loca.lt/manager%20web/api.php';
  const FETCH_CONFIG = { headers: { 'Bypass-Tunnel-Reminder': 'true' } };

  // Network Sync Engine - Polls the central PHP server (with circuit breaker)
  useEffect(() => {
    let failCount = 0;
    const MAX_FAILS = 3;
    const RETRY_DELAY = 120000; // 2 min backoff after circuit opens
    let intervalId = null;
    let backoffId = null;

    const pullFromServer = async () => {
      try {
        const keysList = [
          { k: 'biztrack_products', set: setProducts },
          { k: 'biztrack_sales', set: setSales },
          { k: 'biztrack_expenses', set: setExpenses },
          { k: 'biztrack_users', set: setUsers },
          { k: 'biztrack_ledger', set: setLedgerManual },
          { k: 'biztrack_wait', set: setWaitCredits },
          { k: 'biztrack_losses', set: setLosses },
          { k: 'biztrack_reconciliations', set: setReconciliations },
          { k: 'biztrack_shifts', set: setShifts },
          { k: 'biztrack_categories', set: setCategories },
          { k: 'biztrack_reports', set: setReportArchive },
          { k: 'biztrack_currency', set: (val) => {
            const clean = Array.isArray(val) ? (val[0]?.val || val[0] || '€') : (val?.val || val || '€');
            setCurrency(String(clean));
          }}
        ];

        // Quick reachability check first (single request)
        const testRes = await fetch(`${API_URL}?action=ping`, { ...FETCH_CONFIG, signal: AbortSignal.timeout(3000) });
        if (!testRes.ok) throw new Error('API unreachable');

        failCount = 0; // Reset on success

        for (const item of keysList) {
          const res = await fetch(`${API_URL}?action=get&key=${item.k}`, FETCH_CONFIG);
          if (!res.ok) continue;
          const serverData = await res.json();
          if (serverData && serverData.length > 0) {
            item.set(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(serverData)) return serverData;
              return prev;
            });
          }
        }
      } catch (e) {
        failCount++;
        if (failCount >= MAX_FAILS) {
          // Circuit open: stop polling, schedule a retry after backoff
          clearInterval(intervalId);
          intervalId = null;
          backoffId = setTimeout(() => {
            failCount = 0;
            startPolling(); // Try again after backoff
          }, RETRY_DELAY);
        }
      }
    };

    const startPolling = () => {
      pullFromServer();
      intervalId = setInterval(pullFromServer, 6000); // 6 second tick
    };

    startPolling();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (backoffId) clearTimeout(backoffId);
    };
  }, []);


  useEffect(() => localStorage.setItem('biztrack_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('biztrack_sales', JSON.stringify(sales)), [sales]);
  useEffect(() => localStorage.setItem('biztrack_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('biztrack_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('biztrack_ledger', JSON.stringify(ledgerManual)), [ledgerManual]);
  useEffect(() => localStorage.setItem('biztrack_wait', JSON.stringify(waitCredits)), [waitCredits]);
  useEffect(() => localStorage.setItem('biztrack_categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('biztrack_reports', JSON.stringify(reportArchive)), [reportArchive]);
  useEffect(() => localStorage.setItem('biztrack_losses', JSON.stringify(losses)), [losses]);
  useEffect(() => localStorage.setItem('biztrack_reconciliations', JSON.stringify(reconciliations)), [reconciliations]);
  useEffect(() => localStorage.setItem('biztrack_shifts', JSON.stringify(shifts)), [shifts]);
  useEffect(() => localStorage.setItem('biztrack_operator', currentOperator), [currentOperator]);
  useEffect(() => localStorage.setItem('biztrack_shift_start', shiftStart), [shiftStart]);
  
  useEffect(() => {
    const stringCurrency = String(currency?.val || currency || '€');
    localStorage.setItem('biztrack_currency', stringCurrency);
    // Push to server (wrapped as array for PHP compatibility)
    fetch(`${API_URL}?action=overwrite&key=biztrack_currency`, { 
      method: 'POST', 
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify([{ val: stringCurrency }]) 
    }).catch(()=>{});
  }, [currency, API_URL]);

  // Cross-tab sync: re-read state when another tab (e.g. admin panel) writes to localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'biztrack_users')    setUsers(load('biztrack_users', 'user', DEFAULT_USERS));
      if (e.key === 'biztrack_products') setProducts(load('biztrack_products', 'product', []));
      if (e.key === 'biztrack_sales')    setSales(load('biztrack_sales', 'sale', []));
      if (e.key === 'biztrack_expenses') setExpenses(load('biztrack_expenses', 'expense', []));
      if (e.key === 'biztrack_ledger')   setLedgerManual(load('biztrack_ledger', 'ledger_entry', []));
      if (e.key === 'biztrack_wait')     setWaitCredits(load('biztrack_wait', 'wait_credit', []));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Note: The operator privacy scope filter was removed because the user expressly requested
  // that all employees share the identical global inventory dashboard.
  const scopeFilter = (records) => {
    return records;
  };

  const getProducts = () => products;
  const getSales = () => [...sales].sort((a,b) => new Date(b.date) - new Date(a.date));
  const getExpenses = () => [...expenses].sort((a,b) => new Date(b.date) - new Date(a.date));
  const getUsers = () => {
    const cu = getCurrentUser();
    // Mask passwords for non-Master users
    if (cu?.role !== 'Master') {
      return users.map(({ password, ...u }) => u);
    }
    return users;
  };
  const getLedgerManual = () => ledgerManual;
  const getCategories = () => categories;
  const getWaitCredits = () => [...waitCredits].sort((a,b) => new Date(b.date) - new Date(a.date));
  const getLosses = () => [...losses].sort((a,b) => new Date(b.date) - new Date(a.date));
  const getReconciliations = () => [...reconciliations].sort((a,b) => new Date(b.date) - new Date(a.date));
  const getShifts = () => [...shifts].sort((a,b) => new Date(b.end) - new Date(a.end));
  const getShiftTransactions = (shiftId) => ({
    sales: sales.filter(s => s.shiftId === shiftId),
    expenses: ledgerManual.filter(l => l.shiftId === shiftId && l.type === 'expense'),
    tips: ledgerManual.filter(l => l.shiftId === shiftId && l.type === 'tip'),
    losses: losses.filter(l => l.shiftId === shiftId)
  });
  // Get total wait credit for a specific client name
  const getReportArchive = () => [...reportArchive].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

  const generateAndArchiveFullReport = () => {
    const report = generateSystemHealthReport(products, sales, expenses, ledgerManual, waitCredits, losses);
    setReportArchive(prev => [report, ...prev]);
    // Force immediate sync for report
    fetch(`${API_URL}?action=push&key=biztrack_reports`, { 
      method: 'POST', 
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify(report) 
    }).catch(()=>{});
    return report;
  };

  const getClientWaitBalance = (clientName, phone = 'none') => {
    if (!clientName) return 0;
    const searchName = clientName.trim().toLowerCase();
    const searchPhone = (phone || 'none').trim();
    
    return waitCredits
      .filter(w => (w.client || '').trim().toLowerCase() === searchName
                && (w.phone || 'none').trim() === searchPhone
                && (parseFloat(w.balance)||0) > 0)
      .reduce((s, w) => s + (parseFloat(w.balance)||0), 0);
  };


  const getClientDebtBalance = (clientName, phone = 'none') => {
    if (!clientName) return 0;
    const searchName = clientName?.toLowerCase().trim();
    const searchPhone = (phone || 'none').trim();
    
    // Calculate debt from unpaid sales
    const salesDebt = scopeFilter(sales)
      .filter(s => s.client?.toLowerCase().trim() === searchName && (s.phone || 'none').trim() === searchPhone)
      .reduce((sum, s) => {
        const debt = Math.max(0, (parseFloat(s.amount) || 0) - (parseFloat(s.paid) || 0));
        return sum + debt;
      }, 0);

    // Calculate debt from manual ledger receivables
    const ledgerDebt = scopeFilter(ledgerManual)
      .filter(l => l.type === 'receivable' && l.client?.toLowerCase().trim() === searchName && (l.phone || 'none').trim() === searchPhone)
      .reduce((sum, l) => {
        const debt = Math.max(0, (parseFloat(l.amount) || 0) - (parseFloat(l.paid) || 0));
        return sum + debt;
      }, 0);

    return salesDebt + ledgerDebt;
  };

  const getClientGlobalBalance = (clientName, phone = 'none') => {
    if (!clientName) return 0;
    const debt = getClientDebtBalance(clientName, phone);
    const credit = getClientWaitBalance(clientName, phone);
    return credit - debt; // Positive = Credit, Negative = Debt
  };

  const getClientTrustScore = (clientName, phone = 'none') => {
    if (!clientName) return 0;
    const searchName = clientName.toLowerCase().trim();
    const searchPhone = (phone || 'none').trim();

    const clientSales = sales.filter(s => (s.client || '').toLowerCase().trim() === searchName && (s.phone || 'none').trim() === searchPhone);
    if (clientSales.length === 0) return 3; // Neutral for new clients

    const totalAmount = clientSales.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    const totalPaid = clientSales.reduce((s, x) => s + (parseFloat(x.paid) || 0), 0);
    
    if (totalAmount === 0) return 5;
    
    const ratio = totalPaid / totalAmount;
    const score = Math.min(5, Math.max(1, Math.round(ratio * 5)));
    
    // Bonus for high transaction count
    if (clientSales.length > 10 && score >= 4) return 5;
    
    return score;
  };

  const getAssetManagementData = () => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats.map(cat => {
      const catProds = products.filter(p => p.category === cat);
      const catSales = sales.filter(s => {
        const prod = products.find(p => p.name.toLowerCase() === s.name?.toLowerCase());
        return prod && prod.category === cat;
      });

      const inStockQty = catProds.reduce((sum, p) => sum + (p.quantity || 0), 0);
      const unitsDeployed = catSales.reduce((sum, s) => sum + (s.quantity || 0), 0);
      const totalRevenue = catSales.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
      const assetValue = catProds.reduce((sum, p) => sum + ((p.quantity || 0) * (parseFloat(p.cost) || 0)), 0);
      
      const avgPrice = unitsDeployed > 0 ? (totalRevenue / unitsDeployed) : (catProds.length > 0 ? catProds[0].price : 0);

      return {
        id: cat,
        assetType: cat.toUpperCase(),
        accountManager: "OPERATIONS",
        inStockQty,
        unitRate: avgPrice,
        assetValue,
        unitsDeployed,
        totalRevenue,
        status: inStockQty > 10 ? 'Healthy' : (inStockQty > 0 ? 'Low' : 'Empty')
      };
    });
  };

  const addRecord = (record) => {
    record.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    // Tag with current user so data stays isolated per operator
    if (record.record_type !== 'user' && record.record_type !== 'shift') {
      const cu = getCurrentUser();
      const op = currentOperator || cu?.username || 'Admin';
      record.operator = op;
      record.createdBy = op;
      record.timestamp = new Date().toISOString(); 
      record.shiftId = shiftStart || record.timestamp; 
      record.currency = currency; // Lock currency at time of record
    }
    // Sanitize numeric fields
    if (record.amount !== undefined) record.amount = parseFloat(record.amount) || 0;
    if (record.paid !== undefined) record.paid = parseFloat(record.paid) || 0;
    if (record.quantity !== undefined) record.quantity = parseFloat(record.quantity) || 0;
    if (record.cost !== undefined) record.cost = parseFloat(record.cost) || 0;
    if (record.price !== undefined) record.price = parseFloat(record.price) || 0;

    const apiPush = (key) => fetch(`${API_URL}?action=push&key=${key}`, { 
      method: 'POST', 
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify(record) 
    }).catch(()=>{});

    if (record.record_type === 'product') { setProducts(prev => [...prev, record]); apiPush('biztrack_products'); }
    else if (record.record_type === 'sale') { setSales(prev => [...prev, record]); apiPush('biztrack_sales'); }
    else if (record.record_type === 'expense') { setExpenses(prev => [...prev, record]); apiPush('biztrack_expenses'); }
    else if (record.record_type === 'user') { setUsers(prev => [...prev, record]); apiPush('biztrack_users'); }
    else if (record.record_type === 'ledger_entry') { setLedgerManual(prev => [...prev, record]); apiPush('biztrack_ledger'); }
    else if (record.record_type === 'wait_credit') { setWaitCredits(prev => [...prev, record]); apiPush('biztrack_wait'); }
    
    else if (record.record_type === 'report') setReportArchive(prev => [...prev, record]);
    else if (record.record_type === 'loss') {
      setLosses(prev => [...prev, record]);
      apiPush('biztrack_losses');
      // Auto-Decrement Stock
      const product = products.find(p => p.id === record.product_id || p.product_id === record.product_id);
      if (product) {
        updateRecord({ ...product, quantity: Math.max(0, (product.quantity || 0) - (parseFloat(record.quantity) || 0)) });
      }
    }
    else if (record.record_type === 'reconciliation') { setReconciliations(prev => [...prev, record]); apiPush('biztrack_reconciliations'); }
    else if (record.record_type === 'category') { setCategories(prev => [...prev, record]); apiPush('biztrack_categories'); }
    else if (record.record_type === 'shift') { setShifts(prev => [...prev, record]); apiPush('biztrack_shifts'); }
    else if (record.record_type === 'debt_payment') { 
      settleClientDebt(record.client, record.phone, record.amount, record.paymentMethod, record.operator);
    }

    return record;
  };

  const updateRecord = (record) => {
    const user = getCurrentUser();
    
    // Guardian Protocol: Owner Gate Enforcement for Master
    if (user?.role === 'Master' && record.createdBy && record.createdBy !== user.id && record.createdBy !== user.username) {
      const owner = users.find(u => u.username === record.createdBy || u.id === record.createdBy);
      if (owner && !clearanceGrants[owner.id]) {
        showConfirm(`CLEARANCE REQUIRED: The node '${owner.name}' is currently locked. Request the owner to grant 'Consultant Access' to modify this record.`, () => {}, () => {});
        return;
      }
    }

    // Sanitize numeric fields
    if (record.amount !== undefined) record.amount = parseFloat(record.amount) || 0;
    if (record.paid !== undefined) record.paid = parseFloat(record.paid) || 0;
    if (record.quantity !== undefined) record.quantity = parseFloat(record.quantity) || 0;
    if (record.cost !== undefined) record.cost = parseFloat(record.cost) || 0;
    if (record.price !== undefined) record.price = parseFloat(record.price) || 0;

    const update = prev => prev.map(d => d.id === record.id ? { ...d, ...record } : d);
    const apiUpdate = (key) => fetch(`${API_URL}?action=update&key=${key}`, { 
      method: 'POST', 
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify(record) 
    }).catch(()=>{});

    if (record.record_type === 'product') { setProducts(update); apiUpdate('biztrack_products'); }
    else if (record.record_type === 'sale') { setSales(update); apiUpdate('biztrack_sales'); }
    else if (record.record_type === 'expense') { setExpenses(update); apiUpdate('biztrack_expenses'); }
    else if (record.record_type === 'user') { setUsers(update); apiUpdate('biztrack_users'); }
    else if (record.record_type === 'ledger_entry') { setLedgerManual(update); apiUpdate('biztrack_ledger'); }
    else if (record.record_type === 'wait_credit') { setWaitCredits(update); apiUpdate('biztrack_wait'); }
    else if (record.record_type === 'category') { setCategories(update); apiUpdate('biztrack_categories'); }
    else if (record.record_type === 'loss') { setLosses(update); apiUpdate('biztrack_losses'); }
    else if (record.record_type === 'reconciliation') { setReconciliations(update); apiUpdate('biztrack_reconciliations'); }
    else if (record.record_type === 'shift') { setShifts(update); apiUpdate('biztrack_shifts'); }
    else if (record.record_type === 'report') { setReportArchive(update); apiUpdate('biztrack_reports'); }
  };

  const deleteRecord = (record) => {
    const user = getCurrentUser();
    
    const executeDelete = () => {
      const del = prev => prev.filter(d => {
        const dId = d.id || d.product_id || d.sale_id || d.key;
        const rId = record.id || record.product_id || record.sale_id || record.key;
        return dId !== rId;
      });

      const apiDelete = (key) => fetch(`${API_URL}?action=delete&key=${key}`, { 
        method: 'POST', 
        headers: { 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify(record) 
      }).catch(()=>{});

      if (record.record_type === 'product') { setProducts(del); apiDelete('biztrack_products'); }
      else if (record.record_type === 'sale') { 
        setSales(del); 
        apiDelete('biztrack_sales'); 
        // UNDO Stock Impact
        const product = products.find(p => p.id === record.product_id || p.product_id === record.product_id);
        if (product) {
          updateRecord({ ...product, quantity: (product.quantity || 0) + (parseFloat(record.quantity) || 0) });
        }
      }
      else if (record.record_type === 'expense') { setExpenses(del); apiDelete('biztrack_expenses'); }
      else if (record.record_type === 'user') { setUsers(del); apiDelete('biztrack_users'); }
      else if (record.record_type === 'ledger_entry') { setLedgerManual(del); apiDelete('biztrack_ledger'); }
      else if (record.record_type === 'wait_credit') { setWaitCredits(del); apiDelete('biztrack_wait'); }
      else if (record.record_type === 'loss') { 
        setLosses(del); 
        apiDelete('biztrack_losses'); 
        // UNDO Stock Impact
        const product = products.find(p => p.id === record.product_id || p.product_id === record.product_id);
        if (product) {
          updateRecord({ ...product, quantity: (product.quantity || 0) + (parseFloat(record.quantity) || 0) });
        }
      }
      else if (record.record_type === 'reconciliation') { setReconciliations(del); apiDelete('biztrack_reconciliations'); }
      else if (record.record_type === 'report') { setReportArchive(del); apiDelete('biztrack_reports'); }
      else if (record.record_type === 'category') { setCategories(del); apiDelete('biztrack_categories'); }
      else if (record.record_type === 'shift') { setShifts(del); apiDelete('biztrack_shifts'); }
    };

    // Guardian Protocol: Owner Gate Enforcement for Master
    if (user?.role === 'Master' && record.createdBy && record.createdBy !== user.id && record.createdBy !== user.username) {
      const owner = users.find(u => u.username === record.createdBy || u.id === record.createdBy);
      if (owner && !clearanceGrants[owner.id]) {
        showConfirm(`CLEARANCE REQUIRED: Node '${owner.name}' is locked. Bypass Guardian Protocol and force purge?`, () => {
          executeDelete();
          showAlert("Guardian Protocol Bypassed.", "warning");
        });
        return;
      }
    }

    executeDelete();
  };

  const formatCurrency = (value) => {
    const val = parseFloat(value || 0);
    const curStr = String(currency?.val || currency || '€');
    const noDecimals = curStr === 'RWF' || curStr === 'TZS' || curStr === 'UGX';
    return `${val.toLocaleString(undefined, {
      minimumFractionDigits: noDecimals ? 0 : 2, 
      maximumFractionDigits: noDecimals ? 0 : 2
    })} ${curStr}`;
  };

  const getSystemStatus = () => {
    const lowStock = products.filter(p => p.quantity <= 5).length;
    const unpaid = sales.filter(r => (parseFloat(r.amount) || 0) > (parseFloat(r.paid) || 0)).length;
    const waitBalance = waitCredits.reduce((s, w) => s + (parseFloat(w.balance) || 0), 0);

    if (lowStock > 3 || unpaid > 5) return 'systemWarning';
    if (lowStock > 0 || unpaid > 0 || waitBalance > 1000) return 'systemAlert';
    return 'allProtocolsNominal';
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (includeTime) {
      return date.toLocaleString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const exportData = () => {
    const keys = ['biztrack_products', 'biztrack_sales', 'biztrack_expenses', 'biztrack_users', 'biztrack_ledger', 'biztrack_wait', 'biztrack_report_archive', 'biztrack_pin'];
    const data = {};
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) {
        try { data[k] = JSON.parse(val); } catch(e) { console.error(`Error parsing ${k}`, e); }
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `biztrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportPersonalData = () => {
    const cu = getCurrentUser();
    if (!cu) return;

    const keys = ['biztrack_products', 'biztrack_sales', 'biztrack_expenses', 'biztrack_ledger', 'biztrack_wait'];
    const data = { 
      metadata: { owner: cu.username, timestamp: new Date().toISOString(), type: 'Personal Node Archive' }
    };
    
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) {
        try { 
          const records = JSON.parse(val);
          data[k] = records.filter(r => r.createdBy === cu.username);
        } catch(e) { console.error(`Error parsing ${k}`, e); }
      }
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `personal_node_archive_${cu.username}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const importData = (jsonData) => {
    try {
      Object.entries(jsonData).forEach(([key, value]) => {
        if (key.startsWith('biztrack_')) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
      window.location.reload();
    } catch (e) {
      console.error("Import error", e);
      showAlert("System Error: Failed to import payload. Check format.", "error");
    }
  };

  const clearAllData = () => {
    const keys = [
      'biztrack_products', 'biztrack_sales', 'biztrack_expenses', 
      'biztrack_users', 'biztrack_ledger', 'biztrack_wait', 
      'biztrack_report_archive', 'biztrack_pin', 'biztrack_locked', 'biztrack_user'
    ];
    keys.forEach(k => {
      localStorage.removeItem(k);
      // Also purge from the remote server
      if (k !== 'biztrack_pin' && k !== 'biztrack_locked' && k !== 'biztrack_user') {
        fetch(`${API_URL}?action=overwrite&key=${k}`, { 
          method: 'POST', 
          headers: { 'Bypass-Tunnel-Reminder': 'true' },
          body: JSON.stringify([]) 
        }).catch(()=>{});
      }
    });
    setTimeout(() => window.location.reload(), 1000); // Give server a second to process before reloading
  };

  const showConfirm = (message, onConfirm, onCancel = null) => {
    setConfirmState({
      isOpen: true,
      message,
      onConfirm: () => { onConfirm(); setConfirmState(prev => ({ ...prev, isOpen: false })); },
      onCancel: () => { if (onCancel) onCancel(); setConfirmState(prev => ({ ...prev, isOpen: false })); }
    });
  };

  const showAlert = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const grantClearance = (userId) => {
    const newGrants = { ...clearanceGrants, [userId]: Date.now() };
    setClearanceGrants(newGrants);
    localStorage.setItem('biztrack_clearance', JSON.stringify(newGrants));
  };

  const revokeClearance = (userId) => {
    const newGrants = { ...clearanceGrants };
    delete newGrants[userId];
    setClearanceGrants(newGrants);
    localStorage.setItem('biztrack_clearance', JSON.stringify(newGrants));
  };

  const resetUserProtocol = (userId, newPassword) => {
    const allUsers = load('biztrack_users', 'user', DEFAULT_USERS);
    const updated = allUsers.map(u => u.id === userId ? { ...u, password: newPassword } : u);
    localStorage.setItem('biztrack_users', JSON.stringify(updated));
    setUsers(updated);
  };

  const processSmartTransaction = (saleRecord) => {
    const { amount, paid, client, product_id, quantity, useCredit } = saleRecord;
    const actualAmount = parseFloat(amount) || 0;
    const actualPaid = parseFloat(paid) || 0;
    const clientName = (client || '').trim();
    const searchName = clientName.toLowerCase();

    // 1. Register the sale
    const createdSale = addRecord({
      ...saleRecord,
      client: clientName,
      record_type: 'sale',
      date: saleRecord.date || new Date().toISOString(),
      operator: currentOperator,
      shiftId: shiftStart
    });

    // 2. Decrement stock quantity
    const product = products.find(p => p.id === product_id || p.product_id === product_id);
    if (product) {
      updateRecord({
        ...product,
        quantity: Math.max(0, (product.quantity || 0) - (parseInt(quantity) || 0))
      });
    }

    // 3. Handle Credit Deduction (Wait Credits)
    if (useCredit && searchName) {
      const available = getClientWaitBalance(clientName, saleRecord.phone);
      let remainingToDeduct = Math.min(available, actualAmount);
      
      if (remainingToDeduct > 0) {
        const clientCredits = waitCredits
          .filter(w => (w.client || '').trim().toLowerCase() === searchName 
                    && (w.phone || 'none').trim() === (saleRecord.phone || 'none').trim()
                    && (parseFloat(w.balance) || 0) > 0)
          .sort((a,b) => new Date(a.date) - new Date(b.date));

        for (const wc of clientCredits) {
          if (remainingToDeduct <= 0) break;
          const bal = parseFloat(wc.balance) || 0;
          const deduct = Math.min(bal, remainingToDeduct);
          remainingToDeduct -= deduct;
          updateRecord({ ...wc, balance: bal - deduct, status: bal - deduct <= 0 ? 'used' : 'active' });
        }
      }
    }

    // 4. Overpayment Reconcilliation: If paid more than needed, clear OLD debts first
    const extra = actualPaid - actualAmount;
    if (extra > 0 && searchName) {
      let remainingProfit = extra;

      // Find unpaid sales to clear
      const unpaidSales = sales
        .filter(s => (s.client || '').trim().toLowerCase() === searchName 
                  && (s.phone || 'none').trim() === (saleRecord.phone || 'none').trim()
                  && (parseFloat(s.amount) || 0) > (parseFloat(s.paid) || 0))
        .sort((a,b) => new Date(a.date) - new Date(b.date));
      
      for (const s of unpaidSales) {
        if (remainingProfit <= 0) break;
        const debt = (parseFloat(s.amount) || 0) - (parseFloat(s.paid) || 0);
        const payment = Math.min(debt, remainingProfit);
        remainingProfit -= payment;
        updateRecord({ ...s, paid: (parseFloat(s.paid) || 0) + payment, status: (parseFloat(s.paid)||0) + payment >= (parseFloat(s.amount)||0) ? 'paid' : 'partial' });
      }

      // If still extra after clearing sales, save as credit
      if (remainingProfit > 0) {
        addRecord({
          record_type: 'wait_credit',
          client: clientName,
          phone: saleRecord.phone || 'none',
          amount: remainingProfit,
          balance: remainingProfit,
          status: 'active',
          date: new Date().toISOString(),
          note: `Auto-Credit (Balance from ${saleRecord.name || 'Sale'})`
        });
      }
    }

    return createdSale;
  };

  const settleClientDebt = (clientName, phone, amount, method, operator, excludeIds = []) => {
    const payment = parseFloat(amount) || 0;
    const searchName = (clientName || '').trim().toLowerCase();
    const searchPhone = (phone || 'none').trim();

    if (payment <= 0 || !searchName) return;

    // 1. Find unpaid sales for this client (FIFO)
    const unpaidSales = sales
      .filter(s => (s.client || '').trim().toLowerCase() === searchName 
                && (s.phone || 'none').trim() === searchPhone
                && (parseFloat(s.amount) || 0) > (parseFloat(s.paid) || 0)
                && !excludeIds.includes(s.id))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let remainingPayment = payment;

    for (const s of unpaidSales) {
      if (remainingPayment <= 0) break;
      const debt = (parseFloat(s.amount) || 0) - (parseFloat(s.paid) || 0);
      const pay = Math.min(debt, remainingPayment);
      remainingPayment -= pay;
      
      updateRecord({ 
        ...s, 
        paid: (parseFloat(s.paid) || 0) + pay, 
        status: (parseFloat(s.paid) || 0) + pay >= (parseFloat(s.amount) || 0) ? 'paid' : 'partial' 
      });
    }

    // 2. If surplus remains, add as Wait Credit
    if (remainingPayment > 0) {
      addRecord({
        record_type: 'wait_credit',
        client: clientName,
        phone: phone,
        amount: remainingPayment,
        balance: remainingPayment,
        status: 'active',
        date: new Date().toISOString(),
        note: `Surplus from Debt Settlement (${method})`
      });
    }

    // 3. Record the payment in the ledger
    const ledgerEntry = {
      record_type: 'ledger_entry',
      type: 'revenue',
      name: `Debt Payment — ${clientName}`,
      amount: payment,
      paymentMethod: method,
      operator: operator || currentOperator,
      shiftId: shiftStart,
      date: new Date().toISOString(),
      note: `Settlement of outstanding client liability.`
    };
    
    return addRecord(ledgerEntry);
  };


  return (
    <StoreContext.Provider value={{
      getProducts, getSales, getExpenses, getUsers, getLedgerManual, getWaitCredits, getCategories, getClientWaitBalance, getClientDebtBalance, getClientGlobalBalance, getClientTrustScore, getAssetManagementData, getReportArchive,
      addRecord, updateRecord, deleteRecord, processSmartTransaction, settleClientDebt, generateAndArchiveFullReport,
      formatCurrency, formatDate, getSystemStatus, generateDailySummary, calculateTradingRatio,
      exportData, exportPersonalData, importData, clearAllData,
      confirmState, showConfirm,
      notification, showAlert,
      clearanceGrants, grantClearance, revokeClearance, resetUserProtocol,
      currency, setCurrency,
      currentOperator, setCurrentOperator,
      shiftStart, setShiftStart,
      showQRModal, setShowQRModal,
      isShiftEndModalOpen, setIsShiftEndModalOpen,
      getLosses, getReconciliations, getShifts, getShiftTransactions,
      API_URL
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
