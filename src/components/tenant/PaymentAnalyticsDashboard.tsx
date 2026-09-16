import React, { useState, useMemo } from 'react';
import { Booking, RegularFlight } from '../../types';
import {
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  Filter,
  CheckCircle,
  Clock,
  RotateCcw,
  Plane,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface PaymentAnalyticsDashboardProps {
  bookings: Booking[];
  schedules: RegularFlight[];
}

export const PaymentAnalyticsDashboard: React.FC<PaymentAnalyticsDashboardProps> = ({
  bookings,
  schedules,
}) => {
  const [activeGrouping, setActiveGrouping] = useState<'MONTH' | 'WEEK' | 'DAY' | 'FLIGHT'>('MONTH');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'REFUNDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'ALL' && b.paymentStatus !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchPnr = b.pnr.toLowerCase().includes(q);
        const matchRef = b.referenceNumber.toLowerCase().includes(q);
        const matchFlight = b.flightNumber.toLowerCase().includes(q);
        const matchLead = b.leadPassengerName?.toLowerCase().includes(q);
        return matchPnr || matchRef || matchFlight || matchLead;
      }
      return true;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Overall Financial KPIs
  const metrics = useMemo(() => {
    let grossPaid = 0;
    let totalRefunds = 0;
    let pendingAmount = 0;
    let paidBookingsCount = 0;
    let totalPassengers = 0;

    bookings.forEach((b) => {
      if (b.paymentStatus === 'PAID') {
        grossPaid += b.totalFare;
        paidBookingsCount += 1;
        totalPassengers += b.passengers.length;
      } else if (b.paymentStatus === 'REFUNDED') {
        totalRefunds += b.refundAmount || b.totalFare;
      } else if (b.paymentStatus === 'PENDING') {
        pendingAmount += b.totalFare;
      }
    });

    const netRevenue = grossPaid - totalRefunds;
    const avgYield = totalPassengers > 0 ? Math.round(grossPaid / totalPassengers) : 0;

    return {
      grossPaid,
      totalRefunds,
      pendingAmount,
      netRevenue,
      paidBookingsCount,
      totalPassengers,
      avgYield,
    };
  }, [bookings]);

  // Helper to get week number (ISO)
  const getISOWeek = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const target = new Date(date.valueOf());
      const dayNr = (date.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
      }
      const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
      return `Week ${weekNum} (${date.getFullYear()})`;
    } catch {
      return 'Week N/A';
    }
  };

  // Helper to format month
  const getMonthKey = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    } catch {
      return 'Unknown Month';
    }
  };

  // Grouping 1: BY MONTH
  const monthData = useMemo(() => {
    const map: Record<
      string,
      {
        monthLabel: string;
        grossRevenue: number;
        refunds: number;
        netRevenue: number;
        bookingCount: number;
        passengerCount: number;
        flights: Set<string>;
      }
    > = {};

    filteredBookings.forEach((b) => {
      const dateStr = b.departureDate || b.bookingCreatedAt || '2026-09-14';
      const key = getMonthKey(dateStr);
      if (!map[key]) {
        map[key] = {
          monthLabel: key,
          grossRevenue: 0,
          refunds: 0,
          netRevenue: 0,
          bookingCount: 0,
          passengerCount: 0,
          flights: new Set(),
        };
      }
      if (b.paymentStatus === 'PAID') {
        map[key].grossRevenue += b.totalFare;
        map[key].bookingCount += 1;
        map[key].passengerCount += b.passengers.length;
        map[key].flights.add(b.flightNumber);
      } else if (b.paymentStatus === 'REFUNDED') {
        map[key].refunds += b.refundAmount || b.totalFare;
      }
      map[key].netRevenue = map[key].grossRevenue - map[key].refunds;
    });

    return Object.values(map).sort((a, b) => b.grossRevenue - a.grossRevenue);
  }, [filteredBookings]);

  // Grouping 2: BY WEEK
  const weekData = useMemo(() => {
    const map: Record<
      string,
      {
        weekLabel: string;
        grossRevenue: number;
        refunds: number;
        netRevenue: number;
        bookingCount: number;
        passengerCount: number;
      }
    > = {};

    filteredBookings.forEach((b) => {
      const dateStr = b.departureDate || b.bookingCreatedAt || '2026-09-14';
      const key = getISOWeek(dateStr);
      if (!map[key]) {
        map[key] = {
          weekLabel: key,
          grossRevenue: 0,
          refunds: 0,
          netRevenue: 0,
          bookingCount: 0,
          passengerCount: 0,
        };
      }
      if (b.paymentStatus === 'PAID') {
        map[key].grossRevenue += b.totalFare;
        map[key].bookingCount += 1;
        map[key].passengerCount += b.passengers.length;
      } else if (b.paymentStatus === 'REFUNDED') {
        map[key].refunds += b.refundAmount || b.totalFare;
      }
      map[key].netRevenue = map[key].grossRevenue - map[key].refunds;
    });

    return Object.values(map);
  }, [filteredBookings]);

  // Grouping 3: BY DAY
  const dayData = useMemo(() => {
    const map: Record<
      string,
      {
        dateStr: string;
        grossRevenue: number;
        refunds: number;
        netRevenue: number;
        bookingCount: number;
        transactions: Booking[];
      }
    > = {};

    filteredBookings.forEach((b) => {
      const key = b.departureDate || (b.bookingCreatedAt ? b.bookingCreatedAt.slice(0, 10) : '2026-09-14');
      if (!map[key]) {
        map[key] = {
          dateStr: key,
          grossRevenue: 0,
          refunds: 0,
          netRevenue: 0,
          bookingCount: 0,
          transactions: [],
        };
      }
      if (b.paymentStatus === 'PAID') {
        map[key].grossRevenue += b.totalFare;
        map[key].bookingCount += 1;
      } else if (b.paymentStatus === 'REFUNDED') {
        map[key].refunds += b.refundAmount || b.totalFare;
      }
      map[key].netRevenue = map[key].grossRevenue - map[key].refunds;
      map[key].transactions.push(b);
    });

    return Object.values(map).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [filteredBookings]);

  // Grouping 4: BY FLIGHT
  const flightData = useMemo(() => {
    const map: Record<
      string,
      {
        flightNumber: string;
        route: string;
        grossRevenue: number;
        passengerCount: number;
        bookingCount: number;
        aircraftReg: string;
      }
    > = {};

    filteredBookings.forEach((b) => {
      const key = b.flightNumber;
      if (!map[key]) {
        const sched = schedules.find((s) => s.flightNumber === key || s.id === b.flightId);
        map[key] = {
          flightNumber: key,
          route: `${b.fromCode} → ${b.toCode}`,
          grossRevenue: 0,
          passengerCount: 0,
          bookingCount: 0,
          aircraftReg: b.aircraftRegistration || sched?.aircraftRegistration || 'G-ECLP',
        };
      }
      if (b.paymentStatus === 'PAID') {
        map[key].grossRevenue += b.totalFare;
        map[key].bookingCount += 1;
        map[key].passengerCount += b.passengers.length;
      }
    });

    return Object.values(map).sort((a, b) => b.grossRevenue - a.grossRevenue);
  }, [filteredBookings, schedules]);

  // Export Financial CSV
  const handleExportCSV = () => {
    let header = '';
    let rows = '';

    if (activeGrouping === 'MONTH') {
      header = 'Month,Gross Revenue (GBP),Refunds (GBP),Net Revenue (GBP),Bookings,Passengers\n';
      rows = monthData
        .map((m) => `"${m.monthLabel}",${m.grossRevenue},${m.refunds},${m.netRevenue},${m.bookingCount},${m.passengerCount}`)
        .join('\n');
    } else if (activeGrouping === 'WEEK') {
      header = 'Week,Gross Revenue (GBP),Refunds (GBP),Net Revenue (GBP),Bookings,Passengers\n';
      rows = weekData
        .map((w) => `"${w.weekLabel}",${w.grossRevenue},${w.refunds},${w.netRevenue},${w.bookingCount},${w.passengerCount}`)
        .join('\n');
    } else if (activeGrouping === 'DAY') {
      header = 'Date,Gross Revenue (GBP),Refunds (GBP),Net Revenue (GBP),Transactions\n';
      rows = dayData
        .map((d) => `"${d.dateStr}",${d.grossRevenue},${d.refunds},${d.netRevenue},${d.bookingCount}`)
        .join('\n');
    } else {
      header = 'Flight Number,Route,Aircraft,Total Payments (GBP),Passengers,Bookings\n';
      rows = flightData
        .map((f) => `"${f.flightNumber}","${f.route}","${f.aircraftReg}",${f.grossRevenue},${f.passengerCount},${f.bookingCount}`)
        .join('\n');
    }

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FlyEclipse_Payment_Report_${activeGrouping}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Net Payments Received
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            £{metrics.netRevenue.toLocaleString()}
            <span className="text-xs font-semibold text-slate-500 ml-1">GBP</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">£{metrics.grossPaid.toLocaleString()}</span> gross •{' '}
            <span className="text-rose-600 font-semibold">-£{metrics.totalRefunds.toLocaleString()} refunds</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Paid Bookings
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {metrics.paidBookingsCount}
            <span className="text-xs font-semibold text-slate-500 ml-1">Bookings</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {metrics.totalPassengers} confirmed ticketed passengers
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Yield per Pax
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            £{metrics.avgYield.toLocaleString()}
            <span className="text-xs font-semibold text-slate-500 ml-1">GBP</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Cessna 208B Channel Islands high-yield route</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Refunds & On-Hold
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            £{metrics.totalRefunds.toLocaleString()}
            <span className="text-xs font-semibold text-slate-500 ml-1">GBP</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pending 2h reservations: £{metrics.pendingAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Aggregation Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab switcher: MONTH / WEEK / DAY / FLIGHT */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Payment Breakdown by Timeframe & Flight
            </h3>
            <p className="text-xs text-slate-500">
              Audited payment ledger for tenant discriminator: <code className="font-mono text-purple-700">FLYECLIPSE_CI</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 4 Required Grouping Modes */}
            <div className="flex rounded-xl bg-slate-200 p-1 text-xs font-bold">
              <button
                onClick={() => setActiveGrouping('MONTH')}
                className={`py-1.5 px-3 rounded-lg transition ${
                  activeGrouping === 'MONTH'
                    ? 'bg-white shadow-sm text-purple-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📅 By Month
              </button>
              <button
                onClick={() => setActiveGrouping('WEEK')}
                className={`py-1.5 px-3 rounded-lg transition ${
                  activeGrouping === 'WEEK'
                    ? 'bg-white shadow-sm text-purple-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🗓️ By Weeks
              </button>
              <button
                onClick={() => setActiveGrouping('DAY')}
                className={`py-1.5 px-3 rounded-lg transition ${
                  activeGrouping === 'DAY'
                    ? 'bg-white shadow-sm text-purple-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📆 By Day
              </button>
              <button
                onClick={() => setActiveGrouping('FLIGHT')}
                className={`py-1.5 px-3 rounded-lg transition ${
                  activeGrouping === 'FLIGHT'
                    ? 'bg-white shadow-sm text-purple-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✈️ By Flight
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              Status Filter:
            </span>
            {(['ALL', 'PAID', 'PENDING', 'REFUNDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === st
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PNR, flight, or passenger..."
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Table Content depending on activeGrouping */}
        <div className="overflow-x-auto">
          {/* 1. MONTH BREAKDOWN */}
          {activeGrouping === 'MONTH' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-5">Billing Month</th>
                  <th className="py-3 px-5">Gross Payments Received</th>
                  <th className="py-3 px-5">Refund Deductions</th>
                  <th className="py-3 px-5">Net Revenue (GBP)</th>
                  <th className="py-3 px-5">Paid Bookings</th>
                  <th className="py-3 px-5">Passengers Flown</th>
                  <th className="py-3 px-5">Avg Yield / Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/40 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      {m.monthLabel}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-emerald-700">
                      £{m.grossRevenue.toLocaleString()} GBP
                    </td>
                    <td className="py-3.5 px-5 font-mono text-rose-600">
                      {m.refunds > 0 ? `-£${m.refunds.toLocaleString()} GBP` : '£0'}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-black text-slate-900">
                      £{m.netRevenue.toLocaleString()} GBP
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold">{m.bookingCount}</span> bookings
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold">{m.passengerCount}</span> passengers
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">
                      £{m.bookingCount > 0 ? Math.round(m.grossRevenue / m.bookingCount) : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 2. WEEK BREAKDOWN */}
          {activeGrouping === 'WEEK' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-5">Operating Calendar Week</th>
                  <th className="py-3 px-5">Gross Payments</th>
                  <th className="py-3 px-5">Refunds</th>
                  <th className="py-3 px-5">Net Revenue</th>
                  <th className="py-3 px-5">Bookings Completed</th>
                  <th className="py-3 px-5">Total Passengers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {weekData.map((w, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/40 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-600" />
                      {w.weekLabel}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-emerald-700">
                      £{w.grossRevenue.toLocaleString()} GBP
                    </td>
                    <td className="py-3.5 px-5 font-mono text-rose-600">
                      {w.refunds > 0 ? `-£${w.refunds.toLocaleString()} GBP` : '£0'}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-black text-slate-900">
                      £{w.netRevenue.toLocaleString()} GBP
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700">
                      {w.bookingCount} bookings
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-semibold">
                      {w.passengerCount} passengers
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 3. DAY BREAKDOWN */}
          {activeGrouping === 'DAY' && (
            <div className="divide-y divide-slate-100">
              {dayData.map((d, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50/60 transition">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">{d.dateStr}</span>
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        {d.bookingCount} Transactions
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 mr-1">Gross:</span>
                        <span className="font-bold text-emerald-700">£{d.grossRevenue.toLocaleString()}</span>
                      </div>
                      {d.refunds > 0 && (
                        <div>
                          <span className="text-slate-500 mr-1">Refund:</span>
                          <span className="font-semibold text-rose-600">-£{d.refunds.toLocaleString()}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500 mr-1">Net:</span>
                        <span className="font-black text-slate-900">£{d.netRevenue.toLocaleString()} GBP</span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction breakdown on this day */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] divide-y divide-slate-200">
                    {d.transactions.map((tx) => (
                      <div key={tx.id} className="py-1.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-700">{tx.pnr}</span>
                          <span className="text-slate-700 font-medium">{tx.leadPassengerName}</span>
                          <span className="text-[10px] text-slate-500">
                            ({tx.flightNumber} • {tx.fromCode}→{tx.toCode})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              tx.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.paymentStatus === 'REFUNDED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tx.paymentStatus}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            £{tx.totalFare} GBP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. FLIGHT BREAKDOWN */}
          {activeGrouping === 'FLIGHT' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-5">Flight Number</th>
                  <th className="py-3 px-5">Route Corridor</th>
                  <th className="py-3 px-5">Assigned Aircraft</th>
                  <th className="py-3 px-5">Total Payments Received</th>
                  <th className="py-3 px-5">Seats Booked</th>
                  <th className="py-3 px-5">Load Factor (8-seat C208B)</th>
                  <th className="py-3 px-5">Average Yield / Seat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flightData.map((f, idx) => {
                  const loadFactor = Math.min(100, Math.round((f.passengerCount / 8) * 100));
                  return (
                    <tr key={idx} className="hover:bg-purple-50/40 transition">
                      <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                        <Plane className="w-4 h-4 text-purple-600" />
                        <span className="font-mono">{f.flightNumber}</span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-700">{f.route}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-600">{f.aircraftReg}</td>
                      <td className="py-3.5 px-5 font-mono font-black text-emerald-700">
                        £{f.grossRevenue.toLocaleString()} GBP
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold">{f.passengerCount}</span> pax
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                loadFactor >= 80
                                  ? 'bg-rose-500'
                                  : loadFactor >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${loadFactor}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px] text-slate-700">{loadFactor}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-600">
                        £{f.passengerCount > 0 ? Math.round(f.grossRevenue / f.passengerCount) : 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
