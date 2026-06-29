import React, { useState } from 'react';
import { X, CreditCard, Shield, CheckCircle, ArrowRight, Printer, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';
import { Order, OrderItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutModalProps {
  cartItems: OrderItem[];
  totalAmount: number;
  onPaymentSuccess: (buyerName: string, buyerEmail: string, paymentMethod: string) => void;
  onClose: () => void;
}

export default function CheckoutModal({ cartItems, totalAmount, onPaymentSuccess, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<'billing' | 'card' | 'processing' | 'success'>('billing');
  
  // Billing details
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Validation messages
  const [error, setError] = useState<string | null>(null);

  // Loading sub-logs for realistic payment terminal
  const [processingStatus, setProcessingStatus] = useState('Initiating payment gateway secure connection...');
  const [generatedOrder, setGeneratedOrder] = useState<Order | null>(null);

  const validateBilling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      setError('Please provide your full billing name.');
      return;
    }
    if (!buyerEmail.trim() || !buyerEmail.includes('@')) {
      setError('Please provide a valid contact email.');
      return;
    }
    if (!address.trim() || !city.trim() || !zip.trim()) {
      setError('Please fill out full shipping and delivery addresses.');
      return;
    }
    setError(null);
    setStep('card');
  };

  const validatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Invalid card details. Number must be exactly 16 digits.');
      return;
    }
    if (!expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
      setError('Invalid expiry date format. Use MM/YY.');
      return;
    }
    if (cvv.length < 3) {
      setError('Invalid security code. CVV must be 3 or 4 digits.');
      return;
    }

    setError(null);
    setStep('processing');

    // Simulated network processing log progression
    const steps = [
      { t: 0, text: 'Encrypting transaction token keys with AES-256...' },
      { t: 800, text: 'Requesting validation response from Stripe Payment Terminal...' },
      { t: 1600, text: 'Verifying bank reserves and ledger balances...' },
      { t: 2400, text: 'Filing digital receipt & updating livestock system order queue...' },
      { t: 3200, text: 'Payment Processed!' }
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        setProcessingStatus(s.text);
        if (s.text === 'Payment Processed!') {
          const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
          const mockOrder: Order = {
            id: orderId,
            buyerName,
            buyerEmail,
            items: cartItems,
            totalAmount,
            status: 'processing',
            paymentStatus: 'paid',
            paymentMethod: 'Credit Card (Stripe SSL Secured)',
            createdAt: new Date().toISOString()
          };
          setGeneratedOrder(mockOrder);
          setStep('success');
          onPaymentSuccess(buyerName, buyerEmail, 'Credit Card (Stripe)');
        }
      }, s.t);
    });
  };

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setExpiry(value.slice(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  const printReceipt = () => {
    window.print();
  };

  const tax = totalAmount * 0.05;
  const delivery = totalAmount > 100 ? 0 : 15.00;
  const finalTotal = totalAmount + tax + delivery;

  return (
    <div id="checkout_modal_overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/85 backdrop-blur-sm p-4">
      <div id="checkout_modal" className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden border border-stone-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-stone-900 text-base">Secure Gateway Checkout</h2>
              <p className="text-xs text-stone-500 font-sans">Agricultural Trade & Payment Services</p>
            </div>
          </div>
          {step !== 'processing' && (
            <button id="close_checkout_btn" onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Progress Indicators */}
          {step !== 'success' && (
            <div className="flex justify-between items-center text-xs font-mono font-medium text-stone-400 px-2">
              <div className={`flex items-center gap-1.5 ${step === 'billing' ? 'text-emerald-700 font-bold' : 'text-emerald-600'}`}>
                <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px]">1</span>
                Billing Details
              </div>
              <div className="h-px bg-stone-200 flex-1 mx-4"></div>
              <div className={`flex items-center gap-1.5 ${step === 'card' ? 'text-emerald-700 font-bold' : step === 'processing' ? 'text-emerald-600 animate-pulse' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'card' || step === 'processing' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-stone-50 border border-stone-100'}`}>2</span>
                Secure Payment
              </div>
            </div>
          )}

          {error && (
            <div id="checkout_error_box" className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* Step 1: Billing & Shipping Address Form */}
            {step === 'billing' && (
              <motion.form
                key="billing-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={validateBilling}
                className="space-y-4"
              >
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <h3 className="font-display font-medium text-stone-900 text-xs mb-3">Order Summary</h3>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-stone-600">
                        <span className="truncate max-w-[280px]">
                          {item.name} <span className="text-stone-400 font-mono">x{item.quantity}</span>
                        </span>
                        <span className="font-mono font-medium text-stone-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-stone-200/60 mt-3 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-500">
                      <span>Subtotal</span>
                      <span className="font-mono">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Tax (5% Vet & Agri Levies)</span>
                      <span className="font-mono">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Logistics & Delivery</span>
                      <span className="font-mono">{delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-display font-bold text-stone-900 text-sm border-t border-dashed border-stone-200 pt-1.5">
                      <span>Order Total</span>
                      <span className="font-mono text-emerald-800">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display font-medium text-stone-900 text-xs">Shipping & Customer Details</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Full Name</label>
                      <input
                        id="billing_name_input"
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Email Address</label>
                      <input
                        id="billing_email_input"
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="johndoe@gmail.com"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Delivery Address</label>
                      <input
                        id="billing_address_input"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="128 Homestead Meadow Lane"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">City</label>
                      <input
                        id="billing_city_input"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Lexington"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">ZIP / Postal Code</label>
                      <input
                        id="billing_zip_input"
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="40502"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex justify-end">
                  <button
                    id="billing_next_btn"
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-display font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    Proceed to Payment
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 2: Payment Details (Simulating SSL Stripe form) */}
            {step === 'card' && (
              <motion.form
                key="card-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={validatePayment}
                className="space-y-5"
              >
                <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-inner relative overflow-hidden">
                  {/* Subtle design circles */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-900/30 rounded-full blur-xl -mr-6 -mt-6"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-800/20 rounded-full blur-md -ml-8 -mb-8"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-300">Agricultural Card Terminal</span>
                      <h4 className="font-display font-semibold text-sm mt-0.5">AgriFarm Ledger</h4>
                    </div>
                    <CreditCard className="w-6 h-6 text-emerald-300" />
                  </div>

                  <div className="space-y-4">
                    <p className="font-mono text-base tracking-widest text-center min-h-[24px]">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex justify-between text-xs font-mono">
                      <div>
                        <p className="text-[8px] text-emerald-300 uppercase">Card Holder</p>
                        <p className="truncate max-w-[150px] uppercase font-bold">{buyerName || 'Your Name'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-emerald-300 uppercase">Expiry Date</p>
                        <p className="font-bold">{expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/60 p-3 rounded-lg text-[11px] text-stone-600 leading-relaxed">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your transaction is encrypted securely with a simulated Stripe 3D-Secure payment flow. No banking keys are stored on public servers.</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Card Number</label>
                      <div className="relative">
                        <input
                          id="card_number_input"
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4111 2222 3333 4444"
                          className="w-full bg-white border border-stone-200 rounded-lg pl-10 pr-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          maxLength={19}
                          required
                        />
                        <CreditCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Expiration Date</label>
                        <input
                          id="card_expiry_input"
                          type="text"
                          value={expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Security Code (CVV)</label>
                        <input
                          id="card_cvv_input"
                          type="password"
                          value={cvv}
                          onChange={handleCvvChange}
                          placeholder="•••"
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex justify-between gap-3">
                  <button
                    id="card_back_btn"
                    type="button"
                    onClick={() => setStep('billing')}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-display font-semibold transition-all"
                  >
                    Back
                  </button>
                  <button
                    id="submit_payment_btn"
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-display font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Authorize Payment: ${finalTotal.toFixed(2)}
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Processing payment status */}
            {step === 'processing' && (
              <motion.div
                key="processing-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
                  <CreditCard className="w-5 h-5 text-emerald-600 absolute" />
                </div>
                
                <div>
                  <h3 className="font-display font-bold text-stone-900 text-sm">Processing Payment</h3>
                  <p className="text-xs text-stone-400 mt-1 font-mono">PLEASE DO NOT REFRESH OR CLOSE WINDOW</p>
                </div>

                <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl max-w-sm w-full">
                  <p className="text-[10px] font-mono text-stone-500 text-left flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin shrink-0" />
                    <span>{processingStatus}</span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Payment success print receipt */}
            {step === 'success' && generatedOrder && (
              <motion.div
                key="success-invoice"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center justify-center text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-bold text-stone-900 text-base">Payment Authorized</h3>
                  <p className="text-xs text-stone-500">Invoice generated successfully for {buyerName}</p>
                </div>

                {/* Printable Invoice Frame */}
                <div id="printable-invoice" className="bg-white border-2 border-dashed border-stone-200 p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-start pb-3 border-b border-stone-100">
                    <div>
                      <p className="font-display font-extrabold text-stone-900 text-sm tracking-tight">AGRIFARM CO.</p>
                      <p className="text-[9px] text-stone-400">Lexington Regional Station, KY</p>
                    </div>
                    <div className="text-right font-mono text-[9px] text-stone-500">
                      <p>INVOICE: #{generatedOrder.id}</p>
                      <p>{new Date(generatedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Purchased Items</p>
                    <div className="space-y-1.5 text-xs text-stone-600">
                      {generatedOrder.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span>{it.name} <span className="text-stone-400">x{it.quantity}</span></span>
                          <span className="font-mono font-medium text-stone-900">${(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-stone-100 pt-3 space-y-1 font-mono text-[10px] text-stone-500">
                    <div className="flex justify-between">
                      <span>Gateway Method:</span>
                      <span className="text-stone-800">{generatedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between font-display font-bold text-stone-900 text-xs pt-1.5 border-t border-dashed border-stone-100">
                      <span>Total Amount Settled:</span>
                      <span className="text-emerald-800">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* QR Code generator for delivery tracking */}
                  <div className="bg-stone-50 p-3 rounded-lg flex items-center gap-3 border border-stone-100">
                    {/* Visual QR Simulator */}
                    <div className="w-14 h-14 bg-white border border-stone-200 p-1 flex flex-col justify-between items-center rounded shrink-0">
                      <div className="grid grid-cols-4 gap-0.5 w-full h-full opacity-80">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`rounded-[1px] ${
                              (i % 3 === 0 || i % 7 === 0 || i === 0 || i === 3 || i === 12 || i === 15) 
                                ? 'bg-stone-900' 
                                : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-800 uppercase">Interactive Order QR Tag</p>
                      <p className="text-[9px] text-stone-500 leading-relaxed mt-0.5">
                        Admin staff will scan this code using the livestock camera upon delivery dispatch to log telemetry.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    id="print_invoice_btn"
                    onClick={printReceipt}
                    className="flex-1 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-display font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Invoice Receipt
                  </button>
                  <button
                    id="finish_checkout_btn"
                    onClick={onClose}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-display font-semibold transition-colors"
                  >
                    Finish
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
