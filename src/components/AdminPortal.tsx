import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Camera, ShieldAlert, CheckCircle, 
  TrendingUp, Users, Calendar, MapPin, ClipboardList, Activity,
  Truck, DollarSign, Tag, RefreshCw, BarChart2
} from 'lucide-react';
import { Livestock, Order, TrackingLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPortalProps {
  livestockList: Livestock[];
  orders: Order[];
  logs: TrackingLog[];
  onAddLivestock: (animal: Omit<Livestock, 'id' | 'qrCode' | 'tagId'>) => void;
  onUpdateLivestock: (id: string, updated: Partial<Livestock>) => void;
  onDeleteLivestock: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onOpenCamera: (livestockId?: string) => void;
}

export default function AdminPortal({
  livestockList,
  orders,
  logs,
  onAddLivestock,
  onUpdateLivestock,
  onDeleteLivestock,
  onUpdateOrderStatus,
  onOpenCamera
}: AdminPortalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterHealth, setFilterHealth] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New livestock form state
  const [name, setName] = useState('');
  const [type, setType] = useState<Livestock['type']>('cattle');
  const [breed, setBreed] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [healthStatus, setHealthStatus] = useState<Livestock['healthStatus']>('healthy');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Editing livestock state
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !breed || !ageMonths || !weightKg || !location || !price) return;

    const parsedAge = parseInt(ageMonths);
    const parsedWeight = parseFloat(weightKg);
    const parsedPrice = parseFloat(price);

    // Fallback animal images if left empty
    const animalDefaults: Record<Livestock['type'], string> = {
      cattle: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80',
      sheep: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&auto=format&fit=crop&q=80',
      goat: 'https://images.unsplash.com/photo-1524413151693-e52d130d31fd?w=600&auto=format&fit=crop&q=80',
      pig: 'https://images.unsplash.com/photo-1597528147509-3a30c25006b0?w=600&auto=format&fit=crop&q=80',
      poultry: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80'
    };

    onAddLivestock({
      name,
      type,
      breed,
      ageMonths: parsedAge,
      weightKg: parsedWeight,
      gender,
      healthStatus,
      imageUrl: imageUrl || animalDefaults[type],
      price: parsedPrice,
      lastCheckup: new Date().toISOString().split('T')[0],
      location
    });

    // Reset Form
    setName('');
    setBreed('');
    setAgeMonths('');
    setWeightKg('');
    setLocation('');
    setPrice('');
    setImageUrl('');
    setShowAddForm(false);
  };

  const startEdit = (animal: Livestock) => {
    setEditingId(animal.id);
  };

  const handleSaveEdit = (animal: Livestock) => {
    setEditingId(null);
  };

  // Filtered livestock
  const filteredLivestock = livestockList.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          animal.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || animal.type === filterType;
    const matchesHealth = filterHealth === 'all' || animal.healthStatus === filterHealth;
    return matchesSearch && matchesType && matchesHealth;
  });

  // Calculate high level dashboard metrics
  const totalAnimals = livestockList.length;
  const healthyCount = livestockList.filter(l => l.healthStatus === 'healthy').length;
  const healthRatio = totalAnimals > 0 ? Math.round((healthyCount / totalAnimals) * 100) : 100;
  
  const totalOrderRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending').length;

  return (
    <div id="admin_dashboard" className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-stone-400 font-sans">Active Managed Livestock</p>
            <h4 className="font-display font-extrabold text-2xl text-stone-900">{totalAnimals} Animals</h4>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-stone-400 font-sans">Herd Health Ratio</p>
            <h4 className="font-display font-extrabold text-2xl text-stone-900">{healthRatio}% Good</h4>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-stone-400 font-sans">Clearing Order Revenue</p>
            <h4 className="font-display font-extrabold text-2xl text-emerald-800">${totalOrderRevenue.toFixed(2)}</h4>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-stone-400 font-sans">Awaiting Delivery</p>
            <h4 className="font-display font-extrabold text-2xl text-amber-800">{pendingOrders} Shipments</h4>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Management & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section - Livestock Ledger (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-6 space-y-4">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div>
                <h3 className="font-display font-bold text-stone-950 text-base">Livestock Records Ledger</h3>
                <p className="text-xs text-stone-500">Track and manage physical pasture profiles</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  id="open_scann_global_btn"
                  onClick={() => onOpenCamera()}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-xs font-display font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  Launch Scanner
                </button>
                <button
                  id="toggle_add_livestock_form_btn"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-850 text-white rounded-lg text-xs font-display font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Animal
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  id="admin_livestock_search"
                  type="text"
                  placeholder="Search by ID, name, or breed..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans">Type:</span>
                <select
                  id="filter_animal_type_select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-700 focus:outline-none"
                >
                  <option value="all">All Animals</option>
                  <option value="cattle">Cattle</option>
                  <option value="sheep">Sheep</option>
                  <option value="goat">Goat</option>
                  <option value="pig">Pigs</option>
                  <option value="poultry">Poultry</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans">Health:</span>
                <select
                  id="filter_health_status_select"
                  value={filterHealth}
                  onChange={(e) => setFilterHealth(e.target.value)}
                  className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-700 focus:outline-none"
                >
                  <option value="all">All Health</option>
                  <option value="healthy">Healthy</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="treatment">Treatment</option>
                  <option value="quarantined">Quarantined</option>
                </select>
              </div>
            </div>

            {/* Registration Add form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  id="add_animal_form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
                  className="bg-stone-50 rounded-xl p-5 border border-stone-200/80 space-y-4 overflow-hidden"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                    <h4 className="font-display font-semibold text-stone-900 text-xs uppercase tracking-wide">Register New Livestock Profile</h4>
                    <button type="button" onClick={() => setShowAddForm(false)} className="text-stone-400 hover:text-stone-600 text-xs font-mono font-bold">Close</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Animal Name</label>
                      <input
                        id="animal_name_field"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Daisy"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Species Type</label>
                      <select
                        id="animal_type_field"
                        value={type}
                        onChange={(e) => setType(e.target.value as Livestock['type'])}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      >
                        <option value="cattle">Cattle</option>
                        <option value="sheep">Sheep</option>
                        <option value="goat">Goat</option>
                        <option value="pig">Pig</option>
                        <option value="poultry">Poultry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Breed</label>
                      <input
                        id="animal_breed_field"
                        type="text"
                        required
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                        placeholder="e.g. Boer Goat"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Age (Months)</label>
                      <input
                        id="animal_age_field"
                        type="number"
                        required
                        value={ageMonths}
                        onChange={(e) => setAgeMonths(e.target.value)}
                        placeholder="e.g. 24"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Weight (Kg)</label>
                      <input
                        id="animal_weight_field"
                        type="number"
                        step="0.1"
                        required
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        placeholder="e.g. 65"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Gender</label>
                      <select
                        id="animal_gender_field"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Pasture Location</label>
                      <input
                        id="animal_location_field"
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Field Barn B"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Purchase Valuation ($)</label>
                      <input
                        id="animal_price_field"
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 850"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Health Status</label>
                      <select
                        id="animal_health_field"
                        value={healthStatus}
                        onChange={(e) => setHealthStatus(e.target.value as Livestock['healthStatus'])}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      >
                        <option value="healthy">Healthy</option>
                        <option value="monitoring">Monitoring</option>
                        <option value="treatment">Treatment</option>
                        <option value="quarantined">Quarantined</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Profile Photo URL (Optional)</label>
                      <input
                        id="animal_photo_field"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                    <button
                      id="save_new_animal_btn"
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-850 text-white rounded-lg text-xs font-semibold"
                    >
                      Save New Animal
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Livestock Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredLivestock.length > 0 ? (
                filteredLivestock.map((animal) => {
                  const isEditing = editingId === animal.id;
                  return (
                    <div 
                      key={animal.id} 
                      id={`animal_card_${animal.id}`}
                      className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-stone-300 transition-all relative"
                    >
                      {/* Photo Header */}
                      <div className="h-40 relative bg-stone-100">
                        <img 
                          src={animal.imageUrl} 
                          alt={animal.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider text-white shadow-sm capitalize ${
                            animal.healthStatus === 'healthy' ? 'bg-emerald-600' :
                            animal.healthStatus === 'monitoring' ? 'bg-amber-600' :
                            animal.healthStatus === 'treatment' ? 'bg-orange-600' : 'bg-red-600'
                          }`}>
                            {animal.healthStatus}
                          </span>
                          <span className="bg-stone-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono font-medium text-white shadow-sm">
                            {animal.id}
                          </span>
                        </div>

                        <div className="absolute bottom-3 right-3 bg-stone-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold text-emerald-400">
                          ${animal.price}
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-display font-bold text-stone-900 text-sm">{animal.name}</h4>
                              <p className="text-xs text-stone-500 font-sans">{animal.breed}</p>
                            </div>
                            <span className="text-[11px] font-mono text-stone-400 border border-stone-200 px-1.5 py-0.5 rounded-md bg-stone-50">
                              {animal.tagId}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-sans">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span>{animal.ageMonths} mos old</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <BarChart2 className="w-3.5 h-3.5 text-stone-400" />
                              <span className="font-mono">{animal.weightKg} kg</span>
                            </div>
                            <div className="flex items-center gap-1.5 col-span-2">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              <span className="truncate">{animal.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Controls */}
                        <div className="flex justify-between items-center pt-3 border-t border-stone-100 gap-1.5">
                          <button
                            id={`camera_track_animal_${animal.id}`}
                            onClick={() => onOpenCamera(animal.id)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-3 h-3" />
                            Log Camera
                          </button>

                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <div className="flex gap-1">
                                <select
                                  id={`edit_health_${animal.id}`}
                                  value={animal.healthStatus}
                                  onChange={(e) => onUpdateLivestock(animal.id, { healthStatus: e.target.value as Livestock['healthStatus'] })}
                                  className="text-[10px] bg-stone-100 border border-stone-200 rounded px-1.5 py-1 focus:outline-none"
                                >
                                  <option value="healthy">Healthy</option>
                                  <option value="monitoring">Monitor</option>
                                  <option value="treatment">Treat</option>
                                  <option value="quarantined">Isolation</option>
                                </select>
                                <button
                                  id={`save_edit_health_${animal.id}`}
                                  onClick={() => handleSaveEdit(animal)}
                                  className="p-1 text-emerald-700 bg-emerald-50 rounded"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <button
                                id={`edit_health_btn_${animal.id}`}
                                onClick={() => startEdit(animal)}
                                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded transition-colors"
                                title="Update Status"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              id={`delete_animal_btn_${animal.id}`}
                              onClick={() => onDeleteLivestock(animal.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Deregister"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <p className="text-xs text-stone-400 font-sans">No livestock matches the search or filter query.</p>
                </div>
              )}
            </div>

          </div>

          {/* Orders Tracking Dashboard Panel */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-display font-bold text-stone-950 text-base">Trade & Shipping Queue</h3>
              <p className="text-xs text-stone-500">Coordinate buyer logistics & payment verifications</p>
            </div>

            <div className="overflow-x-auto">
              <table id="admin_orders_table" className="w-full text-left text-xs text-stone-600">
                <thead>
                  <tr className="bg-stone-50 border-y border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Livestock / Products</th>
                    <th className="p-3">Grand Total</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Fulfillment Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-stone-900">{order.id}</td>
                      <td className="p-3">
                        <p className="font-medium text-stone-800">{order.buyerName}</p>
                        <p className="text-[10px] text-stone-400">{order.buyerEmail}</p>
                      </td>
                      <td className="p-3 py-4 max-w-[200px]">
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-stone-500 truncate">
                          {order.items.map((it, idx) => (
                            <li key={idx} className="truncate">
                              {it.name} <span className="text-stone-400">(x{it.quantity})</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 font-mono font-medium text-stone-950">${order.totalAmount.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {order.status === 'processing' && (
                            <button
                              id={`dispatch_order_${order.id}`}
                              onClick={() => onUpdateOrderStatus(order.id, 'shipped')}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold"
                            >
                              Dispatch Order
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button
                              id={`deliver_order_${order.id}`}
                              onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold"
                            >
                              Log Delivered
                            </button>
                          )}
                          {order.status === 'delivered' && (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Checked Out
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Section - Timeline Logs & Bio Tracking (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-stone-900 rounded-2xl shadow-sm text-white p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-sm tracking-wide">Pasture Check-in Feed</h3>
              </div>
              <span className="text-[10px] font-mono text-stone-500 uppercase">Live Log feed</span>
            </div>

            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} id={`timeline_log_${log.id}`} className="relative pl-5 border-l border-emerald-800/60 pb-4 last:pb-0 last:border-0">
                  {/* Circle locator icon */}
                  <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-stone-900" />
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-display font-semibold text-xs text-white">{log.action}</h4>
                      <span className="text-[9px] text-stone-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[10px] font-mono text-emerald-400 font-semibold">{log.livestockName}</p>
                    <p className="text-xs text-stone-400 leading-relaxed font-sans">{log.notes}</p>
                    
                    {log.photoUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-stone-800 h-28 bg-stone-950">
                        <img 
                          src={log.photoUrl} 
                          alt="Log snapshot" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="pt-1 flex justify-between items-center text-[9px] text-stone-500">
                      <span>Logged By: {log.scannedBy || 'System Terminal'}</span>
                      <span>ID: {log.id}</span>
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
