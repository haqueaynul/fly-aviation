import React, { useState } from 'react';
import {
  MOCK_AIRPORTS,
  MOCK_AIRCRAFTS,
  MOCK_SCHEDULES,
  MOCK_CREW,
  MOCK_MAINTENANCE_LOGS,
  MOCK_USER,
  MOCK_BOOKINGS,
  MOCK_AUDIT_LOGS,
} from './data/mockData';
import {
  RegularFlight,
  Aircraft,
  PilotCrew,
  MaintenanceLog,
  UserProfile,
  Booking,
  Ticket,
  AuditLog,
  MfaMethod,
} from './types';
import { BookingEngine } from './components/BookingEngine';
import { PassengerVerification } from './components/PassengerVerification';
import { FlightScheduleManager } from './components/FlightScheduleManager';
import { MaintenanceDashboard } from './components/MaintenanceDashboard';
import { CrewRosterDashboard } from './components/CrewRosterDashboard';
import { AuditLogViewer } from './components/AuditLogViewer';
import { EntityManagement } from './components/EntityManagement';
import { ProfileWizardModal } from './components/ProfileWizardModal';
import { MfaModal } from './components/MfaModal';
import { LoginModal } from './components/LoginModal';
import { BoardingPassModal } from './components/BoardingPassModal';
import { TemplateExplorerModal } from './components/TemplateExplorerModal';
import {
  Plane,
  Calendar,
  Wrench,
  Users,
  Shield,
  Database,
  Ticket as TicketIcon,
  Bell,
  CheckCircle2,
  AlertCircle,
  LogOut,
  LogIn,
  Fingerprint,
  User,
  Sparkles,
  ChevronDown,
  FileCode,
} from 'lucide-react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<
    'BOOKING' | 'PASSENGER' | 'ENTITIES' | 'SCHEDULES' | 'MAINTENANCE' | 'CREW' | 'AUDIT_LOGS'
  >('ENTITIES');

  // Application State
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USER);
  const [schedules, setSchedules] = useState<RegularFlight[]>(MOCK_SCHEDULES);
  const [aircrafts, setAircrafts] = useState<Aircraft[]>(MOCK_AIRCRAFTS);
  const [crew, setCrew] = useState<PilotCrew[]>(MOCK_CREW);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(MOCK_MAINTENANCE_LOGS);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      ticketNumber: 'TK-X9L4KP01',
      bookingReference: 'FE-BK-8921',
      pnr: 'X9L4KP',
      passengerId: 'PAX-101',
      passengerName: 'Jonathan Vance',
      passengerType: 'ADULT',
      flightNumber: 'FE-101',
      origin: 'JER',
      destination: 'ACI',
      departureDate: '2026-09-14',
      departureTime: '07:30',
      gate: 'GATE 1',
      seatNumber: '1A',
      qrPayload: 'FLYECLIPSE:X9L4KP:UK98421092:1A',
      barcodeNumber: '298104829104',
      aircraftModel: 'Cessna 208B Grand Caravan EX',
      baggageAllowance: '20kg Hold + 1 Pet Carrier Allowed',
      hasPetAttached: true,
      petName: 'Barnaby',
      checkedIn: false,
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTicketForModal, setActiveTicketForModal] = useState<{ booking: Booking; ticket: Ticket } | null>(null);

  // Toast / System Notification banner
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' } | null>({
    message: 'FlyEclipse Channel Islands Hub initialized. Multi-tenancy discriminator active: FLYECLIPSE_CI',
    type: 'info',
  });

  const showNotification = (msg: string, type: 'info' | 'success' = 'info') => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === msg ? null : curr));
    }, 6000);
  };

  // Log Event Handler (inserts into DB `access_log` table with discriminator)
  const handleLogEvent = (eventType: AuditLog['eventType'], details: string, entityId?: string) => {
    const newLog: AuditLog = {
      id: 'LOG-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' BST',
      eventType,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      ipAddress: '185.120.44.12',
      tenantId: 'FLYECLIPSE_CI',
      details,
      entityId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Signin / Signout
  const handleSignOut = () => {
    setIsAuthenticated(false);
    handleLogEvent('SIGNOUT', `User ${currentUser.email} logged out of FlyEclipse system.`);
    showNotification(`Signed out successfully. Session closed.`, 'info');
  };

  const handleTriggerSignIn = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile, method?: string) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    handleLogEvent(
      'SIGNIN',
      `User ${user.email} authenticated successfully via Node.js Secure Auth (Role: ${user.role}, Tenant: FLYECLIPSE_CI, Method: ${method || 'PASSWORD'}).`
    );
    showNotification(`Welcome back, ${user.firstName}! Logged in as ${user.role.replace(/_/g, ' ')}.`, 'success');
  };

  const handleMfaSuccess = (method: MfaMethod) => {
    setIsAuthenticated(true);
    setIsMfaModalOpen(false);
    handleLogEvent(
      'MFA_VERIFIED',
      `MFA verification passed via ${method} for ${currentUser.email}. Biometrics & token validated.`
    );
    handleLogEvent('SIGNIN', `User ${currentUser.email} logged in with verified MFA.`);
    showNotification(`Welcome back! MFA Verified via ${method.replace('_', ' ')}.`, 'success');
  };

  // Update Flight Status (Dispatched by Admin)
  const handleUpdateFlightStatus = (flightId: string, status: RegularFlight['status'], remark?: string) => {
    setSchedules((prev) =>
      prev.map((f) => (f.id === flightId ? { ...f, status, statusRemark: remark } : f))
    );
    const flight = schedules.find((f) => f.id === flightId);
    handleLogEvent(
      'FLIGHT_SCHEDULE_UPDATED',
      `Flight ${flight?.flightNumber || flightId} status set to ${status}. Passenger broadcast dispatched.`,
      flightId
    );
    showNotification(
      `Flight ${flight?.flightNumber} status updated to ${status}. WebSocket alert sent to passengers.`,
      'success'
    );
  };

  // New Maintenance Log
  const handleAddMaintenanceLog = (newLog: MaintenanceLog) => {
    setMaintenanceLogs((prev) => [newLog, ...prev]);
    // Update aircraft flight hours and cycles
    setAircrafts((prev) =>
      prev.map((a) =>
        a.registration === newLog.aircraftRegistration
          ? {
              ...a,
              totalFlightHours: newLog.flightHours,
              engineCycles: newLog.engineCycles,
              status: newLog.status === 'GROUNDED_AOG' ? 'MAINTENANCE' : 'AIRWORTHY',
            }
          : a
      )
    );
    handleLogEvent(
      'MAINTENANCE_LOG_CREATED',
      `Technical log entry ${newLog.id} submitted for ${newLog.aircraftRegistration} by ${newLog.technicianName}`,
      newLog.id
    );
    showNotification(`Maintenance log ${newLog.id} signed and committed to fleet ledger.`, 'success');
  };

  // New Booking & Ticket Confirmed (handles single or return tickets)
  const handleBookingConfirmed = (newBooking: Booking, newTicketOrTickets: Ticket | Ticket[]) => {
    const newTickets = Array.isArray(newTicketOrTickets) ? newTicketOrTickets : [newTicketOrTickets];
    setBookings((prev) => [newBooking, ...prev]);
    setTickets((prev) => [...newTickets, ...prev]);

    // Update available seats on flight schedule for both outbound and return
    setSchedules((prev) =>
      prev.map((f) => {
        if (f.id === newBooking.flightId) {
          const booked = [...f.bookedSeats, ...newBooking.seatIds];
          return {
            ...f,
            bookedSeats: booked,
            availableSeatsCount: Math.max(0, 8 - booked.length),
          };
        }
        if (newBooking.returnFlightId && f.id === newBooking.returnFlightId && newBooking.returnSeatIds) {
          const booked = [...f.bookedSeats, ...newBooking.returnSeatIds];
          return {
            ...f,
            bookedSeats: booked,
            availableSeatsCount: Math.max(0, 8 - booked.length),
          };
        }
        return f;
      })
    );

    showNotification(
      `Booking ${newBooking.pnr} confirmed for ${newBooking.leadPassengerName}! ${
        newTickets.length > 1 ? 'Round-trip OpenPDF boarding passes' : 'OpenPDF boarding pass'
      } issued.`,
      'success'
    );
  };

  return (
    <div id="flyeclipse-app-root" className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Top Notification Toast */}
      {notification && (
        <div className="bg-slate-900 text-white text-xs py-2 px-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <span
              className={`w-2 h-2 rounded-full ${
                notification.type === 'success' ? 'bg-emerald-400' : 'bg-purple-400 animate-pulse'
              }`}
            ></span>
            <span className="font-medium text-slate-200">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Route Info */}
            <div className="flex items-center gap-4">
              <div
                onClick={() => setActiveTab('BOOKING')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#6d3cc7] text-white flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-105 transition-all">
                  <Plane className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-slate-900">
                      Fly<span className="text-[#6d3cc7]">Eclipse</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                    Jersey • Bournemouth • Alderney • Guernsey
                  </p>
                </div>
              </div>
            </div>

            {/* Middle: Profile Completion Reminder if < 100% */}
            {currentUser.profileCompletePercentage < 100 && (
              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 cursor-pointer hover:bg-amber-100 transition-all text-xs"
                title="Click to complete your profile"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block">
                    Profile {currentUser.profileCompletePercentage}% Complete
                  </span>
                  <span className="text-[10px] text-amber-700">Add Passport & Relatives for faster check-in</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  Complete
                </span>
              </div>
            )}

            {/* Right: Role Switcher & Auth Actions */}
            <div className="flex items-center gap-3">
              {/* External HTML Templates Explorer */}
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#6d3cc7] border border-purple-200 text-xs font-bold transition-all shadow-sm"
                title="View and download external HTML templates from /template"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">HTML Templates</span>
              </button>

              {/* ACL Role Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl text-xs">
                <Shield className="w-3.5 h-3.5 text-[#6d3cc7]" />
                <span className="text-slate-400 hidden sm:inline">Role:</span>
                <select
                  value={currentUser.role}
                  onChange={(e) => {
                    const newRole = e.target.value as any;
                    setCurrentUser((u) => ({ ...u, role: newRole }));
                    handleLogEvent('ENTITY_CRUD', `Active security role changed to ${newRole}`);
                    showNotification(`Switched role to ${newRole.replace(/_/g, ' ')}`, 'info');
                  }}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="TENANT_ADMIN">Tenant Admin</option>
                  <option value="INDIVIDUAL_USER">Individual User</option>
                  <option value="FAMILY_USER">Family Tier</option>
                  <option value="CORPORATE_USER">Corporate Charter</option>
                  <option value="PASSENGER">Passenger</option>
                </select>
              </div>

              {/* User Avatar / Profile Modal Button */}
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 transition-all text-xs font-semibold text-slate-700 border border-transparent hover:border-slate-200"
                    title="View / Edit Profile"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6d3cc7] font-bold flex items-center justify-center">
                      {currentUser.firstName[0]}
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="leading-none text-xs font-bold text-slate-900">{currentUser.firstName}</span>
                      <span className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{currentUser.email}</span>
                    </div>
                  </button>

                  {/* Sign Out Button */}
                  <button
                    id="signout-button"
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition-all shadow-sm"
                    title="Sign Out of FlyEclipse"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                /* Sign In Button */
                <button
                  id="signin-button"
                  onClick={handleTriggerSignIn}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#6d3cc7] hover:bg-[#5426a5] text-white font-bold text-xs shadow transition-all"
                  title="Sign In with MFA"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* MFA Trigger icon */}
              <button
                onClick={handleTriggerSignIn}
                className="p-2 rounded-xl text-slate-500 hover:text-[#6d3cc7] hover:bg-purple-50 transition-all"
                title="Multi-Factor Authentication (MFA / Biometrics)"
              >
                <Fingerprint className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 overflow-x-auto border-t border-slate-100 pt-1 text-xs font-bold">
            {[
              { id: 'ENTITIES', label: 'Fleet & Booking Entities', icon: Database },
              { id: 'BOOKING', label: 'Book Flight & Cabin', icon: Plane },
              { id: 'PASSENGER', label: 'Passenger Verification', icon: TicketIcon },
              { id: 'SCHEDULES', label: 'Flight Timetable', icon: Calendar },
              { id: 'MAINTENANCE', label: 'Cessna Fleet & Maintenance', icon: Wrench },
              { id: 'CREW', label: 'Flight Crew Roster', icon: Users },
              { id: 'AUDIT_LOGS', label: 'Multi-Tenant Audit Logs', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-[#6d3cc7] text-[#6d3cc7]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main App Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'ENTITIES' && (
          <EntityManagement
            aircrafts={aircrafts}
            onUpdateAircrafts={setAircrafts}
            schedules={schedules}
            onUpdateSchedules={setSchedules}
            bookings={bookings}
            onUpdateBookings={setBookings}
            tickets={tickets}
            onUpdateTickets={setTickets}
            crew={crew}
            onUpdateCrew={setCrew}
            maintenanceLogs={maintenanceLogs}
            onUpdateMaintenanceLogs={setMaintenanceLogs}
            currentUser={currentUser}
            onLogEvent={handleLogEvent}
          />
        )}

        {activeTab === 'BOOKING' && (
          <BookingEngine
            schedules={schedules}
            currentUser={currentUser}
            onBookingConfirmed={handleBookingConfirmed}
            onLogEvent={handleLogEvent}
          />
        )}

        {activeTab === 'PASSENGER' && (
          <PassengerVerification
            bookings={bookings}
            tickets={tickets}
            onOpenTicket={(ticket, booking) => setActiveTicketForModal({ booking, ticket })}
          />
        )}

        {activeTab === 'SCHEDULES' && (
          <FlightScheduleManager
            schedules={schedules}
            onUpdateStatus={handleUpdateFlightStatus}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'MAINTENANCE' && (
          <MaintenanceDashboard
            aircrafts={aircrafts}
            logs={maintenanceLogs}
            onAddLog={handleAddMaintenanceLog}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'CREW' && (
          <CrewRosterDashboard
            crewList={crew}
            onUpdateDutyStatus={(id, status) => {
              setCrew((prev) => prev.map((c) => (c.id === id ? { ...c, dutyStatus: status } : c)));
              handleLogEvent('ENTITY_CRUD', `Duty status updated for crew member ${id} to ${status}`);
            }}
          />
        )}

        {activeTab === 'AUDIT_LOGS' && <AuditLogViewer logs={auditLogs} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FlyEclipse Aviation Ltd.</span>
            <span>•</span>
            <span>Channel Islands AOC #CI-2026-992</span>
            <span>•</span>
            <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              Tenant: FLYECLIPSE_CI
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Powered by Modern Node.js Full-Stack Platform • Cessna 208B Grand Caravan EX
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <ProfileWizardModal
        user={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          handleLogEvent('ENTITY_CRUD', `User profile updated. Completed fields: 100%`);
          showNotification('Profile updated and saved to identity vault.', 'success');
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      <MfaModal
        isOpen={isMfaModalOpen}
        onSuccess={handleMfaSuccess}
        onCancel={() => setIsMfaModalOpen(false)}
      />

      {activeTicketForModal && (
        <BoardingPassModal
          booking={activeTicketForModal.booking}
          ticket={activeTicketForModal.ticket}
          isOpen={true}
          onClose={() => setActiveTicketForModal(null)}
        />
      )}

      <TemplateExplorerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  );
}
