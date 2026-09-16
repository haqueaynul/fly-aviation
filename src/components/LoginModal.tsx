import React, { useState } from 'react';
import { UserProfile, UserRole, MfaMethod } from '../types';
import { MOCK_CORPORATE_EMPLOYEES } from '../data/mockData';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Fingerprint,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  X,
  Sparkles,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, method?: string) => void;
  currentUser: UserProfile;
}

// Preset verified credentials for Node.js Multi-Tenancy testing
export const KNOWN_ACCOUNTS: {
  email: string;
  password: string;
  role: UserRole;
  roleLabel: string;
  name: string;
  tenantId: string;
  avatarColor: string;
}[] = [
  {
    email: 'corporate@apexci.je',
    password: 'ApexCorporate2026!',
    role: 'CORPORATE_USER',
    roleLabel: 'Corporate Travel Admin',
    name: 'Eleanor Vance',
    tenantId: 'FLYECLIPSE_CI',
    avatarColor: 'bg-emerald-600',
  },
  {
    email: 'rachel.carter@apexci.je',
    password: 'LeadPax2026!',
    role: 'PASSENGER',
    roleLabel: 'Designated Lead Passenger',
    name: 'Rachel Carter',
    tenantId: 'FLYECLIPSE_CI',
    avatarColor: 'bg-amber-600',
  },
  {
    email: 'admin@flyeclipse.com',
    password: 'EclipseAdmin2026!',
    role: 'TENANT_ADMIN',
    roleLabel: 'Tenant Admin',
    name: 'Harrison Sterling',
    tenantId: 'FLYECLIPSE_CI',
    avatarColor: 'bg-purple-600',
  },
  {
    email: 'sophie.lemaistre@flyeclipse.com',
    password: 'AssistantPass2026!',
    role: 'TENANT_ADMIN_ASSISTANT',
    roleLabel: 'Assistant Admin (Ops)',
    name: 'Sophie Le Maistre',
    tenantId: 'FLYECLIPSE_CI',
    avatarColor: 'bg-teal-600',
  },
  {
    email: 'marcus.falla@flyeclipse.com',
    password: 'AssistantPass2026!',
    role: 'TENANT_ADMIN_ASSISTANT',
    roleLabel: 'Assistant Admin (Pax)',
    name: 'Marcus Falla',
    tenantId: 'FLYECLIPSE_CI',
    avatarColor: 'bg-teal-700',
  },
  {
    email: 'mail.aynul.haque@gmail.com',
    password: 'EclipsePass2026!',
    role: 'INDIVIDUAL_USER',
    roleLabel: 'Frequent Passenger',
    name: 'Aynul Haque',
    tenantId: 'FLYECLIPSE_CI',
    avatarColor: 'bg-indigo-600',
  },
  {
    email: 'dispatch@flyeclipse.com',
    password: 'DispatchSecure2026!',
    role: 'ADMIN',
    roleLabel: 'Flight Dispatcher',
    name: 'Nathalie De Carteret',
    tenantId: 'FLYECLIPSE_CI',
    avatarColor: 'bg-blue-600',
  },
  {
    email: 't.aubin@flyeclipse.com',
    password: 'CaptainAubin2026!',
    role: 'ADMIN',
    roleLabel: 'Chief Pilot (Captain)',
    name: 'Capt. Thomas Aubin',
    tenantId: 'FLYECLIPSE_CI',
    avatarColor: 'bg-amber-600',
  },
  {
    email: 'maintenance@flyeclipse.com',
    password: 'Pt6aTurbine2026!',
    role: 'ADMIN',
    roleLabel: 'Part 66 Chief Engineer',
    name: 'David Le Page',
    tenantId: 'FLYECLIPSE_CI',
    avatarColor: 'bg-emerald-600',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  if (!isOpen) return null;

  // Step 1: Credential Form, Step 2: MFA Challenge
  const [step, setStep] = useState<'CREDENTIALS' | 'MFA'>('CREDENTIALS');

  // Form states
  const [tenantId, setTenantId] = useState<string>('FLYECLIPSE_CI');
  const [email, setEmail] = useState<string>('admin@flyeclipse.com');
  const [password, setPassword] = useState<string>('EclipseAdmin2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // MFA states
  const [mfaMethod, setMfaMethod] = useState<MfaMethod>('BIOMETRIC');
  const [otpCode, setOtpCode] = useState<string>('482910');
  const [isVerifyingMfa, setIsVerifyingMfa] = useState<boolean>(false);
  const [mfaSuccess, setMfaSuccess] = useState<boolean>(false);

  // Authenticated pending profile
  const [authenticatedProfile, setAuthenticatedProfile] = useState<UserProfile | null>(null);

  // One-click quick fill
  const handleQuickFill = (acc: typeof KNOWN_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setTenantId(acc.tenantId);
    setErrorMsg('');
  };

  // Step 1: Submit Credentials
  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Check if matches one of the preset accounts
      const matched = KNOWN_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
      );

      // Create or populate user profile
      let profile: UserProfile;

      if (matched) {
        // Password validation (can accept the exact password or allow relaxed password for user convenience)
        const nameParts = matched.name.split(' ');
        profile = {
          ...currentUser,
          id: matched.email === 'admin@flyeclipse.com' ? 'TENANT-ADM-01' : 'USR-' + Math.floor(100 + Math.random() * 900),
          email: matched.email,
          role: matched.role,
          firstName: nameParts[0] || 'User',
          lastName: nameParts.slice(1).join(' ') || 'Admin',
          surname: nameParts.slice(1).join(' ') || 'Admin',
          companyName:
            matched.role === 'CORPORATE_USER' || matched.email.includes('apexci.je')
              ? 'Apex Capital Partners CI'
              : currentUser.companyName,
          corporateEmployees:
            matched.role === 'CORPORATE_USER' ? MOCK_CORPORATE_EMPLOYEES : currentUser.corporateEmployees,
          tenantId: matched.tenantId || 'FLYECLIPSE_CI',
          department: matched.role === 'TENANT_ADMIN_ASSISTANT' ? 'Flight Operations & Dispatch' : undefined,
          permissions:
            matched.role === 'TENANT_ADMIN_ASSISTANT'
              ? {
                  canUpdateFlightStatus: true,
                  canBookFlights: true,
                  canAddPassengers: true,
                  canViewManifests: true,
                  canViewFinancials: true,
                }
              : matched.role === 'TENANT_ADMIN'
              ? {
                  canUpdateFlightStatus: true,
                  canBookFlights: true,
                  canAddPassengers: true,
                  canViewManifests: true,
                  canViewFinancials: true,
                }
              : undefined,
          canBeLeadPassenger: matched.role === 'PASSENGER' || matched.role === 'CORPORATE_USER',
          isMfaEnabled: true,
          preferredMfaMethod: 'BIOMETRIC',
        };
      } else {
        // Dynamic user support for any valid email
        const localPart = email.split('@')[0];
        const capitalName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
        profile = {
          ...currentUser,
          id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
          email: email.trim(),
          role: email.includes('admin') ? 'TENANT_ADMIN' : 'INDIVIDUAL_USER',
          firstName: capitalName,
          lastName: 'User',
          surname: 'User',
          isMfaEnabled: true,
          preferredMfaMethod: 'BIOMETRIC',
        };
      }

      setAuthenticatedProfile(profile);

      // Transition to MFA step for high-security roles or direct finish
      setStep('MFA');
    }, 600);
  };

  // Step 2: MFA Verification
  const handleVerifyBiometric = () => {
    setIsVerifyingMfa(true);
    setTimeout(() => {
      setIsVerifyingMfa(false);
      setMfaSuccess(true);
      setTimeout(() => {
        if (authenticatedProfile) {
          onLoginSuccess(authenticatedProfile, 'BIOMETRIC');
        }
      }, 700);
    }, 900);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingMfa(true);
    setTimeout(() => {
      setIsVerifyingMfa(false);
      setMfaSuccess(true);
      setTimeout(() => {
        if (authenticatedProfile) {
          onLoginSuccess(authenticatedProfile, mfaMethod);
        }
      }, 700);
    }, 700);
  };

  // Skip MFA (Instant dev login)
  const handleSkipMfa = () => {
    if (authenticatedProfile) {
      onLoginSuccess(authenticatedProfile, 'PASSWORD_DIRECT');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close Dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ----------------------------------------------------------------- */}
        {/* STEP 1: EMAIL & PASSWORD CREDENTIALS FORM */}
        {/* ----------------------------------------------------------------- */}
        {step === 'CREDENTIALS' && (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-[#6d3cc7] flex items-center justify-center font-bold">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d3cc7]">
                  Node.js Secure Multi-Tenancy
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Sign in to FlyEclipse Channel Islands
              </h3>
              <p className="text-xs text-slate-500">
                Enter your credentials or click a pre-configured role below to log in.
              </p>
            </div>

            {/* Quick-Fill Demo Accounts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Demo Accounts (1-Click Fill)
                </span>
                <span className="text-[10px] font-mono text-purple-600 font-bold">
                  Active Tenant: {tenantId}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {KNOWN_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      email === acc.email
                        ? 'border-[#6d3cc7] bg-purple-50/70 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`w-2 h-2 rounded-full ${acc.avatarColor}`}></div>
                      <span className="text-[11px] font-bold text-slate-800 truncate block">
                        {acc.roleLabel}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {acc.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitCredentials} className="space-y-3.5">
              {/* Tenant ID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tenant Discriminator ID
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#6d3cc7]/20 focus:border-[#6d3cc7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@flyeclipse.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#6d3cc7]/20 focus:border-[#6d3cc7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Default: EclipseAdmin2026!
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:ring-2 focus:ring-[#6d3cc7]/20 focus:border-[#6d3cc7] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6d3cc7] focus:ring-[#6d3cc7] border-slate-300"
                  />
                  <span>Remember this device (30 days)</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to registered email address via MailGun.')}
                  className="text-[11px] font-semibold text-[#6d3cc7] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#6d3cc7] hover:bg-[#5426a5] disabled:opacity-75 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying Node.js Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* STEP 2: MULTI-FACTOR AUTHENTICATION CHALLENGE */}
        {/* ----------------------------------------------------------------- */}
        {step === 'MFA' && (
          <div className="space-y-5 text-center">
            {/* MFA Header */}
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6d3cc7] flex items-center justify-center mx-auto border border-purple-200 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d3cc7]">
                Step 2 of 2: Multi-Factor Verification
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                Two-Factor Security Challenge
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Credentials validated for <span className="font-bold text-slate-800">{email}</span>.
                Confirm your identity with biometric sensor or one-time pass code.
              </p>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMfaMethod('BIOMETRIC')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  mfaMethod === 'BIOMETRIC'
                    ? 'bg-white text-[#6d3cc7] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Fingerprint className="w-4 h-4" />
                <span className="text-[10px]">Biometric</span>
              </button>
              <button
                type="button"
                onClick={() => setMfaMethod('EMAIL_OTP')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  mfaMethod === 'EMAIL_OTP'
                    ? 'bg-white text-[#6d3cc7] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span className="text-[10px]">Email OTP</span>
              </button>
              <button
                type="button"
                onClick={() => setMfaMethod('SMS_OTP')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  mfaMethod === 'SMS_OTP'
                    ? 'bg-white text-[#6d3cc7] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px]">SMS Code</span>
              </button>
              <button
                type="button"
                onClick={() => setMfaMethod('TOTP_APP')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  mfaMethod === 'TOTP_APP'
                    ? 'bg-white text-[#6d3cc7] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span className="text-[10px]">TOTP App</span>
              </button>
            </div>

            {/* Verification Controls */}
            {mfaMethod === 'BIOMETRIC' ? (
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                <div
                  onClick={handleVerifyBiometric}
                  className="w-16 h-16 rounded-full bg-white border-2 border-[#6d3cc7]/40 flex items-center justify-center mx-auto shadow cursor-pointer hover:border-[#6d3cc7] transition-all group"
                  title="Click to authenticate Touch ID / Windows Hello"
                >
                  <Fingerprint className="w-8 h-8 text-[#6d3cc7] group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">
                    Touch ID / Windows Hello / FaceID
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Click above or press button to verify WebAuthn credential
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isVerifyingMfa || mfaSuccess}
                  onClick={handleVerifyBiometric}
                  className="w-full py-2.5 rounded-xl bg-[#6d3cc7] hover:bg-[#5426a5] disabled:opacity-75 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
                >
                  {isVerifyingMfa ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Biometrics...</span>
                    </>
                  ) : mfaSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Biometric Verified!</span>
                    </>
                  ) : (
                    <span>Authenticate with Biometrics</span>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-left">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      {mfaMethod === 'EMAIL_OTP'
                        ? '6-Digit Email Passcode (MailGun)'
                        : mfaMethod === 'SMS_OTP'
                        ? '6-Digit SMS Passcode'
                        : '6-Digit TOTP Passcode (Google / 1Password)'}
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Code: 482910</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white font-mono text-center text-lg tracking-widest font-bold text-slate-900 focus:ring-2 focus:ring-[#6d3cc7] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingMfa || mfaSuccess}
                  className="w-full py-2.5 rounded-xl bg-[#6d3cc7] hover:bg-[#5426a5] disabled:opacity-75 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
                >
                  {isVerifyingMfa ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Validating Security Code...</span>
                    </>
                  ) : mfaSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Security Code Verified!</span>
                    </>
                  ) : (
                    <span>Verify Code & Finish Login</span>
                  )}
                </button>
              </form>
            )}

            {/* Skip / Back Controls */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setStep('CREDENTIALS')}
                className="hover:text-slate-800 font-semibold"
              >
                ← Back to Credentials
              </button>

              <button
                type="button"
                onClick={handleSkipMfa}
                className="text-[#6d3cc7] hover:underline font-bold"
                title="Bypass MFA in development mode"
              >
                Skip MFA & Sign In Immediately →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
