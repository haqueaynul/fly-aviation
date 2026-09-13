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
    <div id="cessna-seat-map-container" className="w-full bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6d3cc7]/30 text-[#cbb2ff] border border-[#6d3cc7]/50">
              Cessna 208B Grand Caravan EX
            </span>
            <span className="font-mono text-xs text-amber-400 font-semibold tracking-wider">
              {aircraftRegistration}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Executive 8-Passenger & Pet Cabin</h3>
          <p className="text-xs text-slate-400">Turboprop Pratt & Whitney PT6A-140 | 1-1 Island Executive Club Seating</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-800 border border-slate-600"></div>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#6d3cc7] border border-[#a882f7] shadow-sm shadow-[#6d3cc7]"></div>
            <span className="text-white font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/60"></div>
            <span className="text-amber-300">2h Held</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-700/50 border border-slate-700 opacity-60"></div>
            <span className="text-slate-500 line-through">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <div className="w-4 h-4 rounded bg-emerald-950/80 border border-emerald-500 flex items-center justify-center">
              <Dog className="w-2.5 h-2.5 text-emerald-400" />
            </div>
            <span className="text-emerald-400">Pet Climate Bay</span>
          </div>
        </div>
      </div>

      {/* Cabin Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Aircraft Canvas */}
        <div className="lg:col-span-8 flex justify-center py-4 overflow-x-auto">
          <div className="relative w-full max-w-sm bg-slate-950 rounded-3xl p-6 border-2 border-slate-800/80 shadow-2xl">
            {/* Nose & Radome */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-8 bg-slate-800 rounded-t-full border-t border-x border-slate-700 flex items-center justify-center">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-widest">NOSE</span>
              </div>
              {/* Windshield */}
              <div className="w-44 h-8 bg-gradient-to-b from-sky-950/60 to-slate-900 border-x border-t border-sky-600/40 rounded-t-xl flex items-center justify-around px-4">
                <div className="w-12 h-3 bg-sky-400/20 rounded-t border border-sky-400/40"></div>
                <div className="w-12 h-3 bg-sky-400/20 rounded-t border border-sky-400/40"></div>
              </div>
            </div>

            {/* Flight Deck / Cockpit */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-6">
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    CAPT
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Pilot in Cmd</span>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    GARMIN G1000 NXi
                  </div>
                  <span className="text-[9px] text-slate-500">PT6A-140 Active</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    F/O
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">First Officer</span>
                </div>
              </div>
              <div className="text-center mt-2 border-t border-slate-800 pt-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500">Cockpit Bulkhead Partition</span>
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

                  let btnStyle = 'bg-slate-800 text-slate-200 border-slate-700 hover:border-purple-400 hover:bg-slate-700/80';
                  if (status === 'SELECTED') {
                    btnStyle = 'bg-[#6d3cc7] text-white border-[#a882f7] ring-2 ring-[#6d3cc7]/50 shadow-lg shadow-[#6d3cc7]/40';
                  } else if (status === 'HELD') {
                    btnStyle = 'bg-amber-950/60 text-amber-300 border-amber-500/70 cursor-not-allowed';
                  } else if (status === 'RESERVED') {
                    btnStyle = 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed';
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
                      <div className="w-8 h-2 rounded-t-sm bg-black/30"></div>
                      
                      {/* Seat Label */}
                      <div className="flex items-center gap-0.5">
                        <span className="font-bold text-sm font-mono">{seat.label}</span>
                        {status === 'SELECTED' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>

                      {/* Seat Attributes */}
                      <div className="flex items-center gap-1">
                        {seat.type === 'PET_FRIENDLY' && (
                          <Dog className={`w-3 h-3 ${status === 'SELECTED' ? 'text-white' : 'text-emerald-400'}`} />
                        )}
                        <span className="text-[9px] opacity-75 font-mono">{seat.pitchInches}"</span>
                      </div>

                      {/* Status Tag for Held */}
                      {status === 'HELD' && (
                        <span className="absolute -top-2 bg-amber-600 text-black font-extrabold text-[8px] px-1 rounded-full">
                          2h HOLD
                        </span>
                      )}
                    </button>
                  );
                };

                return (
                  <div key={rowNum} className="flex items-center justify-between px-2">
                    {/* Window Left */}
                    <div className="w-2 h-8 bg-sky-400/20 rounded-full border border-sky-400/30"></div>
                    
                    {/* Seat A */}
                    {renderSeatBtn(seatA)}

                    {/* Aisle */}
                    <div className="flex flex-col items-center justify-center px-4">
                      <span className="text-[10px] font-mono text-slate-500">ROW {rowNum}</span>
                      <div className="h-6 w-0.5 border-r border-dashed border-slate-700 my-1"></div>
                    </div>

                    {/* Seat B */}
                    {renderSeatBtn(seatB)}

                    {/* Window Right */}
                    <div className="w-2 h-8 bg-sky-400/20 rounded-full border border-sky-400/30"></div>
                  </div>
                );
              })}
            </div>

            {/* Aft Section: Climate Controlled Pet Crate Bays */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Dog className="w-3.5 h-3.5" /> Aft Pet Climate Bays
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-sky-400" /> 19.5°C Climate Controlled
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-300">CRATE BAY 1</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      Max 25kg
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">
                    {pets.length > 0 ? (
                      <span className="text-emerald-300 font-medium">Assigned: {pets[0]?.name || 'Pet 1'}</span>
                    ) : (
                      'Available for dog/cat carrier'
                    )}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-300">CRATE BAY 2</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      Max 25kg
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">
                    {pets.length > 1 ? (
                      <span className="text-emerald-300 font-medium">Assigned: {pets[1]?.name || 'Pet 2'}</span>
                    ) : (
                      'Available for dog/cat carrier'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Tail */}
            <div className="flex justify-center mt-4">
              <div className="w-12 h-6 bg-slate-800 rounded-b-xl border-b border-x border-slate-700 flex items-center justify-center">
                <span className="text-[9px] font-mono text-slate-500">TAIL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tooltip & Selection Summary */}
        <div className="lg:col-span-4 space-y-4">
          {hoveredSeat ? (
            <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-left transition-all">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white font-mono">Seat {hoveredSeat.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#6d3cc7] text-white">
                  Executive Class
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pitch / Legroom:</span>
                  <span className="font-semibold text-white">{hoveredSeat.pitchInches} inches</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seat Configuration:</span>
                  <span className="font-semibold text-white">Solo Window / Direct Aisle</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pet Policy:</span>
                  <span className="font-semibold text-emerald-400">
                    {hoveredSeat.type === 'PET_FRIENDLY' ? 'Under-seat tether authorized' : 'Climate Bay in Aft'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold text-purple-300">
                    {getSeatStatus(hoveredSeat.id)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-left text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
                <Info className="w-4 h-4 text-[#a882f7]" /> Hover over a seat to inspect
              </div>
              <p>Click available seats to select. The Cessna 208B features generous 36"-40" pitch club seats and dedicated climate-controlled pet accommodations.</p>
            </div>
          )}

          {/* Current Selection summary box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#6d3cc7]/20 to-slate-900 border border-[#6d3cc7]/40 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Selected Seats</span>
              <span className="text-xs font-mono font-bold text-[#cbb2ff]">
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
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#6d3cc7] text-white font-mono font-bold text-xs shadow"
                  >
                    Seat {sid}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSeat(sid);
                      }}
                      className="ml-1 hover:text-red-300 text-slate-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Pet Travelling info */}
            {pets.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#6d3cc7]/30 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <Dog className="w-3.5 h-3.5" /> {pets.length} Pet(s) Accommodated
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
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
