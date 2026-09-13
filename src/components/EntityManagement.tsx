import React, { useState } from 'react';
import {
  Aircraft,
  Booking,
  PassengerInfo,
  PetInfo,
  Ticket,
  PilotCrew,
  MaintenanceLog,
  AuditLog,
  UserProfile,
  RegularFlight,
} from '../types';
import {
  Database,
  Plane,
  Calendar,
  Ticket as TicketIcon,
  Users,
  Dog,
  Wrench,
  Shield,
  FileCode,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Key,
  Layers,
  Sparkles,
  Download,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface EntityManagementProps {
  aircrafts: Aircraft[];
  onUpdateAircrafts: (aircrafts: Aircraft[]) => void;
  schedules: RegularFlight[];
  onUpdateSchedules: (schedules: RegularFlight[]) => void;
  bookings: Booking[];
  onUpdateBookings: (bookings: Booking[]) => void;
  tickets: Ticket[];
  onUpdateTickets: (tickets: Ticket[]) => void;
  crew: PilotCrew[];
  onUpdateCrew: (crew: PilotCrew[]) => void;
  maintenanceLogs: MaintenanceLog[];
  onUpdateMaintenanceLogs: (logs: MaintenanceLog[]) => void;
  currentUser: UserProfile;
  onLogEvent: (eventType: any, details: string, entityId?: string) => void;
}

type EntityCategory =
  | 'Aircraft'
  | 'FlightSchedule'
  | 'Booking'
  | 'Passenger'
  | 'Pet'
  | 'Ticket'
  | 'Pilot'
  | 'MaintenanceLog';

export const EntityManagement: React.FC<EntityManagementProps> = ({
  aircrafts,
  onUpdateAircrafts,
  schedules,
  onUpdateSchedules,
  bookings,
  onUpdateBookings,
  tickets,
  onUpdateTickets,
  crew,
  onUpdateCrew,
  maintenanceLogs,
  onUpdateMaintenanceLogs,
  currentUser,
  onLogEvent,
}) => {
  const [activeEntity, setActiveEntity] = useState<EntityCategory>('Aircraft');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states for adding/editing Aircraft
  const [aircraftForm, setAircraftForm] = useState<Partial<Aircraft>>({
    registration: 'G-ECLA',
    model: 'Cessna 208B Grand Caravan EX',
    nickname: 'Channel Swift',
    engine: 'Pratt & Whitney Canada PT6A-140 (867 shp)',
    totalFlightHours: 420.0,
    engineCycles: 820,
    status: 'AIRWORTHY',
    seatCapacity: 8,
    petCapacity: 2,
    baseAirport: 'JER',
    lastInspectionDate: '2026-09-10',
    nextScheduledCheckHours: 500,
  });

  // Form states for FlightSchedule
  const [flightForm, setFlightForm] = useState<Partial<RegularFlight>>({
    flightNumber: 'FE-109',
    departureTime: '08:45',
    arrivalTime: '09:15',
    fromCode: 'JER',
    toCode: 'ACI',
    aircraftRegistration: 'G-ECLP',
    pilotId: 'PLT-01',
    status: 'ON_TIME',
    date: '2026-09-14',
    availableSeatsCount: 8,
    bookedSeats: [],
    reservedSeats: [],
  });

  // Form states for Pilot / Crew
  const [crewForm, setCrewForm] = useState<Partial<PilotCrew>>({
    name: 'Capt. Thomas Aubin',
    callsign: 'Bailiwick One',
    role: 'CAPTAIN',
    licenseNumber: 'UK.ATPL.991204',
    medicalExpiry: '2027-08-30',
    totalFlightHours: 5400,
    hoursThisMonth: 22.5,
    dutyStatus: 'ON_DUTY',
    baseAirport: 'JER',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  // Form states for Pet
  const [petForm, setPetForm] = useState<{
    bookingId: string;
    name: string;
    type: 'DOG' | 'CAT' | 'BIRD' | 'OTHER';
    breed: string;
    weightKg: number;
    vetCertificateNumber: string;
    crateRequired: boolean;
    assignedZone: 'CRATE_BAY_1' | 'CRATE_BAY_2' | 'UNDER_SEAT';
  }>({
    bookingId: bookings[0]?.id || '',
    name: 'Jasper',
    type: 'DOG',
    breed: 'Golden Retriever',
    weightKg: 28.0,
    vetCertificateNumber: 'UK-VET-2026-9041',
    crateRequired: true,
    assignedZone: 'CRATE_BAY_2',
  });

  // Extract all flat passengers from all bookings
  const allPassengers: (PassengerInfo & { bookingId: string; pnr: string; flightNumber: string })[] = [];
  bookings.forEach((b) => {
    b.passengers.forEach((p) => {
      allPassengers.push({
        ...p,
        bookingId: b.id,
        pnr: b.pnr,
        flightNumber: b.flightNumber,
      });
    });
  });

  // Extract all flat pets from all bookings
  const allPets: (PetInfo & { bookingId: string; pnr: string })[] = [];
  bookings.forEach((b) => {
    b.pets.forEach((pet) => {
      allPets.push({
        ...pet,
        bookingId: b.id,
        pnr: b.pnr,
      });
    });
  });

  // ---------------------------------------------
  // AIRCRAFT CRUD HANDLERS
  // ---------------------------------------------
  const handleSaveAircraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'ADD') {
      const newAc: Aircraft = {
        registration: aircraftForm.registration || 'G-ECLA',
        model: aircraftForm.model || 'Cessna 208B Grand Caravan EX',
        nickname: aircraftForm.nickname || 'Island Caravan',
        engine: aircraftForm.engine || 'Pratt & Whitney Canada PT6A-140',
        totalFlightHours: Number(aircraftForm.totalFlightHours) || 0,
        engineCycles: Number(aircraftForm.engineCycles) || 0,
        status: (aircraftForm.status as any) || 'AIRWORTHY',
        seatCapacity: Number(aircraftForm.seatCapacity) || 8,
        petCapacity: Number(aircraftForm.petCapacity) || 2,
        baseAirport: aircraftForm.baseAirport || 'JER',
        lastInspectionDate: aircraftForm.lastInspectionDate || new Date().toISOString().split('T')[0],
        nextScheduledCheckHours: Number(aircraftForm.nextScheduledCheckHours) || 500,
      };
      onUpdateAircrafts([newAc, ...aircrafts]);
      onLogEvent('ENTITY_CRUD', `Created Aircraft entity [${newAc.registration}] in tenant FLYECLIPSE_CI`, newAc.registration);
    } else if (modalMode === 'EDIT' && editingItem) {
      const updated = aircrafts.map((a) =>
        a.registration === editingItem.registration ? ({ ...a, ...aircraftForm } as Aircraft) : a
      );
      onUpdateAircrafts(updated);
      onLogEvent('ENTITY_CRUD', `Updated Aircraft entity [${editingItem.registration}] fields`, editingItem.registration);
    }
    setModalMode(null);
    setEditingItem(null);
  };

  const handleDeleteAircraft = (registration: string) => {
    if (confirm(`Confirm deletion of Aircraft entity ${registration}?`)) {
      onUpdateAircrafts(aircrafts.filter((a) => a.registration !== registration));
      onLogEvent('ENTITY_CRUD', `Deleted Aircraft entity [${registration}]`, registration);
    }
  };

  // ---------------------------------------------
  // FLIGHT SCHEDULE CRUD HANDLERS
  // ---------------------------------------------
  const handleSaveFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'ADD') {
      const newF: RegularFlight = {
        id: 'FE-' + Math.floor(100 + Math.random() * 900),
        flightNumber: flightForm.flightNumber || 'FE-109',
        departureTime: flightForm.departureTime || '08:00',
        arrivalTime: flightForm.arrivalTime || '08:35',
        fromCode: flightForm.fromCode || 'JER',
        toCode: flightForm.toCode || 'ACI',
        aircraftRegistration: flightForm.aircraftRegistration || 'G-ECLP',
        pilotId: flightForm.pilotId || 'PLT-01',
        status: (flightForm.status as any) || 'ON_TIME',
        date: flightForm.date || '2026-09-14',
        availableSeatsCount: 8,
        bookedSeats: [],
        reservedSeats: [],
      };
      onUpdateSchedules([newF, ...schedules]);
      onLogEvent('ENTITY_CRUD', `Created FlightSchedule entity [${newF.flightNumber}] (${newF.fromCode}->${newF.toCode})`, newF.id);
    } else if (modalMode === 'EDIT' && editingItem) {
      const updated = schedules.map((f) =>
        f.id === editingItem.id ? ({ ...f, ...flightForm } as RegularFlight) : f
      );
      onUpdateSchedules(updated);
      onLogEvent('ENTITY_CRUD', `Updated FlightSchedule entity [${editingItem.flightNumber}]`, editingItem.id);
    }
    setModalMode(null);
    setEditingItem(null);
  };

  const handleDeleteFlight = (id: string, flightNumber: string) => {
    if (confirm(`Confirm deletion of FlightSchedule ${flightNumber}?`)) {
      onUpdateSchedules(schedules.filter((f) => f.id !== id));
      onLogEvent('ENTITY_CRUD', `Deleted FlightSchedule entity [${flightNumber}]`, id);
    }
  };

  // ---------------------------------------------
  // PILOT / CREW CRUD HANDLERS
  // ---------------------------------------------
  const handleSaveCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'ADD') {
      const newC: PilotCrew = {
        id: 'PLT-0' + (crew.length + 1),
        name: crewForm.name || 'Capt. Pilot',
        callsign: crewForm.callsign || 'Eclipse Pilot',
        role: (crewForm.role as any) || 'CAPTAIN',
        licenseNumber: crewForm.licenseNumber || 'UK.ATPL.9921',
        medicalExpiry: crewForm.medicalExpiry || '2027-10-01',
        aircraftRatings: ['Cessna 208B', 'PT6A Turboprop', 'Channel Islands IFR'],
        totalFlightHours: Number(crewForm.totalFlightHours) || 3000,
        hoursThisMonth: Number(crewForm.hoursThisMonth) || 10,
        dutyStatus: (crewForm.dutyStatus as any) || 'ON_DUTY',
        baseAirport: crewForm.baseAirport || 'JER',
        photoUrl: crewForm.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
      };
      onUpdateCrew([newC, ...crew]);
      onLogEvent('ENTITY_CRUD', `Created Pilot entity [${newC.name}] (${newC.licenseNumber})`, newC.id);
    } else if (modalMode === 'EDIT' && editingItem) {
      const updated = crew.map((c) =>
        c.id === editingItem.id ? ({ ...c, ...crewForm } as PilotCrew) : c
      );
      onUpdateCrew(updated);
      onLogEvent('ENTITY_CRUD', `Updated Pilot entity [${editingItem.name}]`, editingItem.id);
    }
    setModalMode(null);
    setEditingItem(null);
  };

  const handleDeleteCrew = (id: string, name: string) => {
    if (confirm(`Confirm deletion of Pilot entity ${name}?`)) {
      onUpdateCrew(crew.filter((c) => c.id !== id));
      onLogEvent('ENTITY_CRUD', `Deleted Pilot entity [${name}]`, id);
    }
  };

  // ---------------------------------------------
  // BOOKING CANCELLATION / STATUS CHANGE
  // ---------------------------------------------
  const handleUpdateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b));
    onUpdateBookings(updated);
    onLogEvent('ENTITY_CRUD', `Updated Booking [${bookingId}] status to ${newStatus}`, bookingId);
  };

  const handleDeleteBooking = (bookingId: string, pnr: string) => {
    if (confirm(`Confirm deletion of Booking PNR ${pnr}? Associated tickets and pet records will cascade.`)) {
      onUpdateBookings(bookings.filter((b) => b.id !== bookingId));
      onUpdateTickets(tickets.filter((t) => t.pnr !== pnr));
      onLogEvent('ENTITY_CRUD', `Cascaded deletion of Booking [${pnr}] and associated Tickets/Pets`, bookingId);
    }
  };

  // ---------------------------------------------
  // TICKET CHECK-IN TOGGLE
  // ---------------------------------------------
  const handleToggleTicketCheckIn = (ticketNumber: string) => {
    const updated = tickets.map((t) =>
      t.ticketNumber === ticketNumber ? { ...t, checkedIn: !t.checkedIn } : t
    );
    onUpdateTickets(updated);
    onLogEvent('ENTITY_CRUD', `Toggled Check-In status on Ticket [${ticketNumber}]`, ticketNumber);
  };

  // ---------------------------------------------
  // PET ADD TO BOOKING
  // ---------------------------------------------
  const handleAddPetToBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBooking = bookings.find((b) => b.id === petForm.bookingId);
    if (!targetBooking) return;

    const newPet: PetInfo = {
      id: 'PET-' + Math.floor(100 + Math.random() * 900),
      name: petForm.name,
      type: petForm.type,
      breed: petForm.breed,
      weightKg: Number(petForm.weightKg),
      vetCertificateNumber: petForm.vetCertificateNumber,
      crateRequired: petForm.crateRequired,
      assignedZone: petForm.assignedZone,
    };

    const updatedBookings = bookings.map((b) => {
      if (b.id === petForm.bookingId) {
        return {
          ...b,
          pets: [...b.pets, newPet],
        };
      }
      return b;
    });

    onUpdateBookings(updatedBookings);
    onLogEvent('ENTITY_CRUD', `Added Pet entity [${newPet.name} (${newPet.breed})] to Booking ${targetBooking.pnr}`, newPet.id);
    setModalMode(null);
  };

  return (
    <div id="entity-management-hub" className="space-y-6">
      {/* Header with Discriminator badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#6d3cc7] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
              GORM & Domain Entity Studio
            </span>
            <span className="text-[10px] font-mono bg-purple-50 text-[#6d3cc7] border border-purple-200 px-2 py-0.5 rounded font-bold">
              Discriminator: FLYECLIPSE_CI
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            GORM Domain Entity Manipulation
          </h2>
          <p className="text-xs text-slate-500">
            Create, inspect, update, and cascade-delete GORM domain instances across your fleet, schedules, manifests, and tickets.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          {activeEntity === 'Aircraft' && (
            <button
              onClick={() => {
                setAircraftForm({
                  registration: 'G-ECL' + String.fromCharCode(65 + Math.floor(Math.random() * 26)),
                  model: 'Cessna 208B Grand Caravan EX',
                  nickname: 'Island Shuttle',
                  engine: 'Pratt & Whitney PT6A-140 Turboprop',
                  totalFlightHours: 120,
                  engineCycles: 240,
                  status: 'AIRWORTHY',
                  seatCapacity: 8,
                  petCapacity: 2,
                  baseAirport: 'JER',
                  lastInspectionDate: '2026-09-12',
                  nextScheduledCheckHours: 500,
                });
                setModalMode('ADD');
              }}
              className="px-4 py-2 bg-[#6d3cc7] hover:bg-[#5426a5] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Aircraft Domain
            </button>
          )}

          {activeEntity === 'FlightSchedule' && (
            <button
              onClick={() => {
                setFlightForm({
                  flightNumber: 'FE-' + Math.floor(110 + Math.random() * 90),
                  departureTime: '12:00',
                  arrivalTime: '12:35',
                  fromCode: 'JER',
                  toCode: 'BOH',
                  aircraftRegistration: aircrafts[0]?.registration || 'G-ECLP',
                  pilotId: crew[0]?.id || 'PLT-01',
                  status: 'ON_TIME',
                  date: '2026-09-14',
                  availableSeatsCount: 8,
                  bookedSeats: [],
                  reservedSeats: [],
                });
                setModalMode('ADD');
              }}
              className="px-4 py-2 bg-[#6d3cc7] hover:bg-[#5426a5] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Flight Schedule
            </button>
          )}

          {activeEntity === 'Pilot' && (
            <button
              onClick={() => {
                setCrewForm({
                  name: 'Capt. New Aviator',
                  callsign: 'Island Wing',
                  role: 'CAPTAIN',
                  licenseNumber: 'UK.ATPL.' + Math.floor(100000 + Math.random() * 900000),
                  medicalExpiry: '2027-11-15',
                  totalFlightHours: 3500,
                  hoursThisMonth: 15.0,
                  dutyStatus: 'ON_DUTY',
                  baseAirport: 'JER',
                  photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
                });
                setModalMode('ADD');
              }}
              className="px-4 py-2 bg-[#6d3cc7] hover:bg-[#5426a5] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Pilot Domain
            </button>
          )}

          {activeEntity === 'Pet' && (
            <button
              onClick={() => {
                setPetForm({
                  bookingId: bookings[0]?.id || '',
                  name: 'Bella',
                  type: 'DOG',
                  breed: 'Labrador Retriever',
                  weightKg: 24.5,
                  vetCertificateNumber: 'UK-VET-2026-7712',
                  crateRequired: true,
                  assignedZone: 'CRATE_BAY_1',
                });
                setModalMode('ADD');
              }}
              className="px-4 py-2 bg-[#6d3cc7] hover:bg-[#5426a5] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Attach Pet Domain
            </button>
          )}
        </div>
      </div>

      {/* Entity Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'Aircraft', label: 'Aircraft Domain', count: aircrafts.length, icon: Plane },
          { id: 'FlightSchedule', label: 'FlightSchedule Domain', count: schedules.length, icon: Calendar },
          { id: 'Booking', label: 'Booking Domain', count: bookings.length, icon: Database },
          { id: 'Ticket', label: 'Ticket Domain', count: tickets.length, icon: TicketIcon },
          { id: 'Passenger', label: 'Passenger Manifest', count: allPassengers.length, icon: Users },
          { id: 'Pet', label: 'Pet Domain', count: allPets.length, icon: Dog },
          { id: 'Pilot', label: 'Pilot Domain', count: crew.length, icon: Shield },
          { id: 'MaintenanceLog', label: 'MaintenanceLog Domain', count: maintenanceLogs.length, icon: Wrench },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeEntity === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveEntity(tab.id as EntityCategory);
                setSearchTerm('');
              }}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-[#6d3cc7] text-white border-[#6d3cc7] shadow-md shadow-purple-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Table Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeEntity} domain records (discriminator: FLYECLIPSE_CI)...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6d3cc7]/20"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>GORM Mode: MultiTenancySettings.Mode.DISCRIMINATOR</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. AIRCRAFT DOMAIN TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeEntity === 'Aircraft' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Registration</th>
                <th className="p-4">Model & Nickname</th>
                <th className="p-4">Engine (PT6A)</th>
                <th className="p-4">Total Hours / Cycles</th>
                <th className="p-4">Capacities</th>
                <th className="p-4">Status</th>
                <th className="p-4">Base</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {aircrafts
                .filter(
                  (a) =>
                    a.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.nickname.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((ac) => (
                  <tr key={ac.registration} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 text-sm">
                      {ac.registration}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{ac.model}</div>
                      <div className="text-[11px] text-slate-400 italic">"{ac.nickname}"</div>
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-[11px]">{ac.engine}</td>
                    <td className="p-4 font-mono">
                      <div>{ac.totalFlightHours.toFixed(1)} hrs</div>
                      <div className="text-slate-400 text-[10px]">{ac.engineCycles} cycles</div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-purple-700">{ac.seatCapacity} Seats</span> •{' '}
                      <span className="text-emerald-700 font-bold">{ac.petCapacity} Pet Bays</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          ac.status === 'AIRWORTHY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ac.status === 'MAINTENANCE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ac.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">{ac.baseAirport}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(ac);
                          setAircraftForm(ac);
                          setModalMode('EDIT');
                        }}
                        className="p-1.5 text-slate-500 hover:text-[#6d3cc7] hover:bg-purple-50 rounded-lg transition-all"
                        title="Edit Aircraft Entity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAircraft(ac.registration)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Aircraft Entity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. FLIGHT SCHEDULE DOMAIN TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeEntity === 'FlightSchedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Flight #</th>
                <th className="p-4">Date</th>
                <th className="p-4">Route</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Assigned Aircraft</th>
                <th className="p-4">Seats Free</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {schedules
                .filter(
                  (f) =>
                    f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.fromCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.toCode.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((flight) => (
                  <tr key={flight.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 text-sm">
                      {flight.flightNumber}
                    </td>
                    <td className="p-4 font-mono text-slate-600">{flight.date}</td>
                    <td className="p-4 font-bold text-slate-800">
                      {flight.fromCode} → {flight.toCode}
                    </td>
                    <td className="p-4 font-mono">
                      {flight.departureTime} - {flight.arrivalTime}
                    </td>
                    <td className="p-4 font-mono text-amber-700 font-bold">
                      {flight.aircraftRegistration}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-600">
                        {flight.availableSeatsCount} / 8 Available
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          flight.status === 'ON_TIME'
                            ? 'bg-emerald-100 text-emerald-800'
                            : flight.status === 'DELAYED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {flight.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(flight);
                          setFlightForm(flight);
                          setModalMode('EDIT');
                        }}
                        className="p-1.5 text-slate-500 hover:text-[#6d3cc7] hover:bg-purple-50 rounded-lg transition-all"
                        title="Edit FlightSchedule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFlight(flight.id, flight.flightNumber)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete FlightSchedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. BOOKING DOMAIN TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeEntity === 'Booking' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Booking Ref / PNR</th>
                <th className="p-4">Flight & Date</th>
                <th className="p-4">Lead Passenger</th>
                <th className="p-4">Seats Allocated</th>
                <th className="p-4">Total Fare</th>
                <th className="p-4">Booking Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {bookings
                .filter(
                  (b) =>
                    b.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    b.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    b.leadPassengerName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-black text-slate-900 text-sm">{b.pnr}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.referenceNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">
                        {b.flightNumber} ({b.fromCode} → {b.toCode})
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {b.departureDate} @ {b.departureTime}
                      </div>
                      {b.isReturnTrip && (
                        <div className="text-[10px] text-amber-700 font-bold">
                          + Return: {b.returnFlightNumber} on {b.returnDepartureDate}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{b.leadPassengerName}</div>
                      <div className="text-[10px] text-slate-400">{b.userEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold bg-purple-100 text-[#6d3cc7] px-2 py-0.5 rounded">
                        {b.seatIds.join(', ')}
                      </span>
                      {b.returnSeatIds && b.returnSeatIds.length > 0 && (
                        <span className="font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded ml-1">
                          Ret: {b.returnSeatIds.join(', ')}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-black text-slate-900 text-sm">
                      £{b.totalFare}
                    </td>
                    <td className="p-4">
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="HELD">HELD (2h Hold)</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CHECKED_IN">CHECKED_IN</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          b.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.paymentStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteBooking(b.id, b.pnr)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Booking Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. TICKET DOMAIN TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeEntity === 'Ticket' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Ticket Number</th>
                <th className="p-4">PNR</th>
                <th className="p-4">Passenger Name</th>
                <th className="p-4">Flight & Seat</th>
                <th className="p-4">Route</th>
                <th className="p-4">Gate</th>
                <th className="p-4">Check-In Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tickets
                .filter(
                  (t) =>
                    t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.pnr.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((ticket) => (
                  <tr key={ticket.ticketNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {ticket.ticketNumber}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#6d3cc7]">{ticket.pnr}</td>
                    <td className="p-4 font-bold text-slate-800">{ticket.passengerName}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">{ticket.flightNumber}</span> •{' '}
                      <span className="font-mono bg-purple-100 text-[#6d3cc7] px-1.5 py-0.5 rounded font-bold">
                        Seat {ticket.seatNumber}
                      </span>
                    </td>
                    <td className="p-4 font-bold">
                      {ticket.origin} → {ticket.destination}
                    </td>
                    <td className="p-4 font-mono text-slate-600">{ticket.gate}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleTicketCheckIn(ticket.ticketNumber)}
                        className={`px-3 py-1 rounded-full font-bold text-[10px] transition-all flex items-center gap-1 ${
                          ticket.checkedIn
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {ticket.checkedIn ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Checked In
                          </>
                        ) : (
                          'Not Checked In'
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove Ticket ${ticket.ticketNumber}?`)) {
                            onUpdateTickets(tickets.filter((t) => t.ticketNumber !== ticket.ticketNumber));
                            onLogEvent('ENTITY_CRUD', `Deleted Ticket ${ticket.ticketNumber}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. PASSENGER MANIFEST DOMAIN TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeEntity === 'Passenger' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Passenger ID</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">DOB</th>
                <th className="p-4">Passport # & Country</th>
                <th className="p-4">Contact (Phone & Email)</th>
                <th className="p-4">Booking PNR</th>
                <th className="p-4">Flight</th>
                <th className="p-4">Seat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {allPassengers
                .filter(
                  (p) =>
                    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.pnr.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((pax) => (
                  <tr key={pax.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-700">{pax.id}</td>
                    <td className="p-4 font-bold text-slate-900">
                      {pax.title} {pax.firstName} {pax.lastName}
                    </td>
                    <td className="p-4 font-mono text-slate-600">{pax.dob}</td>
                    <td className="p-4 font-mono">
                      <span className="font-bold">{pax.passportNumber}</span>{' '}
                      <span className="text-slate-400">({pax.passportCountry})</span>
                    </td>
                    <td className="p-4 text-[11px] text-slate-600">
                      <div>{pax.phone || 'N/A'}</div>
                      <div className="text-slate-400">{pax.email}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#6d3cc7]">{pax.pnr}</td>
                    <td className="p-4 font-bold text-slate-700">{pax.flightNumber}</td>
                    <td className="p-4 font-mono font-bold bg-purple-50 text-[#6d3cc7]">
                      {pax.seatId || '1A'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. PET DOMAIN TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeEntity === 'Pet' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Pet ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Type & Breed</th>
                <th className="p-4">Weight</th>
                <th className="p-4">Vet Certificate #</th>
                <th className="p-4">Cessna Crate Zone</th>
                <th className="p-4">Booking PNR</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {allPets
                .filter(
                  (pet) =>
                    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pet.vetCertificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((pet) => (
                  <tr key={pet.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-700">{pet.id}</td>
                    <td className="p-4 font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Dog className="w-3.5 h-3.5 text-emerald-600" />
                      {pet.name}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{pet.breed}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{pet.type}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">{pet.weightKg} kg</td>
                    <td className="p-4 font-mono text-emerald-700 font-bold">
                      {pet.vetCertificateNumber}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#6d3cc7] bg-purple-50">
                      {pet.assignedZone || 'CRATE_BAY_1'}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">{pet.pnr}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove pet ${pet.name} from booking?`)) {
                            const updated = bookings.map((b) => ({
                              ...b,
                              pets: b.pets.filter((p) => p.id !== pet.id),
                            }));
                            onUpdateBookings(updated);
                            onLogEvent('ENTITY_CRUD', `Removed Pet ${pet.name} from Booking ${pet.pnr}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. PILOT / CREW DOMAIN TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeEntity === 'Pilot' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Pilot</th>
                <th className="p-4">Callsign</th>
                <th className="p-4">Role</th>
                <th className="p-4">License Number</th>
                <th className="p-4">Medical Expiry</th>
                <th className="p-4">Total Hours</th>
                <th className="p-4">Duty Status</th>
                <th className="p-4">Base</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {crew
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{member.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{member.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#6d3cc7]">{member.callsign}</td>
                    <td className="p-4 font-bold text-slate-700">{member.role}</td>
                    <td className="p-4 font-mono font-bold text-slate-800">{member.licenseNumber}</td>
                    <td className="p-4 font-mono text-slate-600">{member.medicalExpiry}</td>
                    <td className="p-4 font-mono font-bold">{member.totalFlightHours} hrs</td>
                    <td className="p-4">
                      <select
                        value={member.dutyStatus}
                        onChange={(e) => {
                          const updated = crew.map((c) =>
                            c.id === member.id ? { ...c, dutyStatus: e.target.value as any } : c
                          );
                          onUpdateCrew(updated);
                          onLogEvent('ENTITY_CRUD', `Updated duty status of ${member.name} to ${e.target.value}`);
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="ON_DUTY">ON_DUTY</option>
                        <option value="STANDBY">STANDBY</option>
                        <option value="RESTING">RESTING</option>
                        <option value="IN_FLIGHT">IN_FLIGHT</option>
                      </select>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">{member.baseAirport}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(member);
                          setCrewForm(member);
                          setModalMode('EDIT');
                        }}
                        className="p-1.5 text-slate-500 hover:text-[#6d3cc7] hover:bg-purple-50 rounded-lg transition-all"
                        title="Edit Pilot Entity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCrew(member.id, member.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Pilot Entity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. MAINTENANCE LOG DOMAIN TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeEntity === 'MaintenanceLog' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Log ID</th>
                <th className="p-4">Aircraft</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Part 66 Technician</th>
                <th className="p-4">Airworthiness Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {maintenanceLogs
                .filter(
                  (m) =>
                    m.aircraftRegistration.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    m.technicianName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-700">{log.id}</td>
                    <td className="p-4 font-mono font-black text-amber-700">
                      {log.aircraftRegistration}
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      {log.logDate} {log.logTime}
                    </td>
                    <td className="p-4 font-bold text-slate-800">{log.category}</td>
                    <td className="p-4 max-w-xs text-slate-600 truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{log.technicianName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.technicianLicense}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          log.status === 'CLEARED_AIRWORTHY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove Maintenance Log ${log.id}?`)) {
                            onUpdateMaintenanceLogs(maintenanceLogs.filter((l) => l.id !== log.id));
                            onLogEvent('ENTITY_CRUD', `Deleted MaintenanceLog ${log.id}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT AIRCRAFT */}
      {/* ------------------------------------------------------------- */}
      {modalMode && activeEntity === 'Aircraft' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg">
                {modalMode === 'ADD' ? 'Create Aircraft GORM Domain' : 'Edit Aircraft GORM Domain'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAircraft} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Registration (PK)</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'EDIT'}
                    value={aircraftForm.registration}
                    onChange={(e) => setAircraftForm({ ...aircraftForm, registration: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                    placeholder="e.g. G-ECLP"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nickname</label>
                  <input
                    type="text"
                    value={aircraftForm.nickname}
                    onChange={(e) => setAircraftForm({ ...aircraftForm, nickname: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    placeholder="Island Falcon"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Model</label>
                <input
                  type="text"
                  value={aircraftForm.model}
                  onChange={(e) => setAircraftForm({ ...aircraftForm, model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Engine Specification</label>
                <input
                  type="text"
                  value={aircraftForm.engine}
                  onChange={(e) => setAircraftForm({ ...aircraftForm, engine: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Flight Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aircraftForm.totalFlightHours}
                    onChange={(e) => setAircraftForm({ ...aircraftForm, totalFlightHours: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Engine Cycles</label>
                  <input
                    type="number"
                    value={aircraftForm.engineCycles}
                    onChange={(e) => setAircraftForm({ ...aircraftForm, engineCycles: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base Airport</label>
                  <select
                    value={aircraftForm.baseAirport}
                    onChange={(e) => setAircraftForm({ ...aircraftForm, baseAirport: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="JER">JER (Jersey)</option>
                    <option value="GCI">GCI (Guernsey)</option>
                    <option value="ACI">ACI (Alderney)</option>
                    <option value="BOH">BOH (Bournemouth)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passenger Seats</label>
                  <input
                    type="number"
                    value={aircraftForm.seatCapacity}
                    onChange={(e) => setAircraftForm({ ...aircraftForm, seatCapacity: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Airworthiness Status</label>
                  <select
                    value={aircraftForm.status}
                    onChange={(e) => setAircraftForm({ ...aircraftForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="AIRWORTHY">AIRWORTHY</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="IN_FLIGHT">IN_FLIGHT</option>
                    <option value="PRE_FLIGHT_CHECK">PRE_FLIGHT_CHECK</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#6d3cc7] hover:bg-[#5426a5] text-white rounded-xl font-bold shadow"
                >
                  {modalMode === 'ADD' ? 'Save Aircraft Entity' : 'Update Aircraft Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT FLIGHT SCHEDULE */}
      {/* ------------------------------------------------------------- */}
      {modalMode && activeEntity === 'FlightSchedule' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg">
                {modalMode === 'ADD' ? 'New Flight Schedule' : 'Edit Flight Schedule'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFlight} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Flight Number</label>
                  <input
                    type="text"
                    required
                    value={flightForm.flightNumber}
                    onChange={(e) => setFlightForm({ ...flightForm, flightNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                    placeholder="FE-109"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={flightForm.date}
                    onChange={(e) => setFlightForm({ ...flightForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Origin (From)</label>
                  <select
                    value={flightForm.fromCode}
                    onChange={(e) => setFlightForm({ ...flightForm, fromCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="JER">JER (Jersey)</option>
                    <option value="ACI">ACI (Alderney)</option>
                    <option value="GCI">GCI (Guernsey)</option>
                    <option value="BOH">BOH (Bournemouth)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destination (To)</label>
                  <select
                    value={flightForm.toCode}
                    onChange={(e) => setFlightForm({ ...flightForm, toCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="JER">JER (Jersey)</option>
                    <option value="ACI">ACI (Alderney)</option>
                    <option value="GCI">GCI (Guernsey)</option>
                    <option value="BOH">BOH (Bournemouth)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Departure Time</label>
                  <input
                    type="time"
                    required
                    value={flightForm.departureTime}
                    onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Arrival Time</label>
                  <input
                    type="time"
                    required
                    value={flightForm.arrivalTime}
                    onChange={(e) => setFlightForm({ ...flightForm, arrivalTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Aircraft</label>
                  <select
                    value={flightForm.aircraftRegistration}
                    onChange={(e) => setFlightForm({ ...flightForm, aircraftRegistration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  >
                    {aircrafts.map((ac) => (
                      <option key={ac.registration} value={ac.registration}>
                        {ac.registration} ({ac.nickname})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Flight Status</label>
                  <select
                    value={flightForm.status}
                    onChange={(e) => setFlightForm({ ...flightForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="ON_TIME">ON_TIME</option>
                    <option value="DELAYED">DELAYED</option>
                    <option value="BOARDING">BOARDING</option>
                    <option value="IN_FLIGHT">IN_FLIGHT</option>
                    <option value="LANDED">LANDED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#6d3cc7] hover:bg-[#5426a5] text-white rounded-xl font-bold shadow"
                >
                  {modalMode === 'ADD' ? 'Save Flight Schedule' : 'Update Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PILOT */}
      {/* ------------------------------------------------------------- */}
      {modalMode && activeEntity === 'Pilot' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg">
                {modalMode === 'ADD' ? 'Add Pilot / Crew Domain' : 'Edit Pilot'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCrew} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pilot Name</label>
                  <input
                    type="text"
                    required
                    value={crewForm.name}
                    onChange={(e) => setCrewForm({ ...crewForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Callsign</label>
                  <input
                    type="text"
                    value={crewForm.callsign}
                    onChange={(e) => setCrewForm({ ...crewForm, callsign: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={crewForm.role}
                    onChange={(e) => setCrewForm({ ...crewForm, role: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="CAPTAIN">CAPTAIN</option>
                    <option value="FIRST_OFFICER">FIRST_OFFICER</option>
                    <option value="FLIGHT_DISPATCHER">FLIGHT_DISPATCHER</option>
                    <option value="A&P_CHIEF_ENGINEER">A&P_CHIEF_ENGINEER</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">License #</label>
                  <input
                    type="text"
                    value={crewForm.licenseNumber}
                    onChange={(e) => setCrewForm({ ...crewForm, licenseNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Hours</label>
                  <input
                    type="number"
                    value={crewForm.totalFlightHours}
                    onChange={(e) => setCrewForm({ ...crewForm, totalFlightHours: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duty Status</label>
                  <select
                    value={crewForm.dutyStatus}
                    onChange={(e) => setCrewForm({ ...crewForm, dutyStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="ON_DUTY">ON_DUTY</option>
                    <option value="STANDBY">STANDBY</option>
                    <option value="RESTING">RESTING</option>
                    <option value="IN_FLIGHT">IN_FLIGHT</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base</label>
                  <select
                    value={crewForm.baseAirport}
                    onChange={(e) => setCrewForm({ ...crewForm, baseAirport: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="JER">JER</option>
                    <option value="ACI">ACI</option>
                    <option value="GCI">GCI</option>
                    <option value="BOH">BOH</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#6d3cc7] hover:bg-[#5426a5] text-white rounded-xl font-bold shadow"
                >
                  Save Pilot Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ATTACH PET TO BOOKING */}
      {/* ------------------------------------------------------------- */}
      {modalMode && activeEntity === 'Pet' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg">Attach Pet GORM Domain</h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPetToBooking} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Booking (PNR)</label>
                <select
                  required
                  value={petForm.bookingId}
                  onChange={(e) => setPetForm({ ...petForm, bookingId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.pnr} ({b.referenceNumber}) - {b.leadPassengerName} ({b.flightNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pet Name</label>
                  <input
                    type="text"
                    required
                    value={petForm.name}
                    onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    placeholder="e.g. Jasper"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={petForm.type}
                    onChange={(e) => setPetForm({ ...petForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="DOG">DOG</option>
                    <option value="CAT">CAT</option>
                    <option value="BIRD">BIRD</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Breed</label>
                  <input
                    type="text"
                    required
                    value={petForm.breed}
                    onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    placeholder="e.g. Golden Retriever"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={petForm.weightKg}
                    onChange={(e) => setPetForm({ ...petForm, weightKg: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vet Certificate #</label>
                  <input
                    type="text"
                    required
                    value={petForm.vetCertificateNumber}
                    onChange={(e) => setPetForm({ ...petForm, vetCertificateNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                    placeholder="UK-VET-2026-9041"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cessna Crate Zone</label>
                  <select
                    value={petForm.assignedZone}
                    onChange={(e) => setPetForm({ ...petForm, assignedZone: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="CRATE_BAY_1">Aft Crate Bay 1 (Climate Controlled)</option>
                    <option value="CRATE_BAY_2">Aft Crate Bay 2 (Climate Controlled)</option>
                    <option value="UNDER_SEAT">Under-Seat Cabin Tether (Small pets &lt; 8kg)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#6d3cc7] hover:bg-[#5426a5] text-white rounded-xl font-bold shadow"
                >
                  Attach Pet Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
