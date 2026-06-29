import React, { useState } from 'react';
import { 
  ShieldAlert, RefreshCw, Layers, ArrowUpRight, Search, 
  ChevronRight, Phone, Mail, MapPin, Plus, Save
} from 'lucide-react';
import { InventoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryPortalProps {
  inventory: InventoryItem[];
  onRestockItem: (id: string, amount: number) => void;
  onAddInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => void;
}

export default function InventoryPortal({ inventory, onRestockItem, onAddInventoryItem }: InventoryPortalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [restockAmounts, setRestockAmounts] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  // New inventory form state
  const [newItemName, setNewItemName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('feed');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Bags');
  const [minThreshold, setMinThreshold] = useState('');
  const [supplier, setSupplier] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');

  // Find items requiring attention (low stock)
  const lowStockItems = inventory.filter(item => item.quantity <= item.minThreshold);

  const handleRestockSubmit = (id: string) => {
    const amountStr = restockAmounts[id];
    if (!amountStr) return;
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    onRestockItem(id, amount);
    setRestockAmounts(prev => ({ ...prev, [id]: '' }));
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !quantity || !minThreshold || !supplier || !pricePerUnit) return;

    onAddInventoryItem({
      name: newItemName,
      category,
      quantity: parseInt(quantity),
      unit,
      minThreshold: parseInt(minThreshold),
      supplier,
      pricePerUnit: parseFloat(pricePerUnit)
    });

    // Reset Form
    setNewItemName('');
    setQuantity('');
    setMinThreshold('');
    setSupplier('');
    setPricePerUnit('');
    setShowAddForm(false);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Supplier profiles
  const SUPPLIERS = [
    { name: 'GreenValley Forage Co.', contact: 'support@greenvalleyforage.com', phone: '(270) 555-0144', address: 'Bowling Green, KY' },
    { name: 'EcoFeed Agricultural Ltd.', contact: 'orders@ecofeedag.com', phone: '(606) 555-0199', address: 'Somerset, KY' },
    { name: 'BioCare Vet Supplies', contact: 'dispatch@biocarevet.com', phone: '(859) 555-0112', address: 'Lexington, KY' },
    { name: 'HygieneAgri Solutions', contact: 'clean@hygieneagri.com', phone: '(502) 555-0133', address: 'Louisville, KY' },
    { name: 'TraceTech Ear-tags Inc.', contact: 'tags@tracetech.com', phone: '(800) 555-0165', address: 'Nashville, TN' }
  ];

  return (
    <div id="inventory_dashboard" className="space-y-6">
      
      {/* Low Stock Advisory Banner */}
      {lowStockItems.length > 0 && (
        <div id="low_stock_advisory" className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-bold text-stone-900 text-sm">Action Needed: Low Stock Alerts</h4>
              <p className="text-xs text-stone-600 mt-0.5">
                {lowStockItems.length} essential farm resource{lowStockItems.length > 1 ? 's are' : ' is'} below minimum safety thresholds. Place restocking orders immediately.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockItems.map(item => (
                  <span key={item.id} className="bg-amber-100 text-amber-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.name}: {item.quantity} {item.unit} left
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Inventory Stock and Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Inventory Records list (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div>
                <h3 className="font-display font-bold text-stone-950 text-base">Silo & Veterinary Supplies</h3>
                <p className="text-xs text-stone-500">Track raw feeds, vaccines, and tag assets</p>
              </div>
              <button
                id="toggle_add_inventory_form_btn"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-850 text-white rounded-lg text-xs font-display font-semibold flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Add Stock Item
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  id="inventory_search_field"
                  type="text"
                  placeholder="Search materials or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Category:</span>
                <select
                  id="filter_inventory_category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-700 focus:outline-none"
                >
                  <option value="all">All Material</option>
                  <option value="feed">Animal Feed</option>
                  <option value="medical">Veterinary / Medicine</option>
                  <option value="equipment">Farming Hardware</option>
                  <option value="bedding">Pen Bedding</option>
                </select>
              </div>
            </div>

            {/* Add Material Stock Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  id="add_inventory_form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddNewItem}
                  className="bg-stone-50 rounded-xl p-5 border border-stone-200/80 space-y-4 overflow-hidden"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                    <h4 className="font-display font-semibold text-stone-900 text-xs uppercase tracking-wide">Register New Supply Ledger</h4>
                    <button type="button" onClick={() => setShowAddForm(false)} className="text-stone-400 hover:text-stone-600 text-xs font-mono font-bold">Close</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Material Name / Vaccine</label>
                      <input
                        id="new_inv_name"
                        type="text"
                        required
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="e.g. Premium Timothy Grass Hay"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Category</label>
                      <select
                        id="new_inv_category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as InventoryItem['category'])}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      >
                        <option value="feed">Feed</option>
                        <option value="medical">Medical / Health</option>
                        <option value="equipment">Equipment / Tags</option>
                        <option value="bedding">Pen Bedding</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Initial Stock Level</label>
                      <input
                        id="new_inv_quantity"
                        type="number"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Measurement Unit</label>
                      <input
                        id="new_inv_unit"
                        type="text"
                        required
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="e.g. Bales or Vials"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Alert Threshold</label>
                      <input
                        id="new_inv_threshold"
                        type="number"
                        required
                        value={minThreshold}
                        onChange={(e) => setMinThreshold(e.target.value)}
                        placeholder="e.g. 15"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Wholesale Cost per Unit ($)</label>
                      <input
                        id="new_inv_price"
                        type="number"
                        step="0.01"
                        required
                        value={pricePerUnit}
                        onChange={(e) => setPricePerUnit(e.target.value)}
                        placeholder="e.g. 15.50"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Fulfillment Supplier</label>
                      <select
                        id="new_inv_supplier"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                        required
                      >
                        <option value="">Select Supplier Contact</option>
                        {SUPPLIERS.map((s, idx) => (
                          <option key={idx} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                    <button
                      id="save_new_inventory_btn"
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-850 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Stock Registry
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Inventory table */}
            <div className="overflow-x-auto">
              <table id="inventory_ledger_table" className="w-full text-left text-xs text-stone-600">
                <thead>
                  <tr className="bg-stone-50 border-y border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    <th className="p-3">Stock ID</th>
                    <th className="p-3">Material Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Current Quantity</th>
                    <th className="p-3">Last Restocked</th>
                    <th className="p-3">Supplier Source</th>
                    <th className="p-3 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredInventory.map((item) => {
                    const isLow = item.quantity <= item.minThreshold;
                    return (
                      <tr key={item.id} id={`inv_row_${item.id}`} className={`hover:bg-stone-50/50 transition-colors ${isLow ? 'bg-amber-50/20' : ''}`}>
                        <td className="p-3 font-mono text-[10px] text-stone-500">{item.id}</td>
                        <td className="p-3">
                          <div className="font-display font-semibold text-stone-900">{item.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">${item.pricePerUnit.toFixed(2)} per {item.unit}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-stone-100 font-sans capitalize text-stone-600">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="font-mono font-bold text-sm text-stone-900">
                            {item.quantity}
                          </div>
                          <div className="text-[9px] text-stone-400 font-sans">
                            {item.unit} (Min: {item.minThreshold})
                          </div>
                          {isLow && (
                            <span className="inline-block mt-1 px-1.5 py-0.2 bg-amber-100 text-amber-900 font-mono font-bold text-[8px] rounded-sm">
                              LOW STOCK
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-stone-500">{item.lastRestocked}</td>
                        <td className="p-3 text-stone-500 font-sans max-w-[130px] truncate" title={item.supplier}>
                          {item.supplier}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end items-center gap-1">
                            <input
                              id={`restock_amount_input_${item.id}`}
                              type="number"
                              min="1"
                              placeholder="+Qty"
                              value={restockAmounts[item.id] || ''}
                              onChange={(e) => setRestockAmounts({ ...restockAmounts, [item.id]: e.target.value })}
                              className="w-12 bg-white border border-stone-200 rounded px-1.5 py-1 text-center font-mono font-bold text-xs"
                            />
                            <button
                              id={`restock_confirm_btn_${item.id}`}
                              onClick={() => handleRestockSubmit(item.id)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200"
                              title="Restock Item"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right: Suppliers Directory (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="font-display font-bold text-stone-950 text-base">Agricultural Supplier Matrix</h3>
              <p className="text-xs text-stone-500">Contact regional supply depots for express quotes</p>
            </div>

            <div className="space-y-4">
              {SUPPLIERS.map((sup, idx) => (
                <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-100 space-y-3 hover:border-stone-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <h4 className="font-display font-semibold text-stone-900 text-xs">{sup.name}</h4>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </div>

                  <div className="space-y-1.5 text-stone-500 text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{sup.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate">{sup.contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{sup.address}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
