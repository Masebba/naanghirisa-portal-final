import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { COLORS } from '../constants';
import { getPageContent, subscribeStoreUpdates } from '../services/mockData';
import { authService } from '../services/authService';
import { addDonation, getCampaigns, getPrograms } from '../services/mockData';
import { Campaign, Program } from '../types';

type PaymentMethod = 'MTN' | 'AIRTEL' | 'CARD';

const presetAmounts = [25, 50, 100, 500];

const Donate: React.FC = () => {
  const [content, setContent] = useState(getPageContent());
  useEffect(() => subscribeStoreUpdates(() => setContent(getPageContent())), []);
  const location = useLocation();
  const user = authService.getCurrentUser();
  const searchParams = new URLSearchParams(location.search);
  const initialCampaignId = searchParams.get('campaign');
  const initialProgramId = searchParams.get('program');

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTarget, setSelectedTarget] = useState<{ id: string; name: string; type: 'Campaign' | 'Program' | 'General' } | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [receipt, setReceipt] = useState<{ reference: string; target: string } | null>(null);

  const campaigns = getCampaigns().filter(campaign => campaign.status === 'Active');
  const programs = getPrograms();

  useEffect(() => {
    if (initialCampaignId) {
      const found = campaigns.find(campaign => campaign.id === initialCampaignId);
      if (found) setSelectedTarget({ id: found.id, name: found.name, type: 'Campaign' });
    } else if (initialProgramId) {
      const found = programs.find(program => program.id === initialProgramId);
      if (found) setSelectedTarget({ id: found.id, name: found.name, type: 'Program' });
    }
  }, [campaigns, initialCampaignId, initialProgramId, programs]);

  const handleProcess = async () => {
    if (!selectedTarget) return;
    if ((paymentMethod === 'MTN' || paymentMethod === 'AIRTEL') && phone.replace(/\D/g, '').length < 9) {
      window.alert('Please enter a valid Ugandan phone number.');
      return;
    }

    const finalName = user?.name || guestName.trim() || 'Anonymous Supporter';
    const targetLabel = selectedTarget.type === 'General' ? 'General Welfare' : selectedTarget.name;
    const targetId = selectedTarget.type === 'General' ? 'General' : selectedTarget.id;

    addDonation({
      id: `donation_${Date.now()}`,
      donorName: finalName,
      amount,
      campaignId: targetId,
      category: selectedTarget.type,
      date: new Date().toISOString().split('T')[0],
      description: `${finalName} contributed via ${paymentMethod || 'CARD'} to ${targetLabel}`,
      receiptImage: '',
      donorEmail: guestEmail || user?.email || '',
      paymentMethod: paymentMethod || 'CARD',
      phoneNumber: phone,
      status: 'Recorded',
    } as any);

    setReceipt({ reference: `NAA-${Date.now()}`, target: targetLabel });
    setStep(4);
  };

  if (step === 4 && receipt) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-[2.5rem] border border-orange-100 bg-white p-10 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
            <i className="fas fa-heart" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Donation received</h2>
          <p className="mt-4 text-slate-600">
            Thank you for supporting <span className="font-black text-slate-900">{receipt.target}</span> with <span className="font-black text-slate-900">${amount.toLocaleString()}</span>.
          </p>
          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Receipt reference</p>
            <p className="mt-2 font-black text-slate-900">{receipt.reference}</p>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link to="/dashboard/donations" className="flex-1 rounded-2xl bg-slate-900 px-5 py-4 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-black">
              View in dashboard
            </Link>
            <Link to="/" className="flex-1 rounded-2xl bg-slate-100 px-5 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-600 transition hover:bg-slate-200">
              Return home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center rounded-[2.5rem] px-8 py-14 text-white" style={{ backgroundColor: COLORS.primary, backgroundImage: content.donateHeroImage ? `linear-gradient(rgba(88,0,0,0.82), rgba(88,0,0,0.82)), url(${content.donateHeroImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            {content.donateHeroTitle || 'Change a life today'}
          </h1>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-white/80">
            Step {step} of 3
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl">

          <div className="p-8 md:p-12">
            {step === 1 && (
              <div className="space-y-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Select a support target</h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTarget({ id: 'General', name: 'General Welfare', type: 'General' })}
                    className={`rounded-[2rem] border-2 p-6 text-left transition ${selectedTarget?.id === 'General' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-slate-50 hover:border-orange-200'}`}
                  >
                    <div className="mb-4 text-3xl text-orange-500"><i className="fas fa-globe" /></div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">General welfare</h4>
                    <p className="mt-2 text-sm text-slate-500">Flexible support for urgent community needs.</p>
                  </button>

                  {campaigns.length > 0 ? campaigns.map(campaign => (
                    <button
                      key={campaign.id}
                      type="button"
                      onClick={() => setSelectedTarget({ id: campaign.id, name: campaign.name, type: 'Campaign' })}
                      className={`rounded-[2rem] border-2 p-6 text-left transition ${selectedTarget?.id === campaign.id ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-slate-50 hover:border-orange-200'}`}
                    >
                      <div className="mb-4 text-3xl text-orange-500"><i className="fas fa-bullhorn" /></div>
                      <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">{campaign.name}</h4>
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2">{campaign.purpose}</p>
                    </button>
                  )) : (
                    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 md:col-span-2">
                      No campaign has been published yet. General welfare donations are available now.
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!selectedTarget}
                  onClick={() => setStep(2)}
                  className="w-full rounded-2xl bg-slate-900 px-6 py-5 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-black disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Amount & identity</h3>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-orange-600">
                    Target: {selectedTarget?.name}
                  </span>
                </div>

                {!user && (
                  <div className="grid gap-5 rounded-[2rem] border border-slate-100 bg-slate-50 p-6 md:grid-cols-2">
                    <div className="md:col-span-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Guest contributor details
                    </div>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Enter your full name"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                    />
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Enter your email address"
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {presetAmounts.map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(value)}
                      className={`rounded-2xl border px-4 py-5 text-lg font-black transition ${amount === value ? 'border-orange-500 bg-orange-600 text-white' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-orange-300'}`}
                    >
                      ${value}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Custom amount</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-2xl font-black text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="0.00"
                    value={amount || ''}
                    onChange={e => setAmount(Number(e.target.value))}
                  />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-2xl bg-slate-100 px-6 py-5 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={amount <= 0 || (!user && (!guestName || !guestEmail))}
                    onClick={() => setStep(3)}
                    className="flex-[2] rounded-2xl bg-slate-900 px-6 py-5 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-black disabled:opacity-50"
                  >
                    Continue to payment
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Choose payment method</h3>

                <div className="grid gap-4">
                  {[
                    { value: 'MTN', label: 'MTN Mobile Money', hint: 'Verified mobile wallet', icon: 'M', badge: 'bg-yellow-400' },
                    { value: 'AIRTEL', label: 'Airtel Money', hint: 'Verified mobile wallet', icon: 'A', badge: 'bg-red-600' },
                    { value: 'CARD', label: 'International card', hint: 'Visa, Mastercard, Amex', icon: 'C', badge: 'bg-slate-900' },
                  ].map(method => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value as PaymentMethod)}
                      className={`flex items-center justify-between rounded-[2rem] border-2 p-5 text-left transition ${paymentMethod === method.value ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-slate-50 hover:border-orange-200'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-white ${method.badge}`}>{method.icon}</div>
                        <div>
                          <p className="font-black text-slate-900">{method.label}</p>
                          <p className="text-xs text-slate-500">{method.hint}</p>
                        </div>
                      </div>
                      {paymentMethod === method.value && <i className="fas fa-check-circle text-orange-500" />}
                    </button>
                  ))}
                </div>

                {paymentMethod && paymentMethod !== 'CARD' && (
                  <div>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Mobile number</label>
                    <input
                      type="tel"
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-xl font-black text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Phone number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-2xl bg-slate-100 px-6 py-5 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!paymentMethod || (paymentMethod !== 'CARD' && phone.replace(/\D/g, '').length < 9)}
                    onClick={handleProcess}
                    className="flex-[2] rounded-2xl bg-orange-600 px-6 py-5 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-orange-700 disabled:opacity-50"
                  >
                    Complete donation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
