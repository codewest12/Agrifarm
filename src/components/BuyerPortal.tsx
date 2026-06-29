import React, { useState } from 'react';
import { 
  ShoppingBag, Trash2, ShieldCheck, Tag, Info, AlertCircle, 
  MapPin, Plus, Minus, ArrowRight, ClipboardList, CheckCircle, Package, Truck
} from 'lucide-react';
import { Livestock, FarmProduct, Order, OrderItem } from '../types';
import { INITIAL_PRODUCTS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface BuyerPortalProps {
  livestockList: Livestock[];
  orders: Order[];
  onPlaceOrder: (items: OrderItem[], totalAmount: number) => void;
  onOpenCheckout: (items: OrderItem[], total: number) => void;
}

export default function BuyerPortal({ livestockList, orders, onPlaceOrder, onOpenCheckout }: BuyerPortalProps) {
  const [activeTab, setActiveTab] = useState<'store' | 'tracking'>('store');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter available livestock that are priced and not quarantined
  const availableLivestock = livestockList.filter(l => l.healthStatus !== 'quarantined');

  // Add item to shopping cart
  const addToCart = (id: string, name: string, price: number, type: OrderItem['type']) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id, name, price, quantity: 1, type }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Get buyer's orders
  const buyerOrders = orders; // Show current session logs/orders

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = cartSubtotal * 0.05;
  const delivery = cartSubtotal > 100 ? 0 : 15;
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + tax + delivery : 0;

  // Clear cart callback used after order success
  React.useEffect(() => {
    // If the last order was created recently, we can clear the client cart
    if (orders.length > 0) {
      const latest = orders[orders.length - 1];
      // Check if order was placed in the last 2 seconds
      const diffMs = Date.now() - new Date(latest.createdAt).getTime();
      if (diffMs < 2000 && cart.length > 0) {
        setCart([]);
      }
    }
  }, [orders]);

  return (
    <div id="buyer_portal" className="space-y-6">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-stone-200">
        <button
          id="tab_store_btn"
          onClick={() => setActiveTab('store')}
          className={`px-5 py-3 text-sm font-display font-semibold border-b-2 transition-all ${
            activeTab === 'store' 
              ? 'border-emerald-700 text-emerald-800' 
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          AgriStore Marketplace
        </button>
        <button
          id="tab_tracking_btn"
          onClick={() => setActiveTab('tracking')}
          className={`px-5 py-3 text-sm font-display font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tracking' 
              ? 'border-emerald-700 text-emerald-800' 
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Truck className="w-4 h-4" />
          My Orders & Delivery Tracking
          {buyerOrders.length > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-full">
              {buyerOrders.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* Marketplace Store */}
        {activeTab === 'store' && (
          <motion.div
            key="store-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Products grid */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Livestock For Sale */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-stone-900 text-base">Verified Live Stock for Sale</h3>
                  <p className="text-xs text-stone-500 font-sans">Quarantine certified, RFID tagged, veterinary cleared breeds</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableLivestock.map((animal) => (
                    <div 
                      key={animal.id} 
                      id={`buyer_livestock_card_${animal.id}`}
                      className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="h-40 relative bg-stone-100">
                        <img 
                          src={animal.imageUrl} 
                          alt={animal.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono font-medium text-white shadow-sm capitalize">
                          {animal.breed}
                        </span>
                        <div className="absolute bottom-3 right-3 bg-stone-950/85 backdrop-blur-sm px-3 py-1 rounded-xl text-sm font-mono font-extrabold text-emerald-400">
                          ${animal.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-display font-bold text-stone-900 text-sm">{animal.name}</h4>
                            <p className="text-[11px] text-stone-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400" /> {animal.location}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                            {animal.id}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
                          <span className="text-stone-400 font-mono">Weight: {animal.weightKg}kg</span>
                          <button
                            id={`add_livestock_to_cart_${animal.id}`}
                            onClick={() => addToCart(animal.id, `${animal.name} (${animal.breed})`, animal.price, 'livestock')}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-850 text-white rounded-lg text-[10px] font-display font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farm Products */}
              <div className="space-y-4 pt-4 border-t border-stone-200/60">
                <div>
                  <h3 className="font-display font-bold text-stone-900 text-base">Organic Farm-Fresh Produce</h3>
                  <p className="text-xs text-stone-500 font-sans">Sourced daily from our organic fields & pastures</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {INITIAL_PRODUCTS.map((prod) => (
                    <div 
                      key={prod.id} 
                      id={`buyer_prod_card_${prod.id}`}
                      className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="h-36 relative bg-stone-100">
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono font-medium text-white shadow-sm capitalize">
                          {prod.category}
                        </span>
                        <div className="absolute bottom-3 right-3 bg-stone-950/85 backdrop-blur-sm px-3 py-1 rounded-xl text-sm font-mono font-extrabold text-emerald-400">
                          ${prod.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div>
                          <h4 className="font-display font-bold text-stone-900 text-xs">{prod.name}</h4>
                          <p className="text-[11px] text-stone-500 font-sans leading-relaxed mt-0.5">{prod.description}</p>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-[11px]">
                          <span className="text-stone-400">Per {prod.unit}</span>
                          <button
                            id={`add_produce_to_cart_${prod.id}`}
                            onClick={() => addToCart(prod.id, prod.name, prod.price, 'product')}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-850 text-white rounded-lg text-[10px] font-display font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Shopping Cart panel (4 columns) */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4 sticky top-6">
                <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-700" />
                    <h3 className="font-display font-bold text-stone-900 text-sm">Active Shopping Cart</h3>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 font-bold uppercase">{cart.length} items</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div key={item.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h5 className="font-display font-semibold text-stone-900 text-xs truncate max-w-[170px]" title={item.name}>
                              {item.name}
                            </h5>
                            <span className="text-[10px] text-stone-400 uppercase tracking-wide font-mono font-bold">
                              {item.type}
                            </span>
                          </div>
                          <button
                            id={`remove_cart_item_${item.id}`}
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-stone-200/50">
                          <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-md p-0.5">
                            <button
                              id={`cart_qty_minus_${item.id}`}
                              onClick={() => updateCartQty(item.id, -1)}
                              className="p-1 hover:bg-stone-50 text-stone-500 rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono font-bold text-stone-800">
                              {item.quantity}
                            </span>
                            <button
                              id={`cart_qty_plus_${item.id}`}
                              onClick={() => updateCartQty(item.id, 1)}
                              className="p-1 hover:bg-stone-50 text-stone-500 rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono font-bold text-xs text-stone-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 space-y-2">
                      <ShoppingBag className="w-10 h-10 text-stone-200 mx-auto" />
                      <p className="text-xs text-stone-400 font-sans leading-relaxed">
                        Your farm cart is currently empty.<br />Add certified livestock or products.
                      </p>
                    </div>
                  )}
                </div>

                {/* Subtotal calculation */}
                {cart.length > 0 && (
                  <div className="pt-4 border-t border-stone-100 space-y-2.5">
                    <div className="space-y-1.5 text-xs text-stone-500">
                      <div className="flex justify-between">
                        <span>Cart Subtotal</span>
                        <span className="font-mono text-stone-800">${cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agricultural Levy (5%)</span>
                        <span className="font-mono text-stone-800">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery & logistics</span>
                        <span className="font-mono text-stone-800">
                          {delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between font-display font-bold text-stone-900 text-sm border-t border-dashed border-stone-200 pt-3">
                      <span>Order Total</span>
                      <span className="font-mono text-emerald-800 text-base">${cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                      id="proceed_checkout_btn"
                      onClick={() => onOpenCheckout(cart, cartSubtotal)}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-850 text-white rounded-xl text-xs font-display font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/10 cursor-pointer"
                    >
                      Secure Stripe Checkout
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* Tracking Orders List */}
        {activeTab === 'tracking' && (
          <motion.div
            key="tracking-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-display font-bold text-stone-900 text-base">Pasture Log & Delivery Tracking</h3>
              <p className="text-xs text-stone-500 font-sans">Monitor active livestock dispatches and logistics checkpoints</p>
            </div>

            {buyerOrders.length > 0 ? (
              <div className="space-y-6">
                {buyerOrders.map((order) => {
                  return (
                    <div 
                      key={order.id} 
                      id={`buyer_tracking_card_${order.id}`}
                      className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6"
                    >
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                        <div>
                          <p className="font-mono text-[10px] font-bold text-stone-400">ORDER TRACKING ID</p>
                          <h4 className="font-display font-extrabold text-stone-900 text-lg">{order.id}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-500 font-sans">
                            Placed: {new Date(order.createdAt).toLocaleString()}
                          </span>
                          <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold capitalize ${
                            order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                          }`}>
                            Status: {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items listing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans">Consolidated Cargo</p>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-stone-600">
                                <span>{item.name} <span className="text-stone-400 font-mono">x{item.quantity}</span></span>
                                <span className="font-mono font-medium text-stone-900">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-stone-100 pt-3 flex justify-between text-xs font-display font-bold text-stone-900">
                            <span>Amount Paid</span>
                            <span className="font-mono text-emerald-800">${order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Interactive Status Visualizer */}
                        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 space-y-4">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans">Dispatch Telemetry</p>
                          
                          <div className="relative">
                            {/* Line connecting them */}
                            <div className="absolute left-[15px] top-[15px] bottom-[15px] w-0.5 bg-stone-200">
                              <div 
                                className="w-full bg-emerald-600 transition-all duration-1000"
                                style={{
                                  height: order.status === 'delivered' ? '100%' :
                                          order.status === 'shipped' ? '50%' : '0%'
                                }}
                              />
                            </div>

                            {/* Node 1: Processing */}
                            <div className="relative flex items-center gap-4 pl-8 pb-6">
                              <div className={`absolute left-0 w-8 h-8 rounded-full border flex items-center justify-center z-10 ${
                                order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                  : 'bg-white border-stone-200 text-stone-400'
                              }`}>
                                <Package className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="font-display font-semibold text-stone-900 text-xs">Registered & Prepared</h5>
                                <p className="text-[10px] text-stone-500 leading-normal">Veterinary cleared, microchipped, and loaded at Barn A.</p>
                              </div>
                            </div>

                            {/* Node 2: Shipped */}
                            <div className="relative flex items-center gap-4 pl-8 pb-6">
                              <div className={`absolute left-0 w-8 h-8 rounded-full border flex items-center justify-center z-10 ${
                                order.status === 'shipped' || order.status === 'delivered'
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                  : 'bg-white border-stone-200 text-stone-400'
                              }`}>
                                <Truck className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="font-display font-semibold text-stone-900 text-xs">Transit & GPS Tracking Active</h5>
                                <p className="text-[10px] text-stone-500 leading-normal">Cargo boarded onto regional climate agricultural transit vehicles.</p>
                              </div>
                            </div>

                            {/* Node 3: Delivered */}
                            <div className="relative flex items-center gap-4 pl-8">
                              <div className={`absolute left-0 w-8 h-8 rounded-full border flex items-center justify-center z-10 ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                  : 'bg-white border-stone-200 text-stone-400'
                              }`}>
                                <CheckCircle className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="font-display font-semibold text-stone-900 text-xs">Delivered & Inspected</h5>
                                <p className="text-[10px] text-stone-500 leading-normal">Courier hand-off completed. Livestock verified safe.</p>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
                <ClipboardList className="w-12 h-12 text-stone-200 mx-auto mb-2" />
                <h4 className="font-display font-bold text-stone-900 text-sm">No Active Orders Yet</h4>
                <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                  Go to the AgriStore tab to choose pasture breeds or organic produce, complete payment, and check real-time telemetry here!
                </p>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
