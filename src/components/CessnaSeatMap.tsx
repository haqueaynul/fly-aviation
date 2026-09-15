import React, { useState } from 'react';
import { SeatInfo, PetInfo } from '../types';
import { CESSNA_SEATS } from '../data/mockData';
import { Dog, ShieldCheck, Check, Sparkles, AlertCircle, Info, Wind } from 'lucide-react';

interface CessnaSeatMapProps {
  selectedSeatIds: string[];
  bookedSeatIds: string[]; // 2h held
  reservedSeatIds: string[]; // Paid
  pets: PetInfo[];
  onToggleSeat: (seatId: string) => void;
  onAssignPetZone?: (zone: 'CRATE_BAY_1' | 'CRATE_BAY_2' | 'UNDER_SEAT', petIndex: number) => void;
  aircraftRegistration: string;
}

export const CessnaSeatMap: React.FC<CessnaSeatMapProps> = ({
  selectedSeatIds,
  bookedSeatIds,
  reservedSeatIds,
  pets,
  onToggleSeat,
  aircraftRegistration,
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<SeatInfo | null>(null);

  const getSeatStatus = (seatId: string): 'AVAILABLE' | 'SELECTED' | 'HELD' | 'RESERVED' => {
    if (selectedSeatIds.includes(seatId)) return 'SELECTED';
    if (reservedSeatIds.includes(seatId)) return 'RESERVED';
    if (bookedSeatIds.includes(seatId)) return 'HELD';
    return 'AVAILABLE';
  };

  return (
    <div id="cessna-seat-map-container" className="w-full bg-[#6d3cc7]/[0.04] rounded-3xl p-6 sm:p-7 text-slate-800 border border-[#6d3cc7]/20 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#6d3cc7]/15 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6d3cc7]/10 text-[#6d3cc7] border border-[#6d3cc7]/25">
              Cessna 208B Grand Caravan EX
            </span>
            <span className="font-mono text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold tracking-wider">
              {aircraftRegistration}
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">Executive 8-Passenger & Pet Cabin</h3>
          <p className="text-xs text-slate-500">Turboprop Pratt & Whitney PT6A-140 | 1-1 Island Executive Club Seating</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-white border-2 border-slate-300"></div>
            <span className="text-slate-700 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#6d3cc7] border border-[#582cb0] shadow-sm shadow-[#6d3cc7]/40"></div>
            <span className="text-[#6d3cc7] font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-100 border border-amber-400"></div>
            <span className="text-amber-800 font-semibold">2h Held</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200 opacity-75"></div>
            <span className="text-slate-400 line-through">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-400 flex items-center justify-center">
              <Dog className="w-2.5 h-2.5 text-emerald-700" />
            </div>
            <span className="text-emerald-700 font-semibold">Pet Climate Bay</span>
          </div>
        </div>
      </div>

      {/* Cabin Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Aircraft Canvas */}
        <div className="lg:col-span-8 flex justify-center py-4 overflow-x-auto">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 border-2 border-[#6d3cc7]/25 shadow-lg">
            {/* Nose & Radome */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-8 bg-[#6d3cc7]/10 rounded-t-full border-t border-x border-[#6d3cc7]/20 flex items-center justify-center">
                <span className="text-[10px] uppercase font-mono text-[#6d3cc7] font-bold tracking-widest">NOSE</span>
              </div>
              {/* Windshield */}
              <div className="w-44 h-8 bg-gradient-to-b from-sky-100 to-sky-50 border-x border-t border-sky-300 rounded-t-xl flex items-center justify-around px-4">
                <div className="w-12 h-3 bg-sky-200/80 rounded-t border border-sky-300"></div>
                <div className="w-12 h-3 bg-sky-200/80 rounded-t border border-sky-300"></div>
              </div>
            </div>

            {/* Flight Deck / Cockpit */}
            <div className="bg-[#6d3cc7]/[0.03] border border-[#6d3cc7]/15 rounded-2xl p-3 mb-6">
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[10px] text-slate-700 font-bold font-mono">
                    CAPT
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1">Pilot in Cmd</span>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-mono text-emerald-700 font-bold flex items-center justify-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    GARMIN G1000 NXi
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">PT6A-140 Active</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[10px] text-slate-700 font-bold font-mono">
                    F/O
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1">First Officer</span>
                </div>
              </div>
              <div className="text-center mt-2 border-t border-slate-200 pt-1.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Cockpit Bulkhead Partition</span>
              </div>
            </div>

            {/* Passenger Cabin - Rows 1 to 4 */}
            <div className="space-y-4 px-2">
              {[1, 2, 3, 4].map((rowNum) => {
                const seatA = CESSNA_SEATS.find((s) => s.row === rowNum && s.label.endsWith('A'));
                const seatB = CESSNA_SEATS.find((s) => s.row === rowNum && s.label.endsWith('B'));

                const renderSeatBtn = (seat?: SeatInfo) => {
                  if (!seat) return null;
                  const status = getSeatStatus(seat.id);
                  const isAvailable = status === 'AVAILABLE' || status === 'SELECTED';

                  let btnStyle = 'bg-white text-slate-800 border-slate-200 hover:border-[#6d3cc7] hover:bg-[#6d3cc7]/[0.06] hover:shadow-md';
                  if (status === 'SELECTED') {
                    btnStyle = 'bg-[#6d3cc7] text-white border-[#582cb0] ring-2 ring-[#6d3cc7]/40 shadow-lg shadow-[#6d3cc7]/30';
                  } else if (status === 'HELD') {
                    btnStyle = 'bg-amber-50 text-amber-800 border-amber-300 cursor-not-allowed';
                  } else if (status === 'RESERVED') {
                    btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed';
                  }

                  return (
                    <button
                      key={seat.id}
                      id={`seat-btn-${seat.id}`}
                      disabled={!isAvailable}
                      onClick={() => onToggleSeat(seat.id)}
                      onMouseEnter={() => setHoveredSeat(seat)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      className={`relative w-14 h-16 rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all duration-150 group ${btnStyle}`}
                      title={`Seat ${seat.label} - ${status}`}
                    >
                      {/* Headrest */}
                      <div className={`w-8 h-2 rounded-t-sm ${status === 'SELECTED' ? 'bg-white/20' : 'bg-slate-200'}`}></div>
                      
                      {/* Seat Label */}
                      <div className="flex items-center gap-0.5">
                        <span className="font-bold text-sm font-mono">{seat.label}</span>
                        {status === 'SELECTED' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>

                      {/* Seat Attributes */}
                      <div className="flex items-center gap-1">
                        {seat.type === 'PET_FRIENDLY' && (
                          <Dog className={`w-3 h-3 ${status === 'SELECTED' ? 'text-white' : 'text-emerald-600'}`} />
                        )}
                        <span className="text-[9px] opacity-75 font-mono">{seat.pitchInches}"</span>
                      </div>

                      {/* Status Tag for Held */}
                      {status === 'HELD' && (
                        <span className="absolute -top-2 bg-amber-500 text-white font-black text-[8px] px-1 rounded-full shadow-xs">
                          2h HOLD
                        </span>
                      )}
                    </button>
                  );
                };

                return (
                  <div key={rowNum} className="flex items-center justify-between px-2">
                    {/* Window Left */}
                    <div className="w-2 h-8 bg-sky-200/80 rounded-full border border-sky-300"></div>
                    
                    {/* Seat A */}
                    {renderSeatBtn(seatA)}

                    {/* Aisle */}
                    <div className="flex flex-col items-center justify-center px-4">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">ROW {rowNum}</span>
                      <div className="h-6 w-0.5 border-r border-dashed border-slate-300 my-1"></div>
                    </div>

                    {/* Seat B */}
                    {renderSeatBtn(seatB)}

                    {/* Window Right */}
                    <div className="w-2 h-8 bg-sky-200/80 rounded-full border border-sky-300"></div>
                  </div>
                );
              })}
            </div>

            {/* Aft Section: Climate Controlled Pet Crate Bays */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Dog className="w-3.5 h-3.5 text-emerald-600" /> Aft Pet Climate Bays
                </span>
                <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <Wind className="w-3 h-3 text-sky-500" /> 19.5°C Climate Controlled
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-300 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900">CRATE BAY 1</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                      Max 25kg
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {pets.length > 0 ? (
                      <span className="text-emerald-700 font-bold">Assigned: {pets[0]?.name || 'Pet 1'}</span>
                    ) : (
                      'Available for dog/cat carrier'
                    )}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-300 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900">CRATE BAY 2</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                      Max 25kg
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {pets.length > 1 ? (
                      <span className="text-emerald-700 font-bold">Assigned: {pets[1]?.name || 'Pet 2'}</span>
                    ) : (
                      'Available for dog/cat carrier'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Tail */}
            <div className="flex justify-center mt-4">
              <div className="w-12 h-6 bg-[#6d3cc7]/10 rounded-b-xl border-b border-x border-[#6d3cc7]/20 flex items-center justify-center">
                <span className="text-[9px] font-mono text-[#6d3cc7] font-bold">TAIL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tooltip & Selection Summary */}
        <div className="lg:col-span-4 space-y-4">
          {hoveredSeat ? (
            <div className="p-5 rounded-2xl bg-white border border-[#6d3cc7]/25 shadow-sm text-left transition-all">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900 font-mono">Seat {hoveredSeat.label}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#6d3cc7] text-white font-bold">
                  Executive Class
                </span>
              </div>
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Pitch / Legroom:</span>
                  <span className="font-bold text-slate-900">{hoveredSeat.pitchInches} inches</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Seat Configuration:</span>
                  <span className="font-bold text-slate-900">Solo Window / Direct Aisle</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Pet Policy:</span>
                  <span className="font-bold text-emerald-700">
                    {hoveredSeat.type === 'PET_FRIENDLY' ? 'Under-seat tether authorized' : 'Climate Bay in Aft'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className="font-bold text-[#6d3cc7]">
                    {getSeatStatus(hoveredSeat.id)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white border border-[#6d3cc7]/20 shadow-xs text-left text-xs text-slate-600">
              <div className="flex items-center gap-2 text-[#6d3cc7] font-bold mb-1.5">
                <Info className="w-4 h-4 text-[#6d3cc7]" /> Hover over a seat to inspect
              </div>
              <p className="leading-relaxed">Click available seats to select. The Cessna 208B features generous 36"-40" pitch club seats and dedicated climate-controlled pet accommodations.</p>
            </div>
          )}

          {/* Current Selection summary box */}
          <div className="p-5 rounded-2xl bg-white border border-[#6d3cc7]/25 shadow-sm text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">Selected Seats</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {selectedSeatIds.length} of 8 Max
              </span>
            </div>
            {selectedSeatIds.length === 0 ? (
              <p className="text-xs text-slate-400">Please choose at least 1 seat to proceed with booking.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSeatIds.map((sid) => (
                  <span
                    key={sid}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#6d3cc7] text-white font-mono font-bold text-xs shadow-xs"
                  >
                    Seat {sid}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSeat(sid);
                      }}
                      className="ml-0.5 hover:text-red-200 text-purple-200 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Pet Travelling info */}
            {pets.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Dog className="w-3.5 h-3.5 text-emerald-600" /> {pets.length} Pet(s) Accommodated
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Climate crate bays reserved in Aft section with fresh air exchange and temperature sensors.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
