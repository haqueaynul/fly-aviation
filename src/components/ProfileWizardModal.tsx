import React, { useState } from 'react';
import { UserProfile, RelativeProfile } from '../types';
import { User, FileText, MapPin, CreditCard, ShieldCheck, Users, Upload, CheckCircle2, ArrowRight, X, AlertCircle } from 'lucide-react';

interface ProfileWizardModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const ProfileWizardModal: React.FC<ProfileWizardModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'DOCS' | 'LOCATION' | 'RELATIVES' | 'SUBSCRIPTION'>('PERSONAL');

  // Form State
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [surname, setSurname] = useState(user.surname || '');
  const [dob, setDob] = useState(user.dob || '');
  const [country, setCountry] = useState(user.country || 'United Kingdom');
  const [city, setCity] = useState(user.city || 'St Helier');
  const [mobile, setMobile] = useState(user.mobile);
  const [homeAddress, setHomeAddress] = useState(user.homeAddress || '');
  const [billingAddress, setBillingAddress] = useState(user.billingAddress || '');

  // Document State
  const [passportNumber, setPassportNumber] = useState(user.passportNumber || '');
  const [passportExpiry, setPassportExpiry] = useState(user.passportExpiry || '');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState(user.drivingLicenseNumber || '');
  const [visaInfo, setVisaInfo] = useState(user.visaInfo || '');

  // Relatives State
  const [relatives, setRelatives] = useState<RelativeProfile[]>(user.savedRelatives || []);
  const [newRelName, setNewRelName] = useState('');
  const [newRelLastName, setNewRelLastName] = useState('');
  const [newRelRelation, setNewRelRelation] = useState('Spouse');
  const [newRelDob, setNewRelDob] = useState('');
  const [newRelPassport, setNewRelPassport] = useState('');

  // Subscription / Role upgrade
  const [role, setRole] = useState(user.role);

  const handleAddRelative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRelName.trim() || !newRelLastName.trim()) return;

    const newRel: RelativeProfile = {
      id: 'REL-' + Date.now(),
      firstName: newRelName,
      lastName: newRelLastName,
      relationship: newRelRelation,
      dob: newRelDob || '1995-01-01',
      passportNumber: newRelPassport || 'UK' + Math.floor(10000000 + Math.random() * 90000000),
      phone: '',
      email: '',
      hasPet: false,
    };

    setRelatives([...relatives, newRel]);
    setNewRelName('');
    setNewRelLastName('');
    setNewRelDob('');
    setNewRelPassport('');
  };

  const handleRemoveRelative = (id: string) => {
    setRelatives(relatives.filter((r) => r.id !== id));
  };

  const handleSaveProfile = () => {
    const updated: UserProfile = {
      ...user,
      firstName,
      lastName,
      surname,
      dob,
      country,
      city,
      mobile,
      homeAddress,
      billingAddress,
      passportNumber,
      passportExpiry,
      drivingLicenseNumber,
      visaInfo,
      savedRelatives: relatives,
      role,
      profileCompletePercentage: 100,
    };
    onUpdateUser(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#6d3cc7] text-white p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-200">
                User Management & Identity
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-bold">
                {user.profileCompletePercentage}% Complete
              </span>
            </div>
            <h3 className="text-xl font-bold mt-1">Multi-Step Profile & Relatives Registry</h3>
            <p className="text-xs text-purple-100">
              Complete your profile for express Island check-in and automated passenger autofill.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6 gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'PERSONAL', label: '1. Personal Details', icon: User },
            { id: 'DOCS', label: '2. Passport & License', icon: FileText },
            { id: 'LOCATION', label: '3. Address & Geo Coordinates', icon: MapPin },
            { id: 'RELATIVES', label: '4. Saved Relatives (Passengers)', icon: Users },
            { id: 'SUBSCRIPTION', label: '5. Plan & Upgrade', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#6d3cc7] text-[#6d3cc7]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content body */}
        <div className="p-6 md:p-8 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
          {activeTab === 'PERSONAL' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Surname</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth (18+)</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verifiable Mobile Phone</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DOCS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passport Number</label>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passport Expiry Date</label>
                  <input
                    type="date"
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Passport Photo Page Scan</span>
                  <span className="text-slate-500 text-[11px]">UK / European biometric passport verified</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                  Uploaded & Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Driving License Number</label>
                  <input
                    type="text"
                    value={drivingLicenseNumber}
                    onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">VISA / Residency Exemption Status</label>
                  <input
                    type="text"
                    value={visaInfo}
                    onChange={(e) => setVisaInfo(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'LOCATION' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Home Residential Address</label>
                <input
                  type="text"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Billing Address</label>
                <input
                  type="text"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200"
                />
              </div>

              {/* Map Coordinates Simulation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#6d3cc7]" /> Geo-Location Map Coordinates (Jersey Hub)
                  </span>
                  <span className="text-xs font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                    49.1833° N, 2.1066° W
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Used for island ground transfer pickup and private charter dispatch coordination.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'RELATIVES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Saved Family & Intended Passengers</h4>
                  <p className="text-[11px] text-slate-500">
                    Add relatives to quickly book seats for them during Cessna flight booking.
                  </p>
                </div>
                <span className="font-bold text-[#6d3cc7]">{relatives.length} Saved</span>
              </div>

              {/* List of relatives */}
              <div className="space-y-2">
                {relatives.map((rel) => (
                  <div
                    key={rel.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block text-sm">
                        {rel.firstName} {rel.lastName} ({rel.relationship})
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Passport: {rel.passportNumber} • DOB: {rel.dob}
                        {rel.hasPet && ` • Pet: ${rel.petName} (${rel.petBreed})`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRelative(rel.id)}
                      className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add relative form */}
              <form onSubmit={handleAddRelative} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                <span className="font-bold text-[#6d3cc7] block">Add New Relative / Passenger</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={newRelName}
                    onChange={(e) => setNewRelName(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={newRelLastName}
                    onChange={(e) => setNewRelLastName(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white"
                  />
                  <select
                    value={newRelRelation}
                    onChange={(e) => setNewRelRelation(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white font-medium"
                  >
                    <option>Spouse</option>
                    <option>Child</option>
                    <option>Parent</option>
                    <option>Colleague</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newRelDob}
                    onChange={(e) => setNewRelDob(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Passport Number (e.g. UK182901)"
                    value={newRelPassport}
                    onChange={(e) => setNewRelPassport(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white font-mono uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6d3cc7] text-white font-bold hover:bg-[#5426a5]"
                >
                  + Save Relative Profile
                </button>
              </form>
            </div>
          )}

          {activeTab === 'SUBSCRIPTION' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800">Account Membership Category</h4>
                <p className="text-[11px] text-slate-500">
                  Upgrade your subscription from Individual to Family or Corporate plan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'INDIVIDUAL_USER',
                    name: 'Individual Membership',
                    desc: 'Book personal flights for yourself & individual pet travel.',
                    price: 'Standard Plan',
                  },
                  {
                    id: 'FAMILY_USER',
                    name: 'Family Tier Upgrade',
                    desc: 'Manage unlimited relatives, family booking discounts & pooled baggage.',
                    price: '£49 / mo',
                  },
                  {
                    id: 'CORPORATE_USER',
                    name: 'Corporate & Charter Tier',
                    desc: 'Charter entire Cessna Caravan aircraft, company billing & manager delegation.',
                    price: '£199 / mo',
                  },
                ].map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setRole(plan.id as any)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      role === plan.id
                        ? 'border-[#6d3cc7] bg-purple-50/50 shadow'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">{plan.name}</span>
                      {role === plan.id && <CheckCircle2 className="w-4 h-4 text-[#6d3cc7]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">{plan.desc}</p>
                    <span className="font-mono font-bold text-xs text-[#6d3cc7]">{plan.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-200"
          >
            Skip for now
          </button>
          <button
            onClick={handleSaveProfile}
            className="px-6 py-2.5 rounded-xl bg-[#6d3cc7] hover:bg-[#5426a5] text-white font-bold shadow transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Profile & Complete
          </button>
        </div>
      </div>
    </div>
  );
};
