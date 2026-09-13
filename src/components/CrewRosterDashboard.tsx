import React, { useState } from 'react';
import { PilotCrew } from '../types';
import { Users, Award, Calendar, Clock, Plane, ShieldCheck, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

interface CrewRosterDashboardProps {
  crewList: PilotCrew[];
  onUpdateDutyStatus?: (id: string, status: PilotCrew['dutyStatus']) => void;
}

export const CrewRosterDashboard: React.FC<CrewRosterDashboardProps> = ({
  crewList,
  onUpdateDutyStatus,
}) => {
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const filteredCrew = crewList.filter((c) => {
    if (filterRole === 'ALL') return true;
    return c.role === filterRole;
  });

  return (
    <div id="crew-roster-dashboard" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
            Flight Operations & Flight Deck Rostering
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Cessna Caravan Crew Assignments
          </h2>
          <p className="text-xs text-slate-500">
            Channel Islands type ratings, Part-FCL medical validities, and monthly duty-time limitations (FTL)
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Crew' },
            { id: 'CAPTAIN', label: 'Captains' },
            { id: 'FIRST_OFFICER', label: 'First Officers' },
            { id: 'A&P_CHIEF_ENGINEER', label: 'Engineers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterRole === tab.id
                  ? 'bg-[#6d3cc7] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crew Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrew.map((crew) => (
          <div
            key={crew.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Top row: Avatar + Identity */}
              <div className="flex items-center gap-3">
                <img
                  src={crew.photoUrl}
                  alt={crew.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-100 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold font-mono text-[#6d3cc7] bg-purple-50 px-2 py-0.5 rounded">
                      {crew.callsign}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        crew.dutyStatus === 'ON_DUTY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {crew.dutyStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mt-1">{crew.name}</h3>
                  <p className="text-xs text-slate-500">{crew.role.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Badges / Ratings */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">License Number:</span>
                  <span className="font-mono font-bold text-slate-800">{crew.licenseNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Class 1 Medical:</span>
                  <span className="font-medium text-emerald-600">Valid to {crew.medicalExpiry}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Base Station:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#6d3cc7]" /> {crew.baseAirport} (Channel Islands)
                  </span>
                </div>
                {crew.assignedAircraft && (
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Assigned Aircraft:</span>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {crew.assignedAircraft}
                    </span>
                  </div>
                )}
              </div>

              {/* Hours meter */}
              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total TT Hours</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{crew.totalFlightHours}h</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">This Month (FTL)</span>
                  <span className="font-mono font-bold text-[#6d3cc7] text-sm">{crew.hoursThisMonth}h / 100h</span>
                </div>
              </div>

              {/* Ratings tags */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Endorsements & Ratings:</span>
                <div className="flex flex-wrap gap-1">
                  {crew.aircraftRatings.map((rating, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                    >
                      {rating}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick action toggle */}
            {onUpdateDutyStatus && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Quick Duty State:</span>
                <select
                  value={crew.dutyStatus}
                  onChange={(e) => onUpdateDutyStatus(crew.id, e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
                >
                  <option value="ON_DUTY">On Duty</option>
                  <option value="STANDBY">Standby</option>
                  <option value="RESTING">Rest Period</option>
                  <option value="IN_FLIGHT">In Flight</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
