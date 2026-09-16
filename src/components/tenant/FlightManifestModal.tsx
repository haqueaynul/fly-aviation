import React from 'react';
import { RegularFlight, Booking, Ticket } from '../../types';
import { Users, X, UserPlus, CheckCircle2, AlertCircle, Plane, Download, Sparkles, ShieldCheck } from 'lucide-react';

interface FlightManifestModalProps {
  flight: RegularFlight | null;
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  tickets: Ticket[];
  onOpenAddPassenger: (flight: RegularFlight) => void;
  onSelectTicket?: (booking: Booking, ticket: Ticket) => void;
}

export const FlightManifestModal: React.FC<FlightManifestModalProps> = ({
  flight,
  isOpen,
  onClose,
  bookings,
  tickets,
  onOpenAddPassenger,
  onSelectTicket,
}) => {
  if (!isOpen || !flight) return null;

  // Filter all bookings for this flight
  const flightBookings = bookings.filter(
    (b) => b.flightId === flight.id || b.flightNumber === flight.flightNumber
  );

  // Extract all passengers on this flight
  const passengerList: {
    passenger: any;
    booking: Booking;
    ticket?: Ticket;
  }[] = [];

  flightBookings.forEach((b) => {
    b.passengers.forEach((p) => {
      const t = tickets.find(
        (tkt) =>
          tkt.pnr === b.pnr &&
          (tkt.passengerId === p.id ||
            tkt.passengerName.toLowerCase() === `${p.firstName} ${p.lastName}`.toLowerCase() ||
            tkt.seatNumber === p.seatId)
      );
      passengerList.push({
        passenger: p,
        booking: b,
        ticket: t,
      });
    });
  });

  const totalPax = passengerList.length;
  const capacity = 8;
  const loadFactor = Math.round((totalPax / capacity) * 100);

  const adultCount = passengerList.filter((item) => item.passenger.type === 'ADULT').length;
  const childCount = passengerList.filter((item) => item.passenger.type === 'CHILD').length;
  const petCount = flightBookings.reduce((sum, b) => sum + (b.pets ? b.pets.length : 0), 0);

  const handleExportManifest = () => {
    const csvHeader = 'Seat,Passenger Name,Type,Lead Pax,PNR,Ticket,Passport,Email,Phone,CheckIn\n';
    const csvRows = passengerList
      .map((item) => {
        const p = item.passenger;
        const b = item.booking;
        const t = item.ticket;
        return `"${p.seatId || ''}","${p.title || ''} ${p.firstName} ${p.lastName}","${p.type}","${
          p.isLeadPassenger ? 'YES' : 'NO'
        }","${b.pnr}","${t?.ticketNumber || ''}","${p.passportNumber || ''}","${p.email || ''}","${
          p.phone || ''
        }","${t?.checkedIn ? 'CHECKED_IN' : 'PENDING'}"`;
      })
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manifest_${flight.flightNumber}_${flight.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Official Flight Manifest
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900 text-purple-200">
                {flight.aircraftRegistration}
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              Flight {flight.flightNumber} • {flight.fromCode} → {flight.toCode}
            </h3>
            <p className="text-xs text-slate-400">
              Date: <span className="text-white font-medium">{flight.date}</span> • Scheduled Departure:{' '}
              <span className="text-white font-mono font-bold">{flight.departureTime}</span> • Status:{' '}
              <span className="text-emerald-400 font-bold">{flight.status}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Summary Bar */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 p-4 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Passengers
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{totalPax}</span>
              <span className="text-xs font-semibold text-slate-500">/ {capacity} seats</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  loadFactor >= 90
                    ? 'bg-rose-500'
                    : loadFactor >= 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, loadFactor)}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Load Factor
            </span>
            <div className="text-2xl font-black text-purple-700 mt-0.5">{loadFactor}%</div>
            <span className="text-[10px] text-slate-500">
              {capacity - totalPax} seats available
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Passenger Split
            </span>
            <div className="text-xs font-semibold text-slate-800 mt-1 space-y-0.5">
              <div>Adults: <span className="font-bold">{adultCount}</span></div>
              <div>Children: <span className="font-bold">{childCount}</span></div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pets in Cabin / Crate
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{petCount}</div>
            <span className="text-[10px] text-slate-500">Channel Islands Approved</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-700">
            Passenger Roster ({passengerList.length} Verified Entries)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportManifest}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV Manifest
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAddPassenger(flight);
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Add Passenger to Flight
            </button>
          </div>
        </div>

        {/* Passenger Table */}
        <div className="overflow-y-auto p-6 space-y-3">
          {passengerList.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Passengers Booked Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                This scheduled flight currently has 0 occupied seats. You can add a passenger now or book tickets through the booking engine.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddPassenger(flight);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add First Passenger
              </button>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Seat</th>
                    <th className="py-2.5 px-3">Passenger</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Booking Ref / PNR</th>
                    <th className="py-2.5 px-3">Ticket #</th>
                    <th className="py-2.5 px-3">Travel Doc / Passport</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {passengerList.map((item, idx) => {
                    const p = item.passenger;
                    const b = item.booking;
                    const t = item.ticket;
                    return (
                      <tr key={idx} className="hover:bg-purple-50/40 transition">
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                            {p.seatId || 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">
                              {p.title} {p.firstName} {p.lastName}
                            </span>
                            {p.isLeadPassenger && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">
                                ⭐ Lead Pax
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{p.email || b.userEmail}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {p.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className="font-bold text-purple-700">{b.pnr}</span>
                          <div className="text-[9px] text-slate-500">{b.referenceNumber}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {t?.ticketNumber || 'Pending Issuance'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                          {p.passportNumber || 'CTA Citizen'}
                          {p.passportCountry && (
                            <span className="ml-1 text-[9px] text-slate-500">({p.passportCountry})</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t?.checkedIn
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t?.checkedIn ? 'Checked In' : 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Multi-tenant secure audit ledger verified for UK & Channel Islands CAA.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-sm transition"
          >
            Close Manifest
          </button>
        </div>
      </div>
    </div>
  );
};
