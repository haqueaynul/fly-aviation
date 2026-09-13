import React, { useState } from 'react';
import { Aircraft, MaintenanceLog } from '../types';
import { Wrench, ShieldAlert, CheckCircle2, Clock, AlertTriangle, FileText, PlusCircle, Activity, Plane, Disc } from 'lucide-react';

interface MaintenanceDashboardProps {
  aircrafts: Aircraft[];
  logs: MaintenanceLog[];
  onAddLog: (newLog: MaintenanceLog) => void;
  userRole: string;
}

export const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({
  aircrafts,
  logs,
  onAddLog,
  userRole,
}) => {
  const [selectedReg, setSelectedReg] = useState<string>('G-ECLP');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for new log
  const [newCategory, setNewCategory] = useState<MaintenanceLog['category']>('PRE_FLIGHT_CHECK');
  const [newDesc, setNewDesc] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newTechName, setNewTechName] = useState('David Le Page (Part 66)');
  const [newStatus, setNewStatus] = useState<MaintenanceLog['status']>('CLEARED_AIRWORTHY');

  const selectedAircraft = aircrafts.find((a) => a.registration === selectedReg) || aircrafts[0];
  const filteredLogs = logs.filter((l) => l.aircraftRegistration === selectedReg);

  const handleSubmitNewLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const log: MaintenanceLog = {
      id: 'MT-' + Math.floor(1000 + Math.random() * 9000),
      aircraftRegistration: selectedReg,
      logDate: new Date().toISOString().split('T')[0],
      logTime: new Date().toTimeString().slice(0, 5),
      category: newCategory,
      flightHours: selectedAircraft.totalFlightHours + 1.2,
      engineCycles: selectedAircraft.engineCycles + 2,
      description: newDesc,
      technicianName: newTechName,
      technicianLicense: 'UK.PART66.B1.B2.4920',
      status: newStatus,
      actionTaken: newAction || 'Standard maintenance procedure executed according to Cessna Caravan AMM.',
    };

    onAddLog(log);
    setNewDesc('');
    setNewAction('');
    setShowAddModal(false);
  };

  return (
    <div id="maintenance-dashboard" className="space-y-6">
      {/* Fleet Top Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
            Airworthiness & Engineering Division
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Cessna 208B Fleet Technical Logs
          </h2>
          <p className="text-xs text-slate-500">
            Real-time PT6A-140 turbine cycles, airframe flight hours, and EASA/CAA Part 66 engineer sign-offs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {aircrafts.map((ac) => (
            <button
              key={ac.registration}
              onClick={() => setSelectedReg(ac.registration)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedReg === ac.registration
                  ? 'bg-[#6d3cc7] text-white shadow-lg shadow-purple-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Plane className="w-4 h-4" />
              <span>{ac.registration}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-mono">
                {ac.status}
              </span>
            </button>
          ))}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add Maintenance Log
          </button>
        </div>
      </div>

      {/* Selected Aircraft Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 block">AIRCRAFT MODEL</span>
          <h3 className="text-lg font-bold text-slate-800">{selectedAircraft.model}</h3>
          <p className="text-xs text-slate-500 font-mono">{selectedAircraft.engine}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Airworthy for Line Flight
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Airframe Flight Hours</span>
            <Clock className="w-3.5 h-3.5 text-[#6d3cc7]" />
          </div>
          <span className="text-2xl font-black font-mono text-slate-800">
            {selectedAircraft.totalFlightHours.toFixed(1)} <span className="text-xs text-slate-400 font-sans">HRS</span>
          </span>
          <div className="mt-2 text-[10px] text-slate-500">
            Next 100-Hr Check due in: <strong className="text-purple-700 font-mono">{(selectedAircraft.nextScheduledCheckHours - selectedAircraft.totalFlightHours).toFixed(1)} hrs</strong>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>PT6A Turbine Engine Cycles</span>
            <Disc className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-2xl font-black font-mono text-slate-800">
            {selectedAircraft.engineCycles} <span className="text-xs text-slate-400 font-sans">CYCLES</span>
          </span>
          <div className="mt-2 text-[10px] text-slate-500">
            Turbine rinse interval: <strong className="text-emerald-700">Satisfactory</strong>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Base & Cabin Fit</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="text-base font-bold text-slate-800">
            Base: {selectedAircraft.baseAirport} (Hub)
          </span>
          <div className="mt-1 text-xs text-slate-600">
            8 Executive Seats + 2 Pet Bays
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Last Periodic Inspection: {selectedAircraft.lastInspectionDate}
          </div>
        </div>
      </div>

      {/* Maintenance Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#6d3cc7]" />
            <h3 className="font-bold text-slate-800 text-base">
              Technical Log Entries for {selectedAircraft.registration}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredLogs.length} Verified Entries
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {log.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      log.category === 'PRE_FLIGHT_CHECK'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : log.category === '100_HOUR_INSPECTION'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {log.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {log.logDate} {log.logTime} BST
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">
                    TT: {log.flightHours.toFixed(1)} hrs | {log.engineCycles} cyc
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      log.status === 'CLEARED_AIRWORTHY'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {log.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold text-slate-800">{log.description}</p>
              <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                <span className="font-bold text-slate-700 block mb-0.5">Corrective Action Taken:</span>
                {log.actionTaken}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Certified Technician: <strong className="text-slate-700">{log.technicianName}</strong></span>
                <span className="font-mono text-[11px]">License: {log.technicianLicense}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Maintenance Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#6d3cc7]" /> New Technical Maintenance Log
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitNewLog} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Aircraft Registration</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedReg} (${selectedAircraft.model})`}
                  className="w-full h-10 px-3 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inspection Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium"
                  >
                    <option value="PRE_FLIGHT_CHECK">Pre-Flight Check</option>
                    <option value="100_HOUR_INSPECTION">100-Hour Inspection</option>
                    <option value="AVIONICS">Avionics & Garmin G1000</option>
                    <option value="ENGINE_PT6A">Engine PT6A Turbine</option>
                    <option value="SQUAWK_DEFECT">Squawk / Defect Rectification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Airworthiness Clearance</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium"
                  >
                    <option value="CLEARED_AIRWORTHY">Cleared Airworthy</option>
                    <option value="DEFERRED_MEL">Deferred under MEL</option>
                    <option value="GROUNDED_AOG">Aircraft on Ground (AOG)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Defect / Inspection Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe items inspected or defect reported..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6d3cc7]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Maintenance Action Taken</label>
                <textarea
                  rows={2}
                  placeholder="Details of corrective action, parts replaced, or sign-off test..."
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6d3cc7]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Certifying Engineer (Part 66)</label>
                <input
                  type="text"
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6d3cc7] hover:bg-[#5426a5] text-white font-bold shadow"
                >
                  Submit & Sign Technical Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
