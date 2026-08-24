import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Shield,
  FileCheck,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Building2,
  Truck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VendorOnboardingForm: React.FC<{
  onComplete: () => void;
}> = ({ onComplete }) => {
  const { registerNewVendor, selectedCountry, vendors, setCurrentVendorId, currentVendor } = useApp();

  const [step, setStep] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [companyName, setCompanyName] = useState('Matoluxx Integrated Services');
  const [businessType, setBusinessType] = useState<'individual_agent' | 'certified_agency'>('certified_agency');
  const [policeCertNumber, setPoliceCertNumber] = useState('');
  const [lasepaLicenseNumber, setLasepaLicenseNumber] = useState('');
  const [ninNumber, setNinNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Toyota HiAce Fumigation Rig');
  const [plateNumber, setPlateNumber] = useState('LND-901-XZ');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const newVendor = registerNewVendor({
      name: fullName || 'Matoluxx Certified Applicators',
      email: email || 'operations@matoluxx.ng',
      phone: phone || '+234 803 999 1122',
      companyName: companyName || 'Matoluxx Integrated Services',
      businessType,
      vehicle: {
        type: 'Mobile Disinfection Van',
        plateNumber: plateNumber || 'LND-901-XZ',
        model: vehicleModel || 'Toyota HiAce Fumigation Rig'
      },
      verification: {
        policeClearance: {
          id: `pol-${Date.now()}`,
          type: 'police_clearance',
          title: `${selectedCountry.policeAgency} Character Certificate`,
          documentNumber: policeCertNumber || `NPF-CCR/LG/2026/${Math.floor(10000 + Math.random() * 90000)}`,
          issuer: selectedCountry.policeAgency,
          issuedDate: '2026-08-01',
          expiryDate: '2027-08-01',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
          status: 'pending'
        },
        lasepaAccreditation: {
          id: `las-${Date.now()}`,
          type: 'lasepa_permit',
          title: `${selectedCountry.environmentalAgency} Operator Permit`,
          documentNumber: lasepaLicenseNumber || `LASEPA/PCO/2026/CAT-A/${Math.floor(1000 + Math.random() * 9000)}`,
          issuer: selectedCountry.environmentalAgency,
          issuedDate: '2026-08-05',
          expiryDate: '2027-08-05',
          fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
          status: 'pending'
        },
        ninVerified: true,
        bvnVerified: true,
        overallStatus: 'pending_review',
        badgeIssuedAt: ''
      },
      wallet: {
        availableBalanceNGN: 0,
        escrowBalanceNGN: 0,
        totalEarnedNGN: 0,
        platformFeesPaidNGN: 0,
        bankAccount: {
          bankName: 'Wema Bank Plc',
          accountNumber: '0128090787',
          accountName: 'Matoluxx Integrated Services'
        },
        payoutHistory: []
      }
    });

    setSubmitted(true);
    try {
      confetti({ particleCount: 70, spread: 70 });
    } catch (e) {}
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Vendor & Professional Applicator Onboarding</h2>
            <p className="text-xs text-slate-400">
              Mandatory Police Clearance & {selectedCountry.environmentalAgency} Chemical Certification Portal
            </p>
          </div>
        </div>

        <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3 text-xs text-blue-300 flex items-start space-x-2 mt-3">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
          <span>
            <strong>Statutory Compliance Requirement:</strong> Under environmental & state safety guidelines in Nigeria, all household cleaners and fumigators must hold an unexpired NPF Criminal Registry Clearance Certificate and LASEPA Pest Control Operator Class-A/B accreditation before enrolling on KleenPulse.
          </span>
        </div>
      </div>

      {submitted ? (
        <div className="bg-slate-900 border border-emerald-600/60 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Application Successfully Submitted to Regulatory Desk</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
              Your credentials are now queued in the <strong>{selectedCountry.environmentalAgency} Compliance & Police CRID Verification Desk</strong>. Switch to the Regulator/Admin tab to review or approve your application!
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs max-w-md mx-auto space-y-1.5">
            <p className="text-slate-400"><strong className="text-slate-200">Agency:</strong> {companyName || fullName}</p>
            <p className="text-slate-400"><strong className="text-slate-200">Police Cert Ref:</strong> {policeCertNumber || 'NPF-CCR/LG/2026/90218'}</p>
            <p className="text-slate-400"><strong className="text-slate-200">LASEPA Permit Ref:</strong> {lasepaLicenseNumber || 'LASEPA/PCO/2026/CAT-A/4819'}</p>
            <p className="text-slate-400"><strong className="text-slate-200">Settlement Bank:</strong> Wema Bank (0128090787) - Matoluxx</p>
            <p className="text-slate-400"><strong className="text-slate-200">Verification Status:</strong> <span className="text-amber-400 font-bold">PENDING REGULATOR SIGN-OFF</span></p>
          </div>

          <button
            onClick={onComplete}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
          >
            Go to Partner Console
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitApplication} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-xs">
          {/* Step 1: Personal / Agency Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Personal & Business Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lead Agent Full Name:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Babatunde Balogun"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business / Agency Name:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Matoluxx Integrated Services"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Email Address:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operations@matoluxx.ng"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Direct Phone Number (WhatsApp Enabled):</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Document Numbers */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Police Clearance & LASEPA Accreditation Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {selectedCountry.policeAgency} Character Certificate #:
                </label>
                <input
                  type="text"
                  required
                  value={policeCertNumber}
                  onChange={e => setPoliceCertNumber(e.target.value)}
                  placeholder="e.g. NPF-CCR/LG/2026/78219"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {selectedCountry.environmentalAgency} Operator Permit #:
                </label>
                <input
                  type="text"
                  required
                  value={lasepaLicenseNumber}
                  onChange={e => setLasepaLicenseNumber(e.target.value)}
                  placeholder="e.g. LASEPA/PCO/2026/CAT-A/3301"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Biometric National ID Number (NIN):</label>
                <input
                  type="text"
                  required
                  value={ninNumber}
                  onChange={e => setNinNumber(e.target.value)}
                  placeholder="11-digit NIN verification"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle Model & Plate Number:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={e => setVehicleModel(e.target.value)}
                    placeholder="Toyota HiAce Van"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={e => setPlateNumber(e.target.value)}
                    placeholder="LND-842-EK"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Document Uploads Simulator */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Scanned Digital Proof Uploads</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center bg-slate-950/60 cursor-pointer">
                <UploadCloud className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                <span className="font-bold text-slate-200 block">NPF Police Character Certificate</span>
                <span className="text-[10px] text-slate-400">PDF, JPG up to 10MB</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">✓ certificate_npf_crid.pdf attached</span>
              </div>

              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center bg-slate-950/60 cursor-pointer">
                <UploadCloud className="w-8 h-8 text-blue-400 mx-auto mb-1" />
                <span className="font-bold text-slate-200 block">LASEPA Pest Control License</span>
                <span className="text-[10px] text-slate-400">PDF, JPG up to 10MB</span>
                <span className="text-[10px] text-blue-400 font-bold block mt-1">✓ lasepa_operator_permit.pdf attached</span>
              </div>
            </div>
          </div>

          {/* Revenue Split Consent - 70/30 Split */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start space-x-3 text-slate-300">
            <input type="checkbox" required defaultChecked className="mt-1 accent-emerald-500" />
            <span className="text-[11px] leading-relaxed">
              I agree to the <strong>70% Vendor Payout / 30% KleenPulse Platform Fee</strong> revenue share terms, and certify that all chemicals sprayed conform to WHO Class-II/III and LASEPA MSDS environmental safety specifications.
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>SUBMIT COMPLIANCE APPLICATION FOR LASEPA & POLICE VETTING</span>
          </button>
        </form>
      )}
    </div>
  );
};
