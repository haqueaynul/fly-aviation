import React, { useState } from 'react';
import { CorporateEmployee, Booking, Ticket, RegularFlight, UserProfile } from '../types';
import {
  Building2,
  Users,
  Plus,
  Search,
  UserCheck,
  Plane,
  Ticket as TicketIcon,
  Shield,
  Edit2,
  Trash2,
  ExternalLink,
  Crown,
  CheckCircle2,
  Clock,
  Briefcase,
  Mail,
  Phone,
  CreditCard,
  AlertCircle,
  Sparkles,
  ArrowRight,
  LogIn,
} from 'lucide-react';

interface CorporatePortalProps {
  employees: CorporateEmployee[];
  onUpdateEmployees: (employees: CorporateEmployee[]) => void;
  bookings: Booking[];
  tickets: Ticket[];
  schedules: RegularFlight[];
  currentUser: UserProfile;
  onNavigateToBooking: (preselectedEmployeeIds?: string[]) => void;
  onOpenTicket: (ticket: Ticket, booking: Booking) => void;
  onLoginAsEmployee: (employee: CorporateEmployee) => void;
  onLogEvent: (eventType: any, details: string, entityId?: string) => void;
}

export const CorporatePortal: React.FC<CorporatePortalProps> = ({
  employees,
  onUpdateEmployees,
  bookings,
  tickets,
  schedules,
  currentUser,
  onNavigateToBooking,
  onOpenTicket,
  onLoginAsEmployee,
  onLogEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<CorporateEmployee | null>(null);

  // Form state
  const [formState, setFormState] = useState<Partial<CorporateEmployee>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+44 7700 ',
    jobTitle: '',
    department: 'Management',
    passportNumber: '',
    passportCountry: 'GBR',
    dob: '1990-01-01',
    canBeLeadPassenger: true,
    status: 'ACTIVE',
    companyName: currentUser.companyName || 'Apex Capital Partners CI',
    frequentFlyerNumber: 'ECL-CORP-',
  });

  const companyName = currentUser.companyName || 'Apex Capital Partners CI';

  // Filter corporate bookings
  const corporateBookings = bookings.filter(
    (b) =>
      b.isCorporateBooking ||
      b.corporateCompanyName === companyName ||
      employees.some((emp) => emp.email.toLowerCase() === b.leadPassengerEmail?.toLowerCase()) ||
      employees.some((emp) => b.passengers.some((p) => p.email.toLowerCase() === emp.email.toLowerCase()))
  );

  const departments = ['ALL', ...Array.from(new Set(employees.map((e) => e.department).filter(Boolean)))];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.passportNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '+44 7700 ',
      jobTitle: '',
      department: 'Management',
      passportNumber: '',
      passportCountry: 'GBR',
      dob: '1990-01-01',
      canBeLeadPassenger: true,
      status: 'ACTIVE',
      companyName,
      frequentFlyerNumber: `ECL-CORP-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: CorporateEmployee) => {
    setEditingEmployee(emp);
    setFormState(emp);
    setIsAddModalOpen(true);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove employee "${name}" from the corporate roster?`)) {
      const updated = employees.filter((e) => e.id !== id);
      onUpdateEmployees(updated);
      onLogEvent('ENTITY_CRUD', `Removed employee [${name}] from corporate roster`, id);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.firstName || !formState.lastName || !formState.email) {
      alert('Please fill in required fields (Name and Email).');
      return;
    }

    if (editingEmployee) {
      const updated = employees.map((emp) =>
        emp.id === editingEmployee.id
          ? ({ ...emp, ...formState } as CorporateEmployee)
          : emp
      );
      onUpdateEmployees(updated);
      onLogEvent('ENTITY_CRUD', `Updated corporate employee [${formState.firstName} ${formState.lastName}]`, editingEmployee.id);
    } else {
      const newEmp: CorporateEmployee = {
        id: `EMP-${Date.now().toString().slice(-4)}`,
        companyName,
        firstName: formState.firstName || '',
        lastName: formState.lastName || '',
        email: formState.email || '',
        phone: formState.phone || '+44 7700 900000',
        jobTitle: formState.jobTitle || 'Executive Staff',
        department: formState.department || 'Operations',
        passportNumber: formState.passportNumber || `UK${Math.floor(10000000 + Math.random() * 90000000)}`,
        passportCountry: formState.passportCountry || 'GBR',
        dob: formState.dob || '1990-01-01',
        canBeLeadPassenger: formState.canBeLeadPassenger ?? true,
        status: formState.status || 'ACTIVE',
        frequentFlyerNumber: formState.frequentFlyerNumber,
        emergencyContact: formState.emergencyContact,
      };
      onUpdateEmployees([newEmp, ...employees]);
      onLogEvent('ENTITY_CRUD', `Added new corporate employee [${newEmp.firstName} ${newEmp.lastName}] (Lead Passenger: ${newEmp.canBeLeadPassenger})`, newEmp.id);
    }

    setIsAddModalOpen(false);
  };

  // Find lead passenger of the latest booking
  const latestCorporateBooking = corporateBookings[0];

  return (
    <div id="corporate-portal" className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Corporate Profile */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-purple-800/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-300" /> Corporate Travel Management
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                Tier 1 Business Partner
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {companyName}
            </h1>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Manage your company's employee travel roster, book flights with multi-passenger seat assignments, designate authorized <strong>Lead Passengers</strong>, and track live corporate mission status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all backdrop-blur-sm"
            >
              <Plus className="w-4 h-4 text-purple-300" />
              Add Employee
            </button>
            <button
              onClick={() => onNavigateToBooking()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-[#6d3cc7] hover:from-purple-600 hover:to-[#5426a5] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/50 transition-all"
            >
              <Plane className="w-4 h-4" />
              Book Corporate Flight
            </button>
          </div>
        </div>

        {/* Corporate KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-slate-400 block text-[11px]">Active Employees</span>
            <span className="text-xl font-black text-white">{employees.length}</span>
            <span className="text-[10px] text-purple-300 block">Eligible travellers</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-slate-400 block text-[11px]">Eligible Lead Passengers</span>
            <span className="text-xl font-black text-emerald-400">
              {employees.filter((e) => e.canBeLeadPassenger).length}
            </span>
            <span className="text-[10px] text-slate-400 block">Trip coordinators</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-slate-400 block text-[11px]">Corporate Bookings</span>
            <span className="text-xl font-black text-amber-300">{corporateBookings.length}</span>
            <span className="text-[10px] text-slate-400 block">Channel Islands hops</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-slate-400 block text-[11px]">Corporate Account ID</span>
            <span className="text-sm font-mono font-bold text-purple-200">CORP-APEX-CI</span>
            <span className="text-[10px] text-slate-400 block">Cessna 208B Priority</span>
          </div>
        </div>
      </div>

      {/* Roster & Quick Actions Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#6d3cc7]" />
              Employee Travel Roster ({employees.length})
            </h2>
            <p className="text-xs text-slate-500">
              Employees registered here can be selected for corporate flight bookings, assigned specific seats, and designated as the Lead Passenger.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employee, email, role..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            // Find active trips for this employee
            const empTrips = corporateBookings.filter(
              (b) =>
                b.leadPassengerEmail?.toLowerCase() === emp.email.toLowerCase() ||
                b.passengers.some((p) => p.email.toLowerCase() === emp.email.toLowerCase())
            );
            const isAssignedLead = corporateBookings.some(
              (b) => b.leadPassengerEmail?.toLowerCase() === emp.email.toLowerCase()
            );

            return (
              <div
                key={emp.id}
                className="bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6d3cc7] font-black flex items-center justify-center text-sm shadow-inner">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {emp.firstName} {emp.lastName}
                          {emp.canBeLeadPassenger && (
                            <span title="Eligible as Lead Passenger" className="text-amber-500">
                              <Crown className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">{emp.jobTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        title="Edit Employee"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, `${emp.firstName} ${emp.lastName}`)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Remove Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-bold">
                      {emp.department}
                    </span>
                    {emp.canBeLeadPassenger ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-600" /> Lead Passenger Eligible
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Passenger Only
                      </span>
                    )}
                    {isAssignedLead && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3 text-[#6d3cc7]" /> Active Lead Pax
                      </span>
                    )}
                  </div>

                  {/* Detail list */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1">
                      <span>Passport: {emp.passportNumber}</span>
                      <span>DOB: {emp.dob}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigateToBooking([emp.id])}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6d3cc7] font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    title="Start booking with this employee"
                  >
                    <Plane className="w-3 h-3" /> Book Flight
                  </button>

                  <button
                    onClick={() => onLoginAsEmployee(emp)}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                    title="Simulate Lead Passenger login to check flight status"
                  >
                    <LogIn className="w-3 h-3 text-purple-600" /> Login as Pax
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">No employees match your search</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">Add employees or adjust your filter.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#6d3cc7] text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Employee
            </button>
          </div>
        )}
      </div>

      {/* Corporate Bookings & Flight Status Track Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#6d3cc7]" />
              Corporate Flights & Lead Passenger Tracking ({corporateBookings.length})
            </h2>
            <p className="text-xs text-slate-500">
              Monitor active corporate reservations, assigned lead passengers, seat allocations, and real-time flight operations.
            </p>
          </div>

          <button
            onClick={() => onNavigateToBooking()}
            className="px-4 py-2 bg-[#6d3cc7] hover:bg-[#5426a5] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Create New Corporate Booking
          </button>
        </div>

        {corporateBookings.length > 0 ? (
          <div className="space-y-4">
            {corporateBookings.map((b) => {
              // Find matching flight schedule
              const matchedSchedule = schedules.find(
                (s) => s.flightNumber === b.flightNumber && s.date === b.departureDate
              );
              const status = matchedSchedule?.status || 'ON_TIME';

              const bookingTickets = tickets.filter((t) => t.pnr === b.pnr);

              return (
                <div
                  key={b.id}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-purple-200 transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6d3cc7] flex items-center justify-center font-bold">
                        <Plane className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-base">
                            Flight {b.flightNumber}
                          </span>
                          <span className="font-mono text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold border border-purple-200">
                            PNR: {b.pnr}
                          </span>
                          {/* Live Flight Status */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                              status === 'ON_TIME'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status === 'BOARDING'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : status === 'DELAYED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {b.fromCode} → {b.toCode} • Date: {b.departureDate} at {b.departureTime} BST • Aircraft:{' '}
                          {b.aircraftRegistration}
                        </p>
                      </div>
                    </div>

                    {/* Lead Passenger badge */}
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <div className="text-left">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block">
                          Assigned Lead Passenger
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {b.leadPassengerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Passenger & Ticket Manifest for this Booking */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Ticketed Corporate Passengers ({b.passengers.length}) & Seats
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {b.passengers.map((p, idx) => {
                        const isLead =
                          p.isLeadPassenger ||
                          p.email?.toLowerCase() === b.leadPassengerEmail?.toLowerCase() ||
                          `${p.firstName} ${p.lastName}`.toLowerCase() === b.leadPassengerName.toLowerCase();

                        const ticket = bookingTickets.find((t) => t.passengerId === p.id) || bookingTickets[idx];

                        return (
                          <div
                            key={p.id || idx}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                              isLead
                                ? 'bg-amber-50/70 border-amber-300 font-medium'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">
                                  {p.firstName} {p.lastName}
                                </span>
                                {isLead && (
                                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                                    Lead
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono block">
                                Seat: <strong className="text-purple-700">{p.seatId || b.seatIds[idx] || '1A'}</strong>
                              </span>
                            </div>

                            {ticket && (
                              <button
                                onClick={() => onOpenTicket(ticket, b)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#6d3cc7] hover:text-white text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-all"
                                title="Open Boarding Pass"
                              >
                                <TicketIcon className="w-3 h-3" /> Ticket
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl">
            <Plane className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No corporate bookings yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Select employees from your roster to create multi-passenger corporate bookings, assign seats, and designate the lead passenger.
            </p>
            <button
              onClick={() => onNavigateToBooking()}
              className="px-4 py-2 bg-[#6d3cc7] text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow"
            >
              <Plane className="w-3.5 h-3.5" /> Book First Corporate Flight
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  {editingEmployee ? 'Edit Employee Details' : 'Add Employee to Corporate Roster'}
                </h3>
                <p className="text-xs text-slate-500">
                  Register staff details for flight bookings, seat allocations, and lead passenger assignment.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.firstName || ''}
                    onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    placeholder="Rachel"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.lastName || ''}
                    onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    placeholder="Carter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={formState.email || ''}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                    placeholder="rachel.carter@apexcapital.je"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formState.phone || ''}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                    placeholder="+44 7700 900551"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formState.jobTitle || ''}
                    onChange={(e) => setFormState({ ...formState, jobTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    placeholder="VP Wealth Advisory"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formState.department || 'Management'}
                    onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="Executive Leadership">Executive Leadership</option>
                    <option value="Private Equity">Private Equity</option>
                    <option value="Legal & Compliance">Legal & Compliance</option>
                    <option value="Risk & Strategy">Risk & Strategy</option>
                    <option value="Operations">Operations</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passport Number</label>
                  <input
                    type="text"
                    value={formState.passportNumber || ''}
                    onChange={(e) => setFormState({ ...formState, passportNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                    placeholder="UK77291048"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formState.dob || '1990-01-01'}
                    onChange={(e) => setFormState({ ...formState, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Lead Passenger Toggle */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="leadPaxCheckbox"
                  checked={formState.canBeLeadPassenger ?? true}
                  onChange={(e) => setFormState({ ...formState, canBeLeadPassenger: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded text-[#6d3cc7] focus:ring-purple-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="leadPaxCheckbox" className="text-xs cursor-pointer">
                  <span className="font-bold text-amber-950 block">
                    Eligible to be designated as Lead Passenger
                  </span>
                  <span className="text-amber-800 text-[11px] block mt-0.5">
                    Authorized to act as flight trip coordinator, log in with their email, verify flight status, and receive dispatch manifests.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6d3cc7] hover:bg-[#5426a5] text-white rounded-xl font-bold shadow-md shadow-purple-200 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {editingEmployee ? 'Save Changes' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
