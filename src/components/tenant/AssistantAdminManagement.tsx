import React, { useState } from 'react';
import { AssistantAdminUser, TenantInfo, RegularFlight, UserProfile } from '../../types';
import {
  ShieldCheck,
  UserPlus,
  LogIn,
  Plane,
  CheckCircle,
  X,
  Lock,
  Mail,
  Building,
  Check,
  AlertCircle,
  Users,
  Settings,
} from 'lucide-react';

interface AssistantAdminManagementProps {
  tenants: TenantInfo[];
  selectedTenantId: string;
  onSelectTenant: (tenantId: string) => void;
  assistantAdmins: AssistantAdminUser[];
  onAddAssistantAdmin: (newAssistant: AssistantAdminUser) => void;
  onToggleStatus: (id: string) => void;
  onLoginAsAssistant: (assistant: AssistantAdminUser) => void;
  onBookFlightsAsAssistant: (assistant: AssistantAdminUser) => void;
  onOpenAddPassenger: (flight?: RegularFlight) => void;
  schedules: RegularFlight[];
  currentUser: UserProfile;
}

export const AssistantAdminManagement: React.FC<AssistantAdminManagementProps> = ({
  tenants,
  selectedTenantId,
  onSelectTenant,
  assistantAdmins,
  onAddAssistantAdmin,
  onToggleStatus,
  onLoginAsAssistant,
  onBookFlightsAsAssistant,
  onOpenAddPassenger,
  schedules,
  currentUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('AssistantPass2026!');
  const [phone, setPhone] = useState('+44 7700 900895');
  const [department, setDepartment] = useState('Flight Operations & Dispatch');

  // Permissions state
  const [canUpdateFlightStatus, setCanUpdateFlightStatus] = useState(true);
  const [canBookFlights, setCanBookFlights] = useState(true);
  const [canAddPassengers, setCanAddPassengers] = useState(true);
  const [canViewManifests, setCanViewManifests] = useState(true);
  const [canViewFinancials, setCanViewFinancials] = useState(true);

  const activeTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  // Filter assistant admins belonging to the selected tenant
  const tenantAssistants = assistantAdmins.filter((a) => a.tenantId === selectedTenantId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    const newAssistant: AssistantAdminUser = {
      id: 'AST-' + Date.now().toString().slice(-4),
      tenantId: selectedTenantId,
      firstName,
      lastName,
      email,
      password,
      phone,
      department,
      role: 'TENANT_ADMIN_ASSISTANT',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().slice(0, 10),
      avatarColor: 'bg-teal-600',
      permissions: {
        canUpdateFlightStatus,
        canBookFlights,
        canAddPassengers,
        canViewManifests,
        canViewFinancials,
      },
    };

    onAddAssistantAdmin(newAssistant);
    setIsModalOpen(false);

    // Reset fields
    setFirstName('');
    setLastName('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Tenant Selector & Management Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-800 rounded-2xl">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                Tenant Delegation & Access Control
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {activeTenant?.name}
              </h3>
              <p className="text-xs text-slate-500">
                Base: <span className="font-bold text-slate-700">{activeTenant?.baseAirport}</span> • Currency:{' '}
                <span className="font-bold text-slate-700">{activeTenant?.currency} (£)</span> • ID:{' '}
                <code className="font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  {activeTenant?.id}
                </code>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tenant Switcher Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Selected Tenant:</label>
              <select
                value={selectedTenantId}
                onChange={(e) => onSelectTenant(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-purple-400"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Add Assistant Admin Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md flex items-center gap-1.5 transition"
            >
              <UserPlus className="w-4 h-4" />
              + Add Assistant Admin
            </button>
          </div>
        </div>
      </div>

      {/* Role explanation banner */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900 space-y-1">
          <span className="font-bold">Assistant Admin Capabilities on {activeTenant?.name}:</span>
          <p className="text-slate-600 leading-relaxed">
            Assistant Admins can log in directly using their credentials, enter and update flight statuses (on time, delayed, cancelled),
            access passenger manifests, book flights on behalf of corporate or leisure passengers, and add passengers directly to flight schedules.
          </p>
        </div>
      </div>

      {/* Assistant Admin Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h4 className="text-sm font-bold text-slate-900">
            Active Assistant Admins ({tenantAssistants.length} Delegated Users)
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            Tenant Discriminator: {selectedTenantId}
          </span>
        </div>

        {tenantAssistants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h5 className="text-sm font-bold text-slate-700">No Assistant Admins on this Tenant</h5>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add your first Assistant Admin to delegate flight operations and booking tasks.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl inline-flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Assistant Admin
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tenantAssistants.map((assistant) => {
              const isCurrentSession = currentUser.email === assistant.email;
              return (
                <div
                  key={assistant.id}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-purple-50/30 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                        assistant.avatarColor || 'bg-teal-600'
                      }`}
                    >
                      {assistant.firstName[0]}
                      {assistant.lastName[0]}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {assistant.firstName} {assistant.lastName}
                        </span>
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                          Assistant Admin
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            assistant.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {assistant.status}
                        </span>
                        {isCurrentSession && (
                          <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                            Active Session
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {assistant.email}
                        </span>
                        <span>•</span>
                        <span>{assistant.department}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">Pass: {assistant.password}</span>
                      </div>

                      {/* Permissions Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2 text-[10px]">
                        {assistant.permissions.canUpdateFlightStatus && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                            ✓ Status Updates
                          </span>
                        )}
                        {assistant.permissions.canBookFlights && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                            ✓ Book Flights
                          </span>
                        )}
                        {assistant.permissions.canAddPassengers && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                            ✓ Add Passengers
                          </span>
                        )}
                        {assistant.permissions.canViewManifests && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                            ✓ View Manifests
                          </span>
                        )}
                        {assistant.permissions.canViewFinancials && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                            ✓ Financial Reports
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this Assistant Admin */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Action 1: Login as this user */}
                    <button
                      onClick={() => onLoginAsAssistant(assistant)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition ${
                        isCurrentSession
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                      }`}
                      title="Login and assume this Assistant Admin role"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      {isCurrentSession ? 'Current User' : 'Login as User'}
                    </button>

                    {/* Action 2: Book Flights */}
                    <button
                      onClick={() => onBookFlightsAsAssistant(assistant)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition"
                      title="Launch booking engine as Assistant Admin"
                    >
                      <Plane className="w-3.5 h-3.5 text-purple-600" />
                      Book Flights
                    </button>

                    {/* Action 3: Add Passenger to Flight */}
                    <button
                      onClick={() => onOpenAddPassenger(schedules[0])}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl flex items-center gap-1.5 transition"
                      title="Add a passenger to a scheduled flight"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-purple-300" />
                      Add Passenger
                    </button>

                    {/* Action 4: Toggle Status */}
                    <button
                      onClick={() => onToggleStatus(assistant.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      title="Toggle active / suspended status"
                    >
                      {assistant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add Assistant Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Provision Administrative User
                </span>
                <h3 className="text-lg font-bold">Add Assistant Admin</h3>
                <p className="text-xs text-slate-400">
                  Assigning to Tenant: <span className="text-white font-medium">{activeTenant?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Oliver"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Renouf"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. oliver.renouf@flyeclipse.com"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department / Ops Unit</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Flight Operations & Dispatch">Flight Operations & Dispatch</option>
                  <option value="Passenger Services & Ground Handling">
                    Passenger Services & Ground Handling
                  </option>
                  <option value="VIP & Corporate Reservations">VIP & Corporate Reservations</option>
                  <option value="Ramp Control & Turnaround Dispatch">
                    Ramp Control & Turnaround Dispatch
                  </option>
                </select>
              </div>

              {/* Granular Permissions */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Delegated Administrative Permissions:
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={canUpdateFlightStatus}
                    onChange={(e) => setCanUpdateFlightStatus(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Update Flight Status (On-Time, Delay, Cancellation)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={canBookFlights}
                    onChange={(e) => setCanBookFlights(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Book Flights for Customers & Corporate Accounts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={canAddPassengers}
                    onChange={(e) => setCanAddPassengers(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Add Passengers Directly to Flight Manifests</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={canViewManifests}
                    onChange={(e) => setCanViewManifests(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>View Full Passenger Manifests & Security ID Records</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={canViewFinancials}
                    onChange={(e) => setCanViewFinancials(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>View Financial Payment Analytics by Month, Week, Day, Flight</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md flex items-center gap-1.5 transition"
                >
                  <Check className="w-4 h-4" />
                  Save & Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
