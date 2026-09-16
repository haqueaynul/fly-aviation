import React, { useState } from 'react';
import { RegularFlight } from '../../types';
import { Clock, AlertTriangle, XCircle, CheckCircle, Send, X, Info } from 'lucide-react';

interface FlightStatusDispatchModalProps {
  flight: RegularFlight | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    flightId: string,
    status: RegularFlight['status'],
    remark?: string,
    delayMinutes?: number,
    delayReason?: string,
    estimatedDepartureTime?: string
  ) => void;
}

const COMMON_DELAY_REASONS = [
  'Channel Islands Sea Fog / Low Visibility Minima',
  'Crosswinds Gusting > 25kts at Alderney (ACI)',
  'London Control / Southampton ATC Slot Delay',
  'Aircraft Turnaround & TKS De-icing Fluid Replenishment',
  'Engineering Pre-Flight Avionics Verification',
  'Connecting Passenger & Cargo Transfer Delay',
];

const CANCELLATION_REASONS = [
  'Severe Weather & Island Wind Shear Exceeding Aircraft Limits',
  'Alderney / Jersey Runway Surface Flooding',
  'Technical Aircraft on Ground (AOG) - Maintenance Required',
  'Island Airfield Unscheduled Operational Closure',
];

export const FlightStatusDispatchModal: React.FC<FlightStatusDispatchModalProps> = ({
  flight,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !flight) return null;

  const [status, setStatus] = useState<RegularFlight['status']>(flight.status || 'ON_TIME');
  const [delayMinutes, setDelayMinutes] = useState<number>(flight.delayMinutes || 30);
  const [delayReason, setDelayReason] = useState<string>(
    flight.delayReason || COMMON_DELAY_REASONS[0]
  );
  const [cancellationReason, setCancellationReason] = useState<string>(
    flight.statusRemark || CANCELLATION_REASONS[0]
  );
  const [customRemark, setCustomRemark] = useState<string>(flight.statusRemark || '');

  // Calculate estimated departure time
  const calculateETD = (originalDep: string, minutes: number): string => {
    try {
      const [h, m] = originalDep.split(':').map(Number);
      const totalMin = h * 60 + m + minutes;
      const newH = Math.floor(totalMin / 60) % 24;
      const newM = totalMin % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    } catch {
      return originalDep;
    }
  };

  const calculatedETD =
    status === 'DELAYED'
      ? calculateETD(flight.departureTime, delayMinutes)
      : flight.departureTime;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalRemark = customRemark;
    if (status === 'ON_TIME') {
      finalRemark = customRemark || 'Operating on normal schedule';
    } else if (status === 'DELAYED') {
      finalRemark = `Delayed ${delayMinutes}m: ${delayReason}${customRemark ? ` — ${customRemark}` : ''}`;
    } else if (status === 'CANCELLED') {
      finalRemark = `Flight Cancelled: ${cancellationReason}${customRemark ? ` — ${customRemark}` : ''}`;
    }

    onUpdateStatus(
      flight.id,
      status,
      finalRemark,
      status === 'DELAYED' ? delayMinutes : undefined,
      status === 'DELAYED' ? delayReason : undefined,
      status === 'DELAYED' ? calculatedETD : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Tenant Dispatch Console
            </span>
            <h3 className="text-lg font-bold">
              Update Flight Status: {flight.flightNumber}
            </h3>
            <p className="text-xs text-slate-400">
              {flight.fromCode} → {flight.toCode} • Scheduled Departure:{' '}
              <span className="font-mono text-white">{flight.departureTime}</span> • Reg:{' '}
              {flight.aircraftRegistration}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Status Selection Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Operational Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('ON_TIME')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  status === 'ON_TIME'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>On Time</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('DELAYED')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  status === 'DELAYED'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Delayed</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('CANCELLED')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  status === 'CANCELLED'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Cancelled</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('BOARDING')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                  status === 'BOARDING'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold ring-2 ring-blue-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>Boarding</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('IN_FLIGHT')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                  status === 'IN_FLIGHT'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>In Flight</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('COMPLETED')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                  status === 'COMPLETED'
                    ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold ring-2 ring-purple-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>Completed</span>
              </button>
            </div>
          </div>

          {/* Delayed details section */}
          {status === 'DELAYED' && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Delay Parameters
                </span>
                <span className="text-xs font-mono font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                  ETD: {calculatedETD} (+{delayMinutes}m)
                </span>
              </div>

              {/* Delay Duration Presets */}
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                  Delay Duration
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDelayMinutes(mins)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-bold transition ${
                        delayMinutes === mins
                          ? 'bg-amber-600 text-white'
                          : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      +{mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Delay Reason */}
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                  Operational Delay Cause
                </label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full text-xs bg-white border border-amber-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {COMMON_DELAY_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Cancelled details section */}
          {status === 'CANCELLED' && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Cancellation Notice & Passenger Protection
              </span>
              <div>
                <label className="block text-[11px] font-semibold text-rose-900 mb-1">
                  Primary Cancellation Cause
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full text-xs bg-white border border-rose-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  {CANCELLATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-rose-700 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                All booked passengers will receive instant re-booking options and automated SMS/email alerts.
              </p>
            </div>
          )}

          {/* Additional Passenger Advisory Remark */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Public Advisory / Dispatch Notes (Optional)
            </label>
            <textarea
              value={customRemark}
              onChange={(e) => setCustomRemark(e.target.value)}
              placeholder="e.g. Passengers advised to remain in Jersey Executive Lounge until gate 1 call."
              rows={2}
              className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              Commit & Broadcast Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
