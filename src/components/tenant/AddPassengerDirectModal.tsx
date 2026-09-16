import React, { useState } from 'react';
import { RegularFlight, Booking, Ticket, PassengerInfo, CorporateEmployee, UserProfile } from '../../types';
import { Users, UserPlus, CheckCircle2, X, Plane, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

interface AddPassengerDirectModalProps {
  flight: RegularFlight | null;
  isOpen: boolean;
  onClose: () => void;
  corporateEmployees?: CorporateEmployee[];
  currentUser: UserProfile;
  onBookingConfirmed: (newBooking: Booking, newTicket: Ticket) => void;
  onLogEvent: (eventType: any, details: string, entityId?: string) => void;
}

const CABIN_SEATS = ['1A', '1B', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B'];

export const AddPassengerDirectModal: React.FC<AddPassengerDirectModalProps> = ({
  flight,
  isOpen,
  onClose,
  corporateEmployees = [],
  currentUser,
  onBookingConfirmed,
  onLogEvent,
}) => {
  if (!isOpen || !flight) return null;

  // Source selection: 'NEW' or 'SELECT_EMPLOYEE'
  const [sourceType, setSourceType] = useState<'NEW' | 'SELECT_EMPLOYEE'>('NEW');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  const [title, setTitle] = useState<'Mr' | 'Ms' | 'Mrs' | 'Dr' | 'Captain'>('Mr');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dob, setDob] = useState<string>('1990-05-15');
  const [passportNumber, setPassportNumber] = useState<string>('UK8829104');
  const [passportCountry, setPassportCountry] = useState<string>('GBR');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('+44 7700 900123');
  const [isLeadPassenger, setIsLeadPassenger] = useState<boolean>(true);

  // Available seats: filter out seats already booked on this flight
  const availableSeats = CABIN_SEATS.filter(
    (s) => !flight.bookedSeats?.includes(s) && !flight.reservedSeats?.includes(s)
  );
  const [selectedSeat, setSelectedSeat] = useState<string>(availableSeats[0] || '1A');
  const [fareType, setFareType] = useState<'STANDARD' | 'ADMIN_COMP' | 'STAFF_DUTY'>('STANDARD');
  const [customFare, setCustomFare] = useState<number>(1450);

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = corporateEmployees.find((e) => e.id === empId);
    if (emp) {
      setFirstName(emp.firstName);
      setLastName(emp.lastName);
      setEmail(emp.email);
      setPhone(emp.phone);
      setPassportNumber(emp.passportNumber);
      setPassportCountry(emp.passportCountry || 'GBR');
      setDob(emp.dob);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    const pnr = 'AST' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingId = 'BK-' + Date.now();
    const ticketId = 'TK-' + pnr + '01';
    const finalFare = fareType === 'ADMIN_COMP' || fareType === 'STAFF_DUTY' ? 0 : customFare;

    const newPax: PassengerInfo = {
      id: 'PAX-' + Date.now(),
      title,
      firstName,
      lastName,
      type: 'ADULT',
      dob,
      passportNumber,
      passportCountry,
      phone,
      email,
      seatId: selectedSeat,
      isLeadPassenger,
    };

    const newBooking: Booking = {
      id: bookingId,
      referenceNumber: `FE-BK-${Date.now().toString().slice(-4)}`,
      pnr,
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      fromCode: flight.fromCode,
      toCode: flight.toCode,
      departureDate: flight.date,
      departureTime: flight.departureTime,
      aircraftRegistration: flight.aircraftRegistration,
      userId: currentUser.id,
      userEmail: currentUser.email,
      passengers: [newPax],
      pets: [],
      seatIds: [selectedSeat],
      totalFare: finalFare,
      currency: 'GBP',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      bookingCreatedAt: new Date().toISOString(),
      holdExpiresAt: Date.now() + 7200000,
      isCharter: false,
      leadPassengerName: `${firstName} ${lastName}`,
      leadPassengerEmail: email,
    };

    const newTicket: Ticket = {
      ticketNumber: ticketId,
      bookingReference: newBooking.referenceNumber,
      pnr,
      passengerId: newPax.id,
      passengerName: `${firstName} ${lastName}`,
      passengerType: 'ADULT',
      flightNumber: flight.flightNumber,
      origin: flight.fromCode,
      destination: flight.toCode,
      departureDate: flight.date,
      departureTime: flight.departureTime,
      gate: 'GATE 1',
      seatNumber: selectedSeat,
      qrPayload: `FLYECLIPSE:${pnr}:${passportNumber}:${selectedSeat}`,
      barcodeNumber: `${Date.now()}`.slice(-12),
      aircraftModel: 'Cessna 208B Grand Caravan EX',
      baggageAllowance: '20kg Hold + Hand Carry',
      hasPetAttached: false,
      checkedIn: false,
      isLeadPassenger,
      passengerEmail: email,
    };

    onBookingConfirmed(newBooking, newTicket);
    onLogEvent(
      'PASSENGER_ADDED_BY_ADMIN',
      `Passenger ${firstName} ${lastName} added directly to flight ${flight.flightNumber} on seat ${selectedSeat} by ${currentUser.email}`,
      flight.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Direct Passenger Entry
            </span>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Add Passenger to Flight {flight.flightNumber}
            </h3>
            <p className="text-xs text-slate-400">
              {flight.fromCode} → {flight.toCode} • Date: {flight.date} ({flight.departureTime})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Option: Select from corporate roster or type new */}
          {corporateEmployees.length > 0 && (
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSourceType('NEW')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  sourceType === 'NEW'
                    ? 'bg-white shadow-sm text-purple-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                New Passenger Record
              </button>
              <button
                type="button"
                onClick={() => setSourceType('SELECT_EMPLOYEE')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  sourceType === 'SELECT_EMPLOYEE'
                    ? 'bg-white shadow-sm text-purple-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                From Corporate Roster ({corporateEmployees.length})
              </button>
            </div>
          )}

          {sourceType === 'SELECT_EMPLOYEE' && corporateEmployees.length > 0 && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3">
              <label className="block text-xs font-bold text-purple-900 mb-1">
                Select Verified Employee
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full text-xs bg-white border border-purple-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-purple-400"
              >
                <option value="">-- Choose employee from company roster --</option>
                {corporateEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} — {emp.jobTitle} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Passenger details */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Title</label>
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value as any)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
                <option value="Dr">Dr</option>
                <option value="Captain">Captain</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Rachel"
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Carter"
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="passenger@domain.com"
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Passport / ID</label>
              <input
                type="text"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Country Code</label>
              <input
                type="text"
                value={passportCountry}
                onChange={(e) => setPassportCountry(e.target.value.toUpperCase())}
                maxLength={3}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono uppercase focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Seat selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Seat on Cessna 208B Grand Caravan EX
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CABIN_SEATS.map((seat) => {
                const isTaken =
                  flight.bookedSeats?.includes(seat) || flight.reservedSeats?.includes(seat);
                const isSelected = selectedSeat === seat;
                return (
                  <button
                    key={seat}
                    type="button"
                    disabled={isTaken}
                    onClick={() => setSelectedSeat(seat)}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition flex flex-col items-center gap-0.5 ${
                      isSelected
                        ? 'bg-purple-700 text-white border-purple-800 shadow'
                        : isTaken
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <span>{seat}</span>
                    <span className="text-[9px] font-normal uppercase">
                      {isTaken ? 'Occupied' : 'Avail'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fare & Billing */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Fare & Billing Authorization</span>
              <span className="text-xs font-bold font-mono text-purple-700">
                {fareType === 'STANDARD' ? `£${customFare} GBP (PAID)` : '£0 GBP (STAFF / COMP)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFareType('STANDARD')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                  fareType === 'STANDARD'
                    ? 'bg-white border-purple-600 text-purple-700 shadow-sm'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Standard Fare (£{customFare})
              </button>
              <button
                type="button"
                onClick={() => setFareType('ADMIN_COMP')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                  fareType === 'ADMIN_COMP'
                    ? 'bg-white border-purple-600 text-purple-700 shadow-sm'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Admin VIP Comp (£0)
              </button>
              <button
                type="button"
                onClick={() => setFareType('STAFF_DUTY')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                  fareType === 'STAFF_DUTY'
                    ? 'bg-white border-purple-600 text-purple-700 shadow-sm'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Staff Deadhead (£0)
              </button>
            </div>
          </div>

          {/* Lead Passenger Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isLeadPassenger}
              onChange={(e) => setIsLeadPassenger(e.target.checked)}
              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-xs font-medium text-slate-700">
              Designate as Lead Passenger (authorized to check flight status & manage itinerary)
            </span>
          </label>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Issue Ticket & Add to Flight
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
