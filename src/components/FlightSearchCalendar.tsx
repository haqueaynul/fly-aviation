import React, { useState, useEffect } from 'react';
import { RegularFlight, Airport } from '../types';
import { AIRPORTS } from '../data/mockData';
import {
  get5DayScheduleWindow,
  getFlightsForRouteAndDate,
  calculateFlightDuration,
  ScheduleDayMeta,
  addDaysToDate,
} from '../utils/scheduleCalendar';
import {
  Plane,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  ListFilter,
  Dog,
  AlertCircle,
  Tag,
  ShieldCheck,
} from 'lucide-react';

interface FlightSearchCalendarProps {
  origin: string;
  destination: string;
  departureDate: string; // The given search departure date (YYYY-MM-DD)
  selectedFlight: RegularFlight | null;
  onSelectFlight: (flight: RegularFlight) => void;
  allSchedules: RegularFlight[];
  legLabel?: string; // e.g. 'Outbound' or 'Inbound'
  stepNumber?: number; // e.g. 1
  onDateChange?: (newDate: string) => void;
}

export const FlightSearchCalendar: React.FC<FlightSearchCalendarProps> = ({
  origin,
  destination,
  departureDate,
  selectedFlight,
  onSelectFlight,
  allSchedules,
  legLabel = 'Outbound',
  stepNumber = 1,
  onDateChange,
}) => {
  // Currently active date tab in the calendar (defaults to departureDate as requested)
  const [activeDate, setActiveDate] = useState<string>(departureDate);
  // View mode: STRIP (classic top calendar bar + detailed day flights) or MATRIX (5-day side-by-side grid)
  const [viewMode, setViewMode] = useState<'STRIP' | 'MATRIX'>('STRIP');
  // Date shift offset if user clicks < or > to browse earlier/later 5-day windows
  const [windowBaseDate, setWindowBaseDate] = useState<string>(departureDate);

  // Synchronize when the user changes departureDate in the search form
  useEffect(() => {
    setActiveDate(departureDate);
    setWindowBaseDate(departureDate);
  }, [departureDate]);

  const originAirport = AIRPORTS.find((a) => a.code === origin) || {
    code: origin,
    name: origin,
    islandOrCity: origin,
  };
  const destinationAirport = AIRPORTS.find((a) => a.code === destination) || {
    code: destination,
    name: destination,
    islandOrCity: destination,
  };

  // Generate 5-day schedule window (1 day back, 0: departure date, +1, +2, +3, +4 days forward)
  const scheduleDays: ScheduleDayMeta[] = get5DayScheduleWindow(windowBaseDate);

  // Active flights for the currently active tab
  const activeDateFlights = getFlightsForRouteAndDate(origin, destination, activeDate, allSchedules);

  // Handle shift calendar window
  const handleShiftWindow = (days: number) => {
    const newBase = addDaysToDate(windowBaseDate, days);
    setWindowBaseDate(newBase);
    setActiveDate(newBase);
    if (onDateChange) {
      onDateChange(newBase);
    }
  };

  const handleResetToDepartureDate = () => {
    setWindowBaseDate(departureDate);
    setActiveDate(departureDate);
    if (onDateChange) {
      onDateChange(departureDate);
    }
  };

  const handleSelectDate = (day: ScheduleDayMeta) => {
    setActiveDate(day.date);
    if (onDateChange) {
      onDateChange(day.date);
    }
  };

  return (
    <div id={`flight-search-calendar-${legLabel.toLowerCase()}`} className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#6d3cc7] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {stepNumber}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Select {legLabel} Flight: {origin} → {destination}
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-[#6d3cc7] border border-purple-200">
              5-Day Route Calendar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-8">
            {originAirport.name} ({originAirport.code}) to {destinationAirport.name} ({destinationAirport.code}) • Cessna 208B Grand Caravan EX
          </p>
        </div>

        {/* View Mode Toggle & Window Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Shift Days */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleShiftWindow(-1)}
              className="p-1.5 rounded-xl hover:bg-white text-slate-700 transition-all"
              title="Shift schedule 1 day back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetToDepartureDate}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                windowBaseDate === departureDate
                  ? 'bg-white text-[#6d3cc7] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Reset to Departure Date"
            >
              Depart Date
            </button>
            <button
              type="button"
              onClick={() => handleShiftWindow(1)}
              className="p-1.5 rounded-xl hover:bg-white text-slate-700 transition-all"
              title="Shift schedule 1 day forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('STRIP')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'STRIP'
                  ? 'bg-[#6d3cc7] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Calendar Strip</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MATRIX')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'MATRIX'
                  ? 'bg-[#6d3cc7] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">5-Day Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-DAY CALENDAR STRIP */}
      <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/50 to-purple-50/80 p-2.5 sm:p-3.5 rounded-3xl border border-purple-200/90 shadow-sm overflow-hidden">
        <div className="px-2 sm:px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-purple-200/70 mb-2.5">
          <div className="flex items-center gap-2 text-purple-950">
            <CalendarIcon className="w-4 h-4 text-[#6d3cc7]" />
            <span className="font-bold">5-Day Schedule Matrix (1 Day Back & 4 Days Forward)</span>
          </div>
          <div className="text-[11px] text-purple-900/80 font-medium flex items-center gap-1.5">
            <span>Default selected:</span>
            <span className="bg-white text-[#6d3cc7] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-200 shadow-xs">
              {departureDate}
            </span>
          </div>
        </div>

        {/* Calendar Day Cards (Horizontal Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
          {scheduleDays.map((day) => {
            const isSelectedTab = activeDate === day.date;
            const isSearchDeparture = day.date === departureDate;
            const dayFlights = getFlightsForRouteAndDate(origin, destination, day.date, allSchedules);
            const isCurrentFlightDate = selectedFlight?.date === day.date;

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => handleSelectDate(day)}
                className={`relative text-left p-3 sm:p-3.5 rounded-2xl transition-all border flex flex-col justify-between group ${
                  isSelectedTab
                    ? 'bg-gradient-to-b from-[#6d3cc7] to-[#5a2eb8] border-[#4f24a8] text-white shadow-lg ring-2 ring-[#6d3cc7]/40 translate-y-[-1px]'
                    : isSearchDeparture
                    ? 'bg-gradient-to-b from-amber-50 to-orange-50/40 border-2 border-amber-300 text-slate-800 shadow-xs hover:border-amber-400 hover:shadow-md hover:bg-amber-50/80'
                    : 'bg-white hover:bg-purple-50/40 border-purple-100/90 hover:border-purple-300 text-slate-800 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Top badge */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                      isSelectedTab
                        ? 'bg-white/20 text-white'
                        : isSearchDeparture
                        ? 'bg-amber-200/80 text-amber-900 border border-amber-300/80'
                        : 'bg-purple-100/80 text-purple-800 border border-purple-200/50'
                    }`}
                  >
                    {day.label}
                  </span>

                  {isCurrentFlightDate && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300 animate-pulse" title="Flight selected on this date" />
                  )}
                </div>

                {/* Day and Date */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      isSelectedTab ? 'text-purple-200' : isSearchDeparture ? 'text-amber-800' : 'text-purple-900/70'
                    }`}>
                      {day.dayOfWeekShort}
                    </span>
                    <span className={`text-base font-black tracking-tight ${
                      isSelectedTab ? 'text-white' : 'text-slate-900'
                    }`}>
                      {day.formattedDate}
                    </span>
                  </div>

                  {isSearchDeparture && (
                    <div className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 ${
                      isSelectedTab ? 'text-amber-300' : 'text-amber-700'
                    }`}>
                      <span>★ Search Date</span>
                    </div>
                  )}
                </div>

                {/* Available Flight Times for this day */}
                <div className={`mt-2.5 pt-2 border-t ${
                  isSelectedTab ? 'border-white/20' : isSearchDeparture ? 'border-amber-200/70' : 'border-purple-100'
                }`}>
                  <span className={`text-[9px] uppercase tracking-wider font-bold block mb-1 ${
                    isSelectedTab ? 'text-purple-200' : 'text-slate-400'
                  }`}>
                    Flight Times:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dayFlights.length > 0 ? (
                      dayFlights.map((f) => (
                        <span
                          key={f.id}
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors ${
                            isSelectedTab
                              ? 'bg-white/20 text-white border border-white/30'
                              : isSearchDeparture
                              ? 'bg-white text-amber-900 border border-amber-200/80 shadow-xs'
                              : 'bg-purple-50 text-[#6d3cc7] border border-purple-100/90 shadow-xs group-hover:bg-purple-100/70'
                          }`}
                          title={`Departs ${f.departureTime} • Arrives ${f.arrivalTime} (Flight time: ${calculateFlightDuration(f.departureTime, f.arrivalTime)})`}
                        >
                          <Clock className="w-2.5 h-2.5 opacity-70" />
                          {f.departureTime}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No flights</span>
                    )}
                  </div>
                </div>

                {/* Flight summary & Price */}
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
                  isSelectedTab ? 'border-white/20' : isSearchDeparture ? 'border-amber-200/70' : 'border-purple-100'
                }`}>
                  <span className={`font-mono font-medium ${
                    isSelectedTab ? 'text-purple-100' : isSearchDeparture ? 'text-amber-800' : 'text-slate-500'
                  }`}>
                    {dayFlights.length} {dayFlights.length === 1 ? 'option' : 'options'}
                  </span>
                  <span className={`font-black font-mono ${
                    isSelectedTab ? 'text-amber-300' : isSearchDeparture ? 'text-amber-700' : 'text-[#6d3cc7]'
                  }`}>
                    £1,500
                  </span>
                </div>

                {/* Selected Indicator Pill */}
                {isSelectedTab && (
                  <div className="mt-2 text-center bg-white/20 py-0.5 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider">
                    Active View
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* STRIP VIEW: DETAILED SCHEDULE FOR THE SELECTED DATE */}
      {viewMode === 'STRIP' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6d3cc7]" />
              <h4 className="text-sm font-bold text-slate-800">
                Scheduled Flights for <span className="text-[#6d3cc7] font-black">{activeDate}</span> ({activeDateFlights.length} options)
              </h4>
              {activeDate === departureDate && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                  Default Departure Date
                </span>
              )}
            </div>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              All flights operated by FlyEclipse Cessna 208B Fleet
            </span>
          </div>

          {activeDateFlights.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-800">No Scheduled Flights on {activeDate}</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Please select another day from the 5-day calendar above to view available departure slots.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {activeDateFlights.map((flight) => {
                const isSelected = selectedFlight?.id === flight.id || (selectedFlight?.flightNumber === flight.flightNumber && selectedFlight?.date === flight.date);
                const flightDuration = calculateFlightDuration(flight.departureTime, flight.arrivalTime);

                return (
                  <div
                    key={flight.id}
                    onClick={() => onSelectFlight(flight)}
                    className={`cursor-pointer bg-white rounded-3xl p-5 md:p-6 border transition-all flex flex-col gap-4 ${
                      isSelected
                        ? 'border-[#6d3cc7] ring-2 ring-[#6d3cc7]/40 shadow-lg bg-purple-50/30'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm'
                    }`}
                  >
                    {/* Top Row: Primary Flight Timeline & Route */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      {/* Timeline: Departure -> Flight Duration / Route -> Arrival */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-4 sm:gap-8 w-full lg:w-auto">
                        {/* 1. DEPARTURE TIME */}
                        <div className="text-left min-w-[120px]">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">
                              Departure Time
                            </span>
                          </div>
                          <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight block">
                            {flight.departureTime}
                            <span className="text-xs font-semibold text-slate-400 ml-1 font-sans">BST</span>
                          </span>
                          <span className="text-xs text-slate-600 font-bold mt-0.5 block">
                            <span className="font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] mr-1">
                              {flight.fromCode}
                            </span>
                            {originAirport.name}
                          </span>
                        </div>

                        {/* 2. FLIGHT TIME (DURATION) & FLIGHT NUMBER */}
                        <div className="flex flex-col items-center px-2 sm:px-6 my-2 sm:my-0">
                          {/* Dedicated High-Visibility Flight Time Badge */}
                          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100/90 text-[#6d3cc7] font-mono font-black text-xs border border-purple-200 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-[#6d3cc7]" />
                            <span>Flight Time: {flightDuration}</span>
                          </div>

                          {/* Flight Trajectory Graphic */}
                          <div className="w-28 sm:w-36 flex items-center my-2">
                            <div className="h-0.5 w-full bg-slate-300"></div>
                            <Plane className="w-4 h-4 text-[#6d3cc7] mx-1.5 shrink-0" />
                            <div className="h-0.5 w-full bg-slate-300"></div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {flight.flightNumber}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Non-stop
                            </span>
                          </div>
                        </div>

                        {/* 3. ARRIVAL TIME */}
                        <div className="text-left sm:text-right min-w-[120px]">
                          <div className="flex items-center gap-1.5 mb-0.5 sm:justify-end">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">
                              Arrival Time
                            </span>
                            <span className="w-2 h-2 rounded-full bg-[#6d3cc7]"></span>
                          </div>
                          <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight block">
                            {flight.arrivalTime}
                            <span className="text-xs font-semibold text-slate-400 ml-1 font-sans">BST</span>
                          </span>
                          <span className="text-xs text-slate-600 font-bold mt-0.5 block sm:text-right">
                            {destinationAirport.name}
                            <span className="font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] ml-1">
                              {flight.toCode}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Price and Action Button */}
                      <div className="flex items-center justify-between lg:justify-end gap-5 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Base Fare</span>
                          <span className="text-2xl font-black text-[#6d3cc7] font-mono">£1,500</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFlight(flight);
                          }}
                          className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-[#6d3cc7] text-white shadow-md ring-2 ring-[#6d3cc7]/40'
                              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-white" /> Selected {legLabel} Flight
                            </>
                          ) : (
                            `Select ${legLabel} Flight`
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Bottom Metadata & Specs Strip with Explicit Flight Time Indicator */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                        {/* Highlighted Flight Time Box */}
                        <div className="flex items-center gap-1.5 bg-purple-50 text-[#6d3cc7] px-2.5 py-1 rounded-xl font-bold border border-purple-200">
                          <Clock className="w-3.5 h-3.5 text-[#6d3cc7]" />
                          <span>Flight Time: {flightDuration}</span>
                        </div>

                        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                        {/* Date */}
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Date: <strong className="text-slate-800 font-mono">{flight.date}</strong></span>
                        </div>

                        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                        {/* Aircraft */}
                        <div>
                          <span className="text-slate-500">Aircraft: </span>
                          <strong className="text-slate-800">Cessna 208B</strong>{' '}
                          <span className="font-mono text-amber-600 font-bold">({flight.aircraftRegistration})</span>
                        </div>

                        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                        {/* Available Seats */}
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{flight.availableSeatsCount} / 8 Seats Free</span>
                        </div>

                        {/* Pet Bays */}
                        <div className="flex items-center gap-1 text-slate-500">
                          <Dog className="w-3.5 h-3.5 text-emerald-600" />
                          <span>2 Pet Bays Ready</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono hidden md:block">
                        Non-stop Island Transit
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MATRIX VIEW: 5-DAY SIDE-BY-SIDE SCHEDULE GRID */}
      {viewMode === 'MATRIX' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm overflow-x-auto animate-in fade-in duration-200">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#6d3cc7]" />
              Comparative 5-Day Schedule Matrix for Route {origin} → {destination}
            </h4>
            <p className="text-xs text-slate-500">
              Browse and select scheduled Cessna Caravan flights directly across all 5 days simultaneously.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 min-w-[720px]">
            {scheduleDays.map((day) => {
              const dayFlights = getFlightsForRouteAndDate(origin, destination, day.date, allSchedules);
              const isSearchDeparture = day.date === departureDate;

              return (
                <div
                  key={day.date}
                  className={`rounded-2xl border p-3 flex flex-col justify-between ${
                    isSearchDeparture
                      ? 'border-purple-300 bg-purple-50/40 ring-1 ring-purple-200'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  {/* Column Header */}
                  <div className="pb-2 mb-2 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#6d3cc7]">
                        {day.dayOfWeekShort}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {day.formattedDate}
                      </span>
                    </div>
                    {isSearchDeparture && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded block mt-1 text-center">
                        ★ Departure Date
                      </span>
                    )}
                  </div>

                  {/* Flight Cards in Column */}
                  <div className="space-y-2 flex-1">
                    {dayFlights.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">No flights</div>
                    ) : (
                      dayFlights.map((flight) => {
                        const isSelected =
                          selectedFlight?.id === flight.id ||
                          (selectedFlight?.flightNumber === flight.flightNumber && selectedFlight?.date === flight.date);

                        return (
                          <div
                            key={flight.id}
                            onClick={() => onSelectFlight(flight)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#6d3cc7] text-white border-purple-400 shadow'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-mono font-bold">
                              <span>{flight.flightNumber}</span>
                              <span className={isSelected ? 'text-amber-300' : 'text-emerald-600'}>
                                {flight.availableSeatsCount} seats
                              </span>
                            </div>

                            {/* Prominent Flight Time Badge */}
                            <div className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                              isSelected ? 'bg-purple-900/60 text-purple-100 border border-purple-400/40' : 'bg-purple-50 text-[#6d3cc7] border border-purple-200'
                            }`}>
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>Flight Time: {calculateFlightDuration(flight.departureTime, flight.arrivalTime)}</span>
                            </div>

                            {/* Departure & Arrival Times */}
                            <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] font-mono">
                              <div>
                                <span className={`text-[9px] uppercase block font-sans ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>Departs</span>
                                <span className="font-black text-sm">{flight.departureTime}</span>
                              </div>
                              <div className="text-right">
                                <span className={`text-[9px] uppercase block font-sans ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>Arrives</span>
                                <span className="font-black text-sm">{flight.arrivalTime}</span>
                              </div>
                            </div>

                            <div className={`text-[10px] mt-1.5 flex items-center justify-between ${isSelected ? 'text-purple-200' : 'text-slate-500'}`}>
                              <span>{flight.aircraftRegistration}</span>
                              <span className="font-sans font-bold">Non-stop</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectFlight(flight);
                              }}
                              className={`w-full mt-2 py-1 px-2 rounded-lg text-[10px] font-bold transition-all text-center ${
                                isSelected
                                  ? 'bg-white text-[#6d3cc7]'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isSelected ? '✓ Selected' : 'Select'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
