import React, { useState } from 'react';
import {
  RegularFlight,
  Booking,
  Ticket,
  UserProfile,
  CorporateEmployee,
  AssistantAdminUser,
  TenantInfo,
} from '../types';
import { FlightStatusDispatchModal } from './tenant/FlightStatusDispatchModal';
import { FlightManifestModal } from './tenant/FlightManifestModal';
import { AddPassengerDirectModal } from './tenant/AddPassengerDirectModal';
import { PaymentAnalyticsDashboard } from './tenant/PaymentAnalyticsDashboard';
import { AssistantAdminManagement } from './tenant/AssistantAdminManagement';
import {
  Plane,
  Users,
  CreditCard,
  UserPlus,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';

interface TenantAdminDashboardProps {
  schedules: RegularFlight[];
  bookings: Booking[];
  tickets: Ticket[];
  currentUser: UserProfile;
  corporateEmployees?: CorporateEmployee[];
  tenants: TenantInfo[];
  assistantAdmins: AssistantAdminUser[];
  onUpdateFlightStatus: (
    flightId: string,
    status: RegularFlight['status'],
    remark?: string,
    delayMinutes?: number,
    delayReason?: string,
    estimatedDepartureTime?: string
  ) => void;
  onBookingConfirmed: (newBooking: Booking, newTicket: Ticket) => void;
  onAddAssistantAdmin: (newAssistant: AssistantAdminUser) => void;
  onToggleAssistantStatus: (id: string) => void;
  onLoginAsAssistant: (assistant: AssistantAdminUser) => void;
  onNavigateToBooking: () => void;
  onLogEvent: (eventType: any, details: string, entityId?: string) => void;
}

export const TenantAdminDashboard: React.FC<TenantAdminDashboardProps> = ({
  schedules,
  bookings,
  tickets,
  currentUser,
  corporateEmployees = [],
  tenants,
  assistantAdmins,
  onUpdateFlightStatus,
  onBookingConfirmed,
  onAddAssistantAdmin,
  onToggleAssistantStatus,
  onLoginAsAssistant,
  onNavigateToBooking,
  onLogEvent,
}) => {
  // Navigation tabs within Tenant Admin Dashboard
  const [activeTab, setActiveTab] = useState<'OPERATIONS' | 'PAYMENTS' | 'ASSISTANT_ADMINS'>(
    'OPERATIONS'
  );

  // Selected Tenant
  const [selectedTenantId, setSelectedTenantId] = useState<string>('FLYECLIPSE_CI');

  // Modals state
  const [selectedFlightForStatus, setSelectedFlightForStatus] = useState<RegularFlight | null>(null);
  const [selectedFlightForManifest, setSelectedFlightForManifest] = useState<RegularFlight | null>(null);
  const [selectedFlightForAddPax, setSelectedFlightForAddPax] = useState<RegularFlight | null>(null);

  // Operations filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [flightSearch, setFlightSearch] = useState<string>('');

  const activeTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  // Filter schedules
  const filteredFlights = schedules.filter((f) => {
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    if (flightSearch) {
      const q = flightSearch.toLowerCase();
      const matchNum = f.flightNumber.toLowerCase().includes(q);
      const matchFrom = f.fromCode.toLowerCase().includes(q);
      const matchTo = f.toCode.toLowerCase().includes(q);
      const matchReg = f.aircraftRegistration.toLowerCase().includes(q);
      return matchNum || matchFrom || matchTo || matchReg;
    }
    return true;
  });

  // Calculate passenger counts for a flight
  const getFlightPaxCount = (flight: RegularFlight) => {
    const flightBookings = bookings.filter(
      (b) => b.flightId === flight.id || b.flightNumber === flight.flightNumber
    );
    let count = 0;
    flightBookings.forEach((b) => {
      count += b.passengers.length;
    });
    return {
      count,
      capacity: 8,
      loadFactor: Math.min(100, Math.round((count / 8) * 100)),
      available: Math.max(0, 8 - count),
    };
  };

  return (
    <div id="tenant-admin-dashboard" className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-purple-900/40 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-purple-300" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full">
                Tenant Administration & Operations
              </span>
              <span className="text-[10px] font-mono bg-white/10 text-white px-2 py-0.5 rounded">
                Discriminator: {selectedTenantId}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeTenant?.name} Ops Center
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Live flight dispatch (on-time, delays, cancellations), passenger manifests, multi-period payment analytics, and assistant admin delegation.
            </p>
          </div>

          {/* Quick Stats on Top Banner */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Scheduled Flights
              </span>
              <span className="text-xl font-black text-white">{schedules.length}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assistant Admins
              </span>
              <span className="text-xl font-black text-teal-300">{assistantAdmins.length}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Tenant
              </span>
              <span className="text-sm font-bold text-amber-300 block">{selectedTenantId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs for Tenant Admin */}
      <div className="flex rounded-2xl bg-slate-200/80 p-1.5 text-xs font-bold shadow-inner">
        <button
          onClick={() => setActiveTab('OPERATIONS')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'OPERATIONS'
              ? 'bg-white text-purple-700 shadow-md font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Flight Status & Passenger Manifests</span>
        </button>

        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'PAYMENTS'
              ? 'bg-white text-purple-700 shadow-md font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Analytics (Month / Week / Day / Flight)</span>
        </button>

        <button
          onClick={() => setActiveTab('ASSISTANT_ADMINS')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'ASSISTANT_ADMINS'
              ? 'bg-white text-purple-700 shadow-md font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Assistant Admin Users ({assistantAdmins.length})</span>
        </button>
      </div>

      {/* TAB 1: OPERATIONS & PASSENGER MANIFESTS */}
      {activeTab === 'OPERATIONS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Filter Status:
              </span>
              {(['ALL', 'ON_TIME', 'DELAYED', 'CANCELLED', 'BOARDING', 'IN_FLIGHT'] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      statusFilter === st
                        ? 'bg-purple-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                )
              )}
            </div>

            <div className="w-72">
              <input
                type="text"
                value={flightSearch}
                onChange={(e) => setFlightSearch(e.target.value)}
                placeholder="Search flight number, route, or reg..."
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Flights Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Scheduled Flights Dispatch Roster ({filteredFlights.length} Flights)
                </h3>
                <p className="text-xs text-slate-500">
                  Click 'Update Status' to log on-time, delay minutes & reason, or cancellation. Click 'Manifest' to check total passengers.
                </p>
              </div>

              <button
                onClick={() => setSelectedFlightForAddPax(schedules[0])}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-sm flex items-center gap-1.5 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Add Passenger to Flight
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Flight</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Departure (ETD)</th>
                    <th className="py-3 px-4">Aircraft</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4">Total Passengers</th>
                    <th className="py-3 px-4 text-right">Dispatch Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFlights.map((flight) => {
                    const pax = getFlightPaxCount(flight);
                    const isDelayed = flight.status === 'DELAYED';
                    const isCancelled = flight.status === 'CANCELLED';
                    const isOnTime = flight.status === 'ON_TIME';

                    return (
                      <tr key={flight.id} className="hover:bg-purple-50/30 transition">
                        {/* Flight Number */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <Plane className="w-4 h-4 text-purple-600" />
                          <span className="font-mono text-sm">{flight.flightNumber}</span>
                        </td>

                        {/* Route */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 text-xs">
                            {flight.fromCode} → {flight.toCode}
                          </span>
                          {flight.viaCode && (
                            <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                              via {flight.viaCode}
                            </span>
                          )}
                        </td>

                        {/* Departure time / ETD */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-slate-900">{flight.departureTime}</div>
                          {flight.estimatedDepartureTime &&
                            flight.estimatedDepartureTime !== flight.departureTime && (
                              <div className="text-[10px] font-bold text-amber-700">
                                ETD: {flight.estimatedDepartureTime} (+{flight.delayMinutes}m)
                              </div>
                            )}
                        </td>

                        {/* Aircraft */}
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {flight.aircraftRegistration}
                        </td>

                        {/* Current Status Badge with Remark */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isOnTime
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isDelayed
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}
                          >
                            {isOnTime && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                            {isDelayed && <Clock className="w-3 h-3 text-amber-600" />}
                            {isCancelled && <XCircle className="w-3 h-3 text-rose-600" />}
                            <span>{flight.status.replace('_', ' ')}</span>
                          </span>

                          {flight.statusRemark && (
                            <p className="text-[10px] text-slate-500 mt-1 max-w-xs truncate" title={flight.statusRemark}>
                              {flight.statusRemark}
                            </p>
                          )}
                        </td>

                        {/* Total Passengers for this flight (User Request 3) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 font-mono">
                              {pax.count} / {pax.capacity} Pax
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                pax.loadFactor >= 80
                                  ? 'bg-rose-100 text-rose-800'
                                  : pax.loadFactor >= 40
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {pax.loadFactor}%
                            </span>
                          </div>

                          <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className="bg-purple-600 h-full"
                              style={{ width: `${pax.loadFactor}%` }}
                            />
                          </div>
                        </td>

                        {/* Dispatch Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Update Status (User Requests 1 & 2) */}
                            <button
                              onClick={() => setSelectedFlightForStatus(flight)}
                              className="px-2.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition"
                              title="Update flight status (On time, delayed, cancelled)"
                            >
                              Update Status
                            </button>

                            {/* View Passenger Manifest (User Request 3) */}
                            <button
                              onClick={() => setSelectedFlightForManifest(flight)}
                              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                              title="Check passenger roster and count"
                            >
                              Manifest ({pax.count})
                            </button>

                            {/* Add Passenger Shortcut */}
                            <button
                              onClick={() => setSelectedFlightForAddPax(flight)}
                              className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                              title="Add passenger to this flight"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT ANALYTICS (User Request 4) */}
      {activeTab === 'PAYMENTS' && (
        <PaymentAnalyticsDashboard bookings={bookings} schedules={schedules} />
      )}

      {/* TAB 3: ASSISTANT ADMINS (User Request 5) */}
      {activeTab === 'ASSISTANT_ADMINS' && (
        <AssistantAdminManagement
          tenants={tenants}
          selectedTenantId={selectedTenantId}
          onSelectTenant={setSelectedTenantId}
          assistantAdmins={assistantAdmins}
          onAddAssistantAdmin={onAddAssistantAdmin}
          onToggleStatus={onToggleAssistantStatus}
          onLoginAsAssistant={onLoginAsAssistant}
          onBookFlightsAsAssistant={onNavigateToBooking}
          onOpenAddPassenger={(flight) =>
            setSelectedFlightForAddPax(flight || schedules[0])
          }
          schedules={schedules}
          currentUser={currentUser}
        />
      )}

      {/* MODAL 1: Flight Status Dispatch Modal (Req 1 & 2) */}
      <FlightStatusDispatchModal
        flight={selectedFlightForStatus}
        isOpen={Boolean(selectedFlightForStatus)}
        onClose={() => setSelectedFlightForStatus(null)}
        onUpdateStatus={onUpdateFlightStatus}
      />

      {/* MODAL 2: Flight Manifest Modal (Req 3) */}
      <FlightManifestModal
        flight={selectedFlightForManifest}
        isOpen={Boolean(selectedFlightForManifest)}
        onClose={() => setSelectedFlightForManifest(null)}
        bookings={bookings}
        tickets={tickets}
        onOpenAddPassenger={(flight) => {
          setSelectedFlightForManifest(null);
          setSelectedFlightForAddPax(flight);
        }}
      />

      {/* MODAL 3: Direct Add Passenger Modal (Req 5 & req 3 shortcut) */}
      <AddPassengerDirectModal
        flight={selectedFlightForAddPax}
        isOpen={Boolean(selectedFlightForAddPax)}
        onClose={() => setSelectedFlightForAddPax(null)}
        corporateEmployees={corporateEmployees}
        currentUser={currentUser}
        onBookingConfirmed={onBookingConfirmed}
        onLogEvent={onLogEvent}
      />
    </div>
  );
};
