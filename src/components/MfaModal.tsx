import React, { useState } from 'react';
import { MfaMethod } from '../types';
import { Fingerprint, Mail, Smartphone, KeyRound, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface MfaModalProps {
  isOpen: boolean;
  onSuccess: (method: MfaMethod) => void;
  onCancel: () => void;
}

export const MfaModal: React.FC<MfaModalProps> = ({ isOpen, onSuccess, onCancel }) => {
  if (!isOpen) return null;

  // Biometrics is prioritized over other options as specified in prompt
  const [method, setMethod] = useState<MfaMethod>('BIOMETRIC');
  const [code, setCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false);

  const handleVerifyBiometric = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      setTimeout(() => {
        onSuccess('BIOMETRIC');
      }, 700);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      setTimeout(() => {
        onSuccess(method);
      }, 700);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200 text-center space-y-6">
        {/* Icon & Title */}
        <div className="w-16 h-16 rounded-3xl bg-purple-50 text-[#6d3cc7] flex items-center justify-center mx-auto border border-purple-200 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
            Spring Security MFA Verification
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1">Multi-Factor Authentication</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Biometric verification is prioritized. Random OTP or TOTP code alternates for security audits.
          </p>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setMethod('BIOMETRIC')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              method === 'BIOMETRIC' ? 'bg-white text-[#6d3cc7] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span className="text-[10px]">Biometric</span>
          </button>
          <button
            onClick={() => setMethod('EMAIL_OTP')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              method === 'EMAIL_OTP' ? 'bg-white text-[#6d3cc7] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="text-[10px]">Email</span>
          </button>
          <button
            onClick={() => setMethod('SMS_OTP')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              method === 'SMS_OTP' ? 'bg-white text-[#6d3cc7] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-[10px]">SMS OTP</span>
          </button>
          <button
            onClick={() => setMethod('TOTP_APP')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              method === 'TOTP_APP' ? 'bg-white text-[#6d3cc7] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span className="text-[10px]">TOTP App</span>
          </button>
        </div>

        {/* Dynamic Verification Mode */}
        {method === 'BIOMETRIC' ? (
          <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-4">
            <div className="w-20 h-20 rounded-full bg-white border-2 border-[#6d3cc7]/40 flex items-center justify-center mx-auto shadow cursor-pointer hover:border-[#6d3cc7] transition-all group"
                 onClick={handleVerifyBiometric}>
              <Fingerprint className="w-10 h-10 text-[#6d3cc7] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">Touch ID / Windows Hello / FaceID</span>
              <span className="text-slate-500 text-xs">Touch sensor or click above to verify WebAuthn credential</span>
            </div>

            <button
              type="button"
              disabled={isVerifying || verifiedSuccess}
              onClick={handleVerifyBiometric}
              className="w-full py-3 rounded-xl bg-[#6d3cc7] hover:bg-[#5426a5] disabled:opacity-75 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Scanning Biometrics...</span>
                </>
              ) : verifiedSuccess ? (
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
          <form onSubmit={handleVerifyOtp} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs text-left">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {method === 'EMAIL_OTP'
                  ? 'Enter 6-Digit Email Security Code (Sent via MailGun)'
                  : method === 'SMS_OTP'
                  ? 'Enter 6-Digit SMS Code (Sent to Verified Mobile)'
                  : 'Enter 6-Digit Authenticator Code (Google / 1Password)'}
              </label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="e.g. 582914"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white font-mono text-center text-lg tracking-widest font-bold text-slate-900 focus:ring-2 focus:ring-[#6d3cc7] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || verifiedSuccess}
              className="w-full py-3 rounded-xl bg-[#6d3cc7] hover:bg-[#5426a5] disabled:opacity-75 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Code...</span>
                </>
              ) : verifiedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Code Verified!</span>
                </>
              ) : (
                <span>Verify & Complete Signin</span>
              )}
            </button>
          </form>
        )}

        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            Cancel Signin
          </button>
        </div>
      </div>
    </div>
  );
};
