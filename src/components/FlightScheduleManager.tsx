import React, { useState } from 'react';
import { RegularFlight } from '../types';
import { Plane, Clock, AlertTriangle, CheckCircle, Edit3, Plus, Bell, RefreshCw } from 'lucide-react';

interface FlightScheduleManagerProps {
  schedules: RegularFlight[];
  onUpdateStatus: (flightId: string, status: RegularFlight['status'], remark?: string) => void;
  userRole: string;
}

export const FlightScheduleManager: React.FC<FlightScheduleManagerProps> = ({
  schedules,
  onUpdateStatus,
  userRole,
}) => {
  const [editingFlight, setEditingFlight] = useState<RegularFlight | null>(null);
  const [editStatus, setEditStatus] = useState<RegularFlight['status']>('ON_TIME');
  const [editRemark, setEditRemark] = useState<string>('');
  const [filterWave, setFilterWave] = useState<'ALL' | 'MORNING' | 'AFTERNOON'>('ALL');

  const canEdit = ['SUPER_ADMIN', 'ADMIN', 'TENANT_ADMIN', 'TENANT_ADMIN_ASSISTANT'].includes(userRole);

  const filtered = schedules.filter((f) => {
    const hour = parseInt(f.departureTime.split(':')[0], 10);
    if (filterWave === 'MORNING') return hour < 13;
    if (filterWave === 'AFTERNOON') return hour >= 13;
    return true;
  });

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlight) return;
    onUpdateStatus(editingFlight.id, editStatus, editRemark);
    setEditingFlight(null);
  };

  return (
    <div id="flight-schedule-manager" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
            Island Network Operations Center (NOC)
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Channel Islands Regular Timetable
          </h2>
          <p className="text-xs text-slate-500">
            Official daily schedule between Jersey, Bournemouth, Alderney, and Guernsey.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => setFilterWave('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterWave === 'ALL' ? 'bg-white text-[#6d3cc7] shadow' : 'text-slate-600'
              }`}
            >
              All Waves ({schedules.length})
            </button>
            <button
              onClick={() => setFilterWave('MORNING')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterWave === 'MORNING' ? 'bg-white text-[#6d3cc7] shadow' : 'text-slate-600'
              }`}
            >
              Morning (07:30 - 11:30)
            </button>
            <button
              onClick={() => setFilterWave('AFTERNOON')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterWave === 'AFTERNOON' ? 'bg-white text-[#6d3cc7] shadow' : 'text-slate-600'
              }`}
            >
              Afternoon (13:30 - 17:30)
            </button>
          </div>
        </div>
      </div>

      {/* Channel Islands Connecting Route Hub Notice */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-5 text-xs text-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-purple-200/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#6d3cc7] text-white">
              <Plane className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-black text-slate-900 text-sm">
                Jersey (JER) ⇄ Bournemouth (BOH) Connecting Route via Alderney (ACI)
              </h4>
              <p className="text-slate-500 text-[11px]">
                Direct sector timetable below. Travel between Jersey and Bournemouth connects via the Alderney transfer hub.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] font-bold px-3 py-1 rounded-full bg-purple-100 text-[#6d3cc7] border border-purple-300">
            2 Sectors • 30m Layover at ACI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-1 flex items-center justify-between">
              <span>Outbound Connection (JER → BOH)</span>
              <span className="font-mono text-slate-500">Total: 1h 45m</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[#6d3cc7]">FE-101</span>
              <span>JER 07:30 → ACI 08:00</span>
              <span className="text-purple-400">→</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[#6d3cc7]">FE-102</span>
              <span>ACI 08:30 → BOH 09:15</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-1 flex items-center justify-between">
              <span>Inbound Connection (BOH → JER)</span>
              <span className="font-mono text-slate-500">Total: 1h 55m</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[#6d3cc7]">FE-203</span>
              <span>BOH 10:00 → ACI 10:45</span>
              <span className="text-purple-400">→</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[#6d3cc7]">FE-204</span>
              <span>ACI 11:30 → JER 11:55</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Flight / Reg</th>
                <th className="py-3.5 px-6">Departure</th>
                <th className="py-3.5 px-6">Route</th>
                <th className="py-3.5 px-6">Arrival</th>
                <th className="py-3.5 px-6">Seats Status</th>
                <th className="py-3.5 px-6">Operational Status</th>
                {canEdit && <th className="py-3.5 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((flight) => (
                <tr key={flight.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-mono">
                    <span className="font-bold text-slate-900 block">{flight.flightNumber}</span>
                    <span className="text-[10px] text-amber-600 font-semibold">{flight.aircraftRegistration}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-sm text-slate-800">{flight.departureTime}</span>
                    <span className="text-[10px] text-slate-400 block">BST Local</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{flight.fromCode}</span>
                      <Plane className="w-3.5 h-3.5 text-[#6d3cc7]" />
                      <span className="font-bold text-slate-900 text-sm">{flight.toCode}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Direct Island Hop</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-sm text-slate-800">{flight.arrivalTime}</span>
                    <span className="text-[10px] text-slate-400 block">Estimated</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-emerald-600">
                      {flight.availableSeatsCount} / 8 Available
                    </span>
                    {flight.bookedSeats.length > 0 && (
                      <span className="text-[10px] text-amber-600 block">
                        ({flight.bookedSeats.length} on 2h hold)
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        flight.status === 'ON_TIME'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : flight.status === 'DELAYED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : flight.status === 'BOARDING'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {flight.status.replace(/_/g, ' ')}
                    </span>
                    {flight.statusRemark && (
                      <span className="text-[10px] text-slate-500 block truncate max-w-xs mt-0.5">
                        {flight.statusRemark}
                      </span>
                    )}
                  </td>

                  {canEdit && (
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setEditingFlight(flight);
                          setEditStatus(flight.status);
                          setEditRemark(flight.statusRemark || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6d3cc7] font-bold text-xs inline-flex items-center gap-1 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Dispatch
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status Modal */}
      {editingFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Dispatch Control: {editingFlight.flightNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingFlight.fromCode} → {editingFlight.toCode} ({editingFlight.aircraftRegistration})
                </p>
              </div>
              <button
                onClick={() => setEditingFlight(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Flight Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  <option value="ON_TIME">ON TIME</option>
                  <option value="BOARDING">BOARDING</option>
                  <option value="DELAYED">DELAYED (Weather / Air Traffic)</option>
                  <option value="IN_FLIGHT">AIRBORNE / IN FLIGHT</option>
                  <option value="LANDED">LANDED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Public Passenger Remark (Triggers WebSocket + Email Alert)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Channel Islands coastal fog delay 20 mins. Boarding gate updated."
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6d3cc7]"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl text-purple-900 text-[11px] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#6d3cc7] shrink-0" />
                <span>
                  All booked passengers on this flight will immediately receive a WebSocket event and MailGun dispatch email.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFlight(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6d3cc7] hover:bg-[#5426a5] text-white font-bold shadow"
                >
                  Broadcast Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
