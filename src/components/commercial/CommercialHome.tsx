import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Shield,
  Sparkles,
  Zap,
  CheckCircle,
  Truck,
  TrendingUp,
  Award,
  Factory,
  Building,
  Calendar,
  Lock,
  ThumbsUp,
  Star,
  ChevronDown,
  ArrowRight,
  HelpCircle,
  PhoneCall,
  FileCheck
} from 'lucide-react';

export const CommercialHome: React.FC<{
  onBookNow: () => void;
  onCreateContract: () => void;
  onOpenMsds: () => void;
}> = ({ onBookNow, onCreateContract, onOpenMsds }) => {
  const { selectedCountry, formatCurrency, vendors } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the 70/30 revenue sharing model protect customers and vendors?',
      a: '70% of every clean or fumigation fare goes directly to the certified vendor who performs the work, while 30% covers platform technology, 24/7 incident insurance, and dispute mediation. Furthermore, vendor payouts remain securely locked in Escrow until the customer inspects the premises and confirms 100% satisfaction.'
    },
    {
      q: 'What is the mandatory Police & LASEPA vetting requirement?',
      a: 'Under Lagos State environmental protection regulations, all household cleaners and fumigation technicians must hold an unexpired Nigeria Police Force (NPF / Central Criminal Registry) Character Certificate and a valid LASEPA Pest Control Operator license before they can receive dispatches on KleenPulse.'
    },
    {
      q: 'How does cost-reflective square-meter (m²) pricing work for warehouses and factories?',
      a: 'For commercial facilities, warehouses, and industrial plants (from 150 m² to 25,000+ m²), pricing is calculated dynamically based on exact square meters, ceiling truss height (for scissor-lift access), and heavy machinery requirements, with tiered volume discounts of up to 25% for large continuous floor areas.'
    },
    {
      q: 'How do Long-Term Recurring Service Contracts & SLAs work?',
      a: 'Homeowners and enterprises can set up recurring contracts (Weekly, Bi-Weekly, Monthly, Quarterly, or Bi-Annual) with loyalty discounts up to 25%. You can lock in your preferred dedicated vendor, and billing is handled in milestone escrow tranches per visit.'
    },
    {
      q: 'What special features are available for Airbnb and boutique hotel operators?',
      a: 'Hosts get same-day 11am-3pm guaranteed express turnovers, hotel linen changes, amenities restock audits, lockbox code sync, Wi-Fi speed verification, and automatic Lost & Found / damage photo reports before new guests check in.'
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in pb-12">
      {/* Hero Commercial Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-950/80 border border-emerald-700/60 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400 shadow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Premier On-Demand Cleaning & LASEPA Fumigation Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Certified Household Cleaners & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">LASEPA Fumigation</span> Dispatched in Minutes
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Experience Africa's standard in vetted home cleaning, Airbnb guest turnovers, industrial warehouse power-scrubbing ($m^2$), and vector eradication. 100% background-checked by the <strong>Nigeria Police Force</strong> and accredited by <strong>LASEPA</strong> with <strong>Customer Escrow Protection</strong>.
          </p>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-extrabold text-base block font-mono">100%</span>
              <span className="text-slate-400 text-[11px]">Police & LASEPA Vetted</span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-extrabold text-base block font-mono">70 / 30</span>
              <span className="text-slate-400 text-[11px]">Fair 70/30 Split Model</span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-extrabold text-base block font-mono">12 - 18 min</span>
              <span className="text-slate-400 text-[11px]">Average Rapid Dispatch</span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-extrabold text-base block font-mono">90 Days</span>
              <span className="text-slate-400 text-[11px]">Anti-Pest Warranty</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onBookNow}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-950 cursor-pointer transition-all transform hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>BOOK INSTANT CLEAN NOW</span>
            </button>

            <button
              onClick={onCreateContract}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>SET UP RECURRING SLA (SAVE 25%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillar Trust Framework */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Enterprise Quality & Regulatory Integrity
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for Total Peace of Mind
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-600/60 rounded-2xl p-6 shadow-xl space-y-3 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-600 flex items-center justify-center text-blue-400 shadow">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Nigeria Police Vetted</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every applicator passes criminal history clearance with the NPF Central Criminal Registry (CRID) and biometric NIN verification.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-600/60 rounded-2xl p-6 shadow-xl space-y-3 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">LASEPA Chemical Certified</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict adherence to Class-II/III biodegradable pyrethroids and state environmental waste disposal manifests.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-600/60 rounded-2xl p-6 shadow-xl space-y-3 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400 shadow">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Customer Escrow Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Payment is held safely in escrow and only released after you inspect the finished job and enter your satisfaction OTP.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-600/60 rounded-2xl p-6 shadow-xl space-y-3 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-600 flex items-center justify-center text-teal-400 shadow">
              <Factory className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Cost-Reflective per m²</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fair pricing for warehouses, factories, and commercial hubs with tiered economy-of-scale discounts up to 25%.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Showcase */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block">Verified Client Feedback</span>
            <h3 className="text-xl font-bold text-white mt-0.5">Trusted by Lagos Homeowners & Facility Managers</h3>
          </div>
          <div className="flex items-center space-x-1 text-amber-400 text-sm font-bold">
            <span>★ 4.94 / 5.0 Average Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-1 text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-slate-300 italic leading-relaxed">
              "We had persistent cockroach and mosquito issues in our 4-bedroom duplex in Lekki Phase 1. The LASEPA certified team showed up in full PPE, sealed all food items, and issued an official compliance certificate. Zero smell after 3 hours!"
            </p>
            <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-slate-400">
              <span className="font-bold text-white">Oluwaseun Adebayo</span>
              <span className="text-[10px]">Duplex, Lekki Phase 1</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-1 text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-slate-300 italic leading-relaxed">
              "As a logistics manager overseeing a 2,500 m² distribution bay in Ikeja, the per-square-meter pricing engine gave us transparent billing and saved us over ₦80,000 with volume discounts. The ride-on scrubber left the floor sparkling."
            </p>
            <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-slate-400">
              <span className="font-bold text-white">Engr. T. Balogun</span>
              <span className="text-[10px]">Ikeja Logistics Bay</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-1 text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-slate-300 italic leading-relaxed">
              "The customer escrow feature gave us immense confidence. Knowing the vendor payout was held until our facility director inspected every office suite made all the difference. We immediately enrolled in a monthly corporate SLA."
            </p>
            <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-slate-400">
              <span className="font-bold text-white">Folake Davies-Okoro</span>
              <span className="text-[10px]">Victoria Island Clinic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive FAQ Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Frequently Asked Questions
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Everything You Need to Know
          </h3>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto text-xs">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  <span className="text-xs sm:text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-slate-300 leading-relaxed border-t border-slate-900 pt-3 text-xs">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
