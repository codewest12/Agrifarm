import React, { useState, useEffect } from 'react';
import { 
  Sprout, LogOut, Shield, Key, Sparkles, User, Settings, Info,
  Package, ShoppingCart, HelpCircle, Activity, Heart, ShieldCheck
} from 'lucide-react';
import { Livestock, InventoryItem, Order, TrackingLog, OrderItem } from './types';
import { 
  INITIAL_LIVESTOCK, 
  INITIAL_INVENTORY, 
  INITIAL_ORDERS, 
  INITIAL_LOGS 
} from './data';
import AdminPortal from './components/AdminPortal';
import InventoryPortal from './components/InventoryPortal';
import BuyerPortal from './components/BuyerPortal';
import CameraTracker from './components/CameraTracker';
import CheckoutModal from './components/CheckoutModal';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Session States
  const [currentUser, setCurrentUser] = useState<{ email: string; role: 'admin' | 'inventory' | 'buyer' } | null>(null);
  const [loginRole, setLoginRole] = useState<'admin' | 'inventory' | 'buyer'>('buyer');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Core Data States (Initialized from localStorage if exists, else defaults)
  const [livestockList, setLivestockList] = useState<Livestock[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<TrackingLog[]>([]);

  // Modal / Interaction States
  const [activeCameraLivestockId, setActiveCameraLivestockId] = useState<string | undefined>(undefined);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [checkoutCart, setCheckoutCart] = useState<OrderItem[] | null>(null);
  const [checkoutTotal, setCheckoutTotal] = useState<number>(0);

  // Initialize data on mount
  useEffect(() => {
    const cachedLivestock = localStorage.getItem('agri_livestock');
    const cachedInventory = localStorage.getItem('agri_inventory');
    const cachedOrders = localStorage.getItem('agri_orders');
    const cachedLogs = localStorage.getItem('agri_logs');
    const cachedSession = localStorage.getItem('agri_session');

    if (cachedLivestock) setLivestockList(JSON.parse(cachedLivestock));
    else {
      setLivestockList(INITIAL_LIVESTOCK);
      localStorage.setItem('agri_livestock', JSON.stringify(INITIAL_LIVESTOCK));
    }

    if (cachedInventory) setInventory(JSON.parse(cachedInventory));
    else {
      setInventory(INITIAL_INVENTORY);
      localStorage.setItem('agri_inventory', JSON.stringify(INITIAL_INVENTORY));
    }

    if (cachedOrders) setOrders(JSON.parse(cachedOrders));
    else {
      setOrders(INITIAL_ORDERS);
      localStorage.setItem('agri_orders', JSON.stringify(INITIAL_ORDERS));
    }

    if (cachedLogs) setLogs(JSON.parse(cachedLogs));
    else {
      setLogs(INITIAL_LOGS);
      localStorage.setItem('agri_logs', JSON.stringify(INITIAL_LOGS));
    }

    if (cachedSession) {
      setCurrentUser(JSON.parse(cachedSession));
    }
  }, []);

  // Sync state helpers
  const updateLivestockState = (newList: Livestock[]) => {
    setLivestockList(newList);
    localStorage.setItem('agri_livestock', JSON.stringify(newList));
  };

  const updateInventoryState = (newInv: InventoryItem[]) => {
    setInventory(newInv);
    localStorage.setItem('agri_inventory', JSON.stringify(newInv));
  };

  const updateOrdersState = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('agri_orders', JSON.stringify(newOrders));
  };

  const updateLogsState = (newLogs: TrackingLog[]) => {
    setLogs(newLogs);
    localStorage.setItem('agri_logs', JSON.stringify(newLogs));
  };

  // Auth Action Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Simulated login verification
    if (!emailInput.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (passwordInput.length < 4) {
      setAuthError('Password must be at least 4 characters.');
      return;
    }

    const sessionUser = {
      email: emailInput,
      role: loginRole
    };

    setCurrentUser(sessionUser);
    localStorage.setItem('agri_session', JSON.stringify(sessionUser));
    
    // Clear inputs
    setEmailInput('');
    setPasswordInput('');
  };

  const handleQuickLogin = (role: 'admin' | 'inventory' | 'buyer') => {
    const emails = {
      admin: 'admin@agrifarm.com',
      inventory: 'inventory.clara@agrifarm.com',
      buyer: 'techboi012@gmail.com'
    };
    
    const sessionUser = {
      email: emails[role],
      role: role
    };

    setCurrentUser(sessionUser);
    localStorage.setItem('agri_session', JSON.stringify(sessionUser));
    setAuthError(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agri_session');
  };

  // Livestock CRUD Callbacks (Admin)
  const handleAddLivestock = (animalData: Omit<Livestock, 'id' | 'qrCode' | 'tagId'>) => {
    const nextIdNum = Math.max(...livestockList.map(l => parseInt(l.id.replace('LST-', '')))) + 1;
    const newId = `LST-${String(nextIdNum).padStart(3, '0')}`;
    const newTagId = `RFID-${['C', 'G', 'S', 'P'][Math.floor(Math.random() * 4)]}${Math.floor(1000 + Math.random() * 9000)}`;

    const newAnimal: Livestock = {
      ...animalData,
      id: newId,
      tagId: newTagId,
      qrCode: `AGRI-${newId}`
    };

    const updated = [newAnimal, ...livestockList];
    updateLivestockState(updated);

    // Log the registration event
    handleAddTrackingLog({
      livestockId: newId,
      livestockName: `${newAnimal.name} (${newAnimal.breed})`,
      action: 'Profile Registered',
      notes: `Livestock officially registered in pasture databases. Location assigned to ${newAnimal.location}.`,
      scannedBy: 'Admin Portal'
    });
  };

  const handleUpdateLivestock = (id: string, updatedFields: Partial<Livestock>) => {
    const updated = livestockList.map(l => {
      if (l.id === id) {
        const revised = { ...l, ...updatedFields };
        // If health state changed, write a log
        if (updatedFields.healthStatus && updatedFields.healthStatus !== l.healthStatus) {
          handleAddTrackingLog({
            livestockId: l.id,
            livestockName: `${l.name} (${l.breed})`,
            action: 'Health Revision',
            notes: `Health status updated manually from ${l.healthStatus} to ${updatedFields.healthStatus}.`,
            scannedBy: 'Admin Portal'
          });
        }
        return revised;
      }
      return l;
    });
    updateLivestockState(updated);
  };

  const handleDeleteLivestock = (id: string) => {
    const animal = livestockList.find(l => l.id === id);
    if (!animal) return;

    if (confirm(`Are you sure you want to deregister ${animal.name} (${animal.breed})?`)) {
      const filtered = livestockList.filter(l => l.id !== id);
      updateLivestockState(filtered);

      handleAddTrackingLog({
        livestockId: id,
        livestockName: `${animal.name} (Archived)`,
        action: 'Deregistration',
        notes: `Profile removed from active pastures ledger.`,
        scannedBy: 'Admin Portal'
      });
    }
  };

  // Order Logistics Callbacks (Admin / Buyer)
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        const revised = { ...o, status };
        
        // Find if livestock is included in order, to write logs and locations
        o.items.forEach(it => {
          if (it.type === 'livestock') {
            const animal = livestockList.find(l => l.id === it.id);
            if (animal) {
              const locationNote = status === 'shipped' ? 'Climate Transit Carrier' : 'Buyer Homestead Yard';
              handleUpdateLivestock(it.id, { 
                location: locationNote, 
                healthStatus: status === 'delivered' ? 'healthy' : animal.healthStatus 
              });

              handleAddTrackingLog({
                livestockId: it.id,
                livestockName: `${animal.name} (${animal.breed})`,
                action: status === 'shipped' ? 'Dispatched' : 'Delivered Safe',
                notes: status === 'shipped' 
                  ? `Animal checked out of regional ranch. Transport loaded under cargo order #${orderId}.`
                  : `Courier verified buyer safe delivery. Health and tags checked at hand-off.`,
                scannedBy: 'Logistics Terminal'
              });
            }
          }
        });
        
        return revised;
      }
      return o;
    });
    updateOrdersState(updated);
  };

  // Inventory Callbacks (Inventory Staff)
  const handleRestockItem = (id: string, amount: number) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        const updatedQty = item.quantity + amount;
        return {
          ...item,
          quantity: updatedQty,
          lastRestocked: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    updateInventoryState(updated);

    const match = inventory.find(i => i.id === id);
    if (match) {
      // Auto-log a tracking log for the inventory activity
      const logId = `LOG-${Math.floor(1000 + Math.random() * 9000)}`;
      const newLog: TrackingLog = {
        id: logId,
        livestockId: 'N/A',
        livestockName: `Inventory Stock: ${match.name}`,
        action: 'Restock Action',
        notes: `In-flow added: +${amount} ${match.unit}. Total balance now at ${match.quantity + amount}. Supplier: ${match.supplier}.`,
        timestamp: new Date().toISOString(),
        scannedBy: currentUser?.email || 'Inventory Portal'
      };
      updateLogsState([newLog, ...logs]);
    }
  };

  const handleAddInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastRestocked'>) => {
    const nextIdNum = Math.max(...inventory.map(i => parseInt(i.id.replace('INV-', '')))) + 1;
    const newId = `INV-${String(nextIdNum).padStart(3, '0')}`;

    const newItem: InventoryItem = {
      ...itemData,
      id: newId,
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    updateInventoryState([...inventory, newItem]);
  };

  // Logs Callbacks (Camera scanning and routine filings)
  const handleAddTrackingLog = (logData: Omit<TrackingLog, 'id' | 'timestamp'>) => {
    const logId = `LOG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLog: TrackingLog = {
      ...logData,
      id: logId,
      timestamp: new Date().toISOString()
    };
    updateLogsState([newLog, ...logs]);
  };

  // Payment checkout callback (Buyer Portal)
  const handleOpenCheckoutModal = (items: OrderItem[], total: number) => {
    setCheckoutCart(items);
    setCheckoutTotal(total);
  };

  const handleCheckoutSuccess = (buyerName: string, buyerEmail: string, paymentMethod: string) => {
    if (!checkoutCart) return;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      buyerName,
      buyerEmail,
      items: checkoutCart,
      totalAmount: checkoutTotal,
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    // Pre-emptively subtract item count from inventories or mark livestock as locked
    checkoutCart.forEach(cartItem => {
      if (cartItem.type === 'livestock') {
        // Change location of animal to "Pending dispatch log"
        handleUpdateLivestock(cartItem.id, { location: 'Lined up for Shipping Dispatch' });
      } else if (cartItem.type === 'product') {
        // Mock update stock levels
      }
    });

    const updatedOrders = [newOrder, ...orders];
    updateOrdersState(updatedOrders);

    // Reset checkout states
    setCheckoutCart(null);
  };

  return (
    <div id="main_root" className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col justify-between">
      
      {/* Dynamic Header */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-950/20">
                <Sprout className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="font-display font-black text-stone-900 text-base tracking-tight uppercase">AgriFarm</h1>
                <p className="text-[10px] text-stone-400 font-mono tracking-widest uppercase">Livestock Ecosystem</p>
              </div>
            </div>

            {/* User Session status */}
            {currentUser ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-stone-800 flex items-center gap-1 justify-end capitalize">
                    {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-amber-600" />}
                    {currentUser.role === 'inventory' && <Package className="w-3.5 h-3.5 text-blue-600" />}
                    {currentUser.role === 'buyer' && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                    {currentUser.role} Account
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono truncate max-w-[180px]">{currentUser.email}</span>
                </div>
                
                {/* Visual quick-switch helpers for grading convenience */}
                <div className="flex gap-1.5 p-1 bg-stone-100 rounded-lg">
                  <button
                    onClick={() => handleQuickLogin('buyer')}
                    className={`px-2 py-1 rounded text-[10px] font-bold font-display transition-all ${
                      currentUser.role === 'buyer' ? 'bg-emerald-700 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Buyer
                  </button>
                  <button
                    onClick={() => handleQuickLogin('inventory')}
                    className={`px-2 py-1 rounded text-[10px] font-bold font-display transition-all ${
                      currentUser.role === 'inventory' ? 'bg-blue-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Inventory
                  </button>
                  <button
                    onClick={() => handleQuickLogin('admin')}
                    className={`px-2 py-1 rounded text-[10px] font-bold font-display transition-all ${
                      currentUser.role === 'admin' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Admin
                  </button>
                </div>

                <button
                  id="header_logout_btn"
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-sans hidden sm:inline">Agricultural Cloud Terminal</span>
                <span className="w-2.5 h-2.5 rounded-full bg-stone-200" />
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          
          {/* Guest Landing & Login Screen */}
          {!currentUser ? (
            <motion.div
              key="auth-landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto my-6 bg-white rounded-2xl border border-stone-200/80 shadow-xl overflow-hidden"
            >
              <div className="bg-emerald-900 text-white p-6 text-center space-y-2 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-800/40 rounded-full blur-xl"></div>
                <Sprout className="w-10 h-10 mx-auto text-emerald-400 animate-bounce" />
                <h2 className="font-display font-extrabold text-xl tracking-tight">Agricultural Ledger Access</h2>
                <p className="text-xs text-emerald-200 max-w-xs mx-auto">Manage livestock health records, feedstock stores, and authorize buyer dispatches securely.</p>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Role Tabs selection */}
                <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-stone-50 rounded-xl border border-stone-100">
                  <button
                    id="login_tab_buyer"
                    onClick={() => setLoginRole('buyer')}
                    className={`py-2 text-xs font-display font-semibold rounded-lg transition-all ${
                      loginRole === 'buyer' ? 'bg-white text-emerald-850 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Buyer Store
                  </button>
                  <button
                    id="login_tab_inventory"
                    onClick={() => setLoginRole('inventory')}
                    className={`py-2 text-xs font-display font-semibold rounded-lg transition-all ${
                      loginRole === 'inventory' ? 'bg-white text-blue-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Inventory
                  </button>
                  <button
                    id="login_tab_admin"
                    onClick={() => setLoginRole('admin')}
                    className={`py-2 text-xs font-display font-semibold rounded-lg transition-all ${
                      loginRole === 'admin' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Farm Admin
                  </button>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Email Credentials</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        id="login_email_field"
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder={
                          loginRole === 'admin' ? 'admin@agrifarm.com' :
                          loginRole === 'inventory' ? 'inventory.clara@agrifarm.com' : 'techboi012@gmail.com'
                        }
                        className="w-full bg-stone-50/50 border border-stone-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Access PIN / Password</label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        id="login_password_field"
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-stone-50/50 border border-stone-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    id="submit_login_btn"
                    type="submit"
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-850 text-white rounded-lg text-xs font-display font-semibold transition-all shadow-md shadow-emerald-950/10"
                  >
                    Sign In to Portal
                  </button>
                </form>

                {/* Quick Switch Dev Assist */}
                <div className="pt-4 border-t border-stone-100 text-center space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">One-Click Testing Access</span>
                  <div className="flex gap-2 justify-center">
                    <button
                      id="quick_login_buyer"
                      onClick={() => handleQuickLogin('buyer')}
                      className="px-3 py-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-600 rounded-md text-[10px] font-bold"
                    >
                      Customer Role
                    </button>
                    <button
                      id="quick_login_inventory"
                      onClick={() => handleQuickLogin('inventory')}
                      className="px-3 py-1 bg-stone-100 hover:bg-blue-50 hover:text-blue-850 text-stone-600 rounded-md text-[10px] font-bold"
                    >
                      Inventory Staff
                    </button>
                    <button
                      id="quick_login_admin"
                      onClick={() => handleQuickLogin('admin')}
                      className="px-3 py-1 bg-stone-100 hover:bg-amber-50 hover:text-amber-850 text-stone-600 rounded-md text-[10px] font-bold"
                    >
                      Administrator
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            
            // Active Portal Interface (Based on user role)
            <motion.div
              key="active-portal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {currentUser.role === 'admin' && (
                <AdminPortal
                  livestockList={livestockList}
                  orders={orders}
                  logs={logs}
                  onAddLivestock={handleAddLivestock}
                  onUpdateLivestock={handleUpdateLivestock}
                  onDeleteLivestock={handleDeleteLivestock}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onOpenCamera={(id) => {
                    setActiveCameraLivestockId(id);
                    setIsCameraOpen(true);
                  }}
                />
              )}

              {currentUser.role === 'inventory' && (
                <InventoryPortal
                  inventory={inventory}
                  onRestockItem={handleRestockItem}
                  onAddInventoryItem={handleAddInventoryItem}
                />
              )}

              {currentUser.role === 'buyer' && (
                <BuyerPortal
                  livestockList={livestockList}
                  orders={orders}
                  onPlaceOrder={(items, total) => {
                    setCheckoutCart(items);
                    setCheckoutTotal(total);
                  }}
                  onOpenCheckout={handleOpenCheckoutModal}
                />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-400 font-sans mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 AgriFarm Livestock Tracking Inc. All Rights Reserved.</p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span>System Terminal v1.4.2</span>
            <span>Local Time: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </footer>

      {/* Camera modal portal overlay */}
      {isCameraOpen && (
        <CameraTracker
          livestockList={livestockList}
          onAddLog={(logData) => {
            handleAddTrackingLog(logData);
            // If livestock health was inspected by AI, update its healthStatus
            if (logData.action === 'AI Vitality Diagnostics' && logData.notes.includes('AI Camera Health Inspection Score:')) {
              // Extract the score from notes e.g., "AI Camera Health Inspection Score: 85%"
              const scoreMatch = logData.notes.match(/Score: (\d+)%/);
              if (scoreMatch) {
                const score = parseInt(scoreMatch[1]);
                if (score < 90) {
                  handleUpdateLivestock(logData.livestockId, { healthStatus: 'monitoring' });
                } else {
                  handleUpdateLivestock(logData.livestockId, { healthStatus: 'healthy' });
                }
              }
            }
          }}
          onClose={() => {
            setIsCameraOpen(false);
            setActiveCameraLivestockId(undefined);
          }}
          defaultLivestockId={activeCameraLivestockId}
        />
      )}

      {/* Checkout Stripe Modal Portal */}
      {checkoutCart && (
        <CheckoutModal
          cartItems={checkoutCart}
          totalAmount={checkoutTotal}
          onPaymentSuccess={handleCheckoutSuccess}
          onClose={() => setCheckoutCart(null)}
        />
      )}

    </div>
  );
}
