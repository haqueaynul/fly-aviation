import React, { useState } from 'react';
import { Booking, Ticket } from '../types';
import { Search, Plane, Calendar, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Ticket as TicketIcon, Dog, User, Download } from 'lucide-react';
import { BoardingPassModal } from './BoardingPassModal';
import { downloadBoardingPassPDF } from '../utils/pdfGenerator';

interface PassengerVerificationProps {
  bookings: Booking[];
  tickets: Ticket[];
  onOpenTicket: (ticket: Ticket, booking: Booking) => void;
}

export const PassengerVerification: React.FC<PassengerVerificationProps> = ({
  bookings,
  tickets,
  onOpenTicket,
}) => {
  const [searchType, setSearchType] = useState<'TICKET_NUM' | 'PNR' | 'PHONE' | 'PASSPORT'>('PNR');
  const [query, setQuery] = useState('X9L4KP');
  const [searchResult, setSearchResult] = useState<{ booking: Booking; ticket: Ticket } | null>(null);
  const [searched, setSearched] = useState(false);
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<{ booking: Booking; ticket: Ticket } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const cleanQuery = query.trim().toUpperCase();

    if (!cleanQuery) {
      setSearchResult(null);
      return;
    }

    // Find match
    for (const b of bookings) {
      // Search by PNR
      if (searchType === 'PNR' && (b.pnr.toUpperCase() === cleanQuery || b.referenceNumber.toUpperCase() === cleanQuery)) {
        const ticket = tickets.find((t) => t.pnr === b.pnr) || generateMockTicket(b);
        setSearchResult({ booking: b, ticket });
        return;
      }

      // Search by Phone
      if (searchType === 'PHONE') {
        const hasPhone = b.passengers.some((p) => p.phone && p.phone.replace(/\s+/g, '').includes(cleanQuery.replace(/\s+/g, '')));
        if (hasPhone) {
          const ticket = tickets.find((t) => t.pnr === b.pnr) || generateMockTicket(b);
          setSearchResult({ booking: b, ticket });
          return;
        }
      }

      // Search by Passport
      if (searchType === 'PASSPORT') {
        const hasPassport = b.passengers.some((p) => p.passportNumber.toUpperCase() === cleanQuery);
        if (hasPassport) {
          const ticket = tickets.find((t) => t.pnr === b.pnr) || generateMockTicket(b);
          setSearchResult({ booking: b, ticket });
          return;
        }
      }
    }

    // Search tickets by Ticket Number
    if (searchType === 'TICKET_NUM') {
      const matchTicket = tickets.find((t) => t.ticketNumber.toUpperCase() === cleanQuery);
      if (matchTicket) {
        const booking = bookings.find((b) => b.pnr === matchTicket.pnr);
        if (booking) {
          setSearchResult({ booking, ticket: matchTicket });
          return;
        }
      }
    }

    setSearchResult(null);
  };

  function generateMockTicket(b: Booking): Ticket {
    const leadPax = b.passengers[0];
    return {
      ticketNumber: 'TK-' + b.pnr + '01',
      bookingReference: b.referenceNumber,
      pnr: b.pnr,
      passengerId: leadPax?.id || 'PAX-1',
      passengerName: leadPax ? `${leadPax.firstName} ${leadPax.lastName}` : b.leadPassengerName,
      passengerType: leadPax?.type || 'ADULT',
      flightNumber: b.flightNumber,
      origin: b.fromCode,
      destination: b.toCode,
      departureDate: b.departureDate,
      departureTime: b.departureTime,
      gate: 'GATE 1',
      seatNumber: b.seatIds[0] || '1A',
      qrPayload: `FLYECLIPSE:${b.pnr}:${leadPax?.passportNumber || 'UK984210'}`,
      barcodeNumber: '298104829104',
      aircraftModel: 'Cessna 208B Grand Caravan EX',
      baggageAllowance: '20kg Hold + 1 Pet Carrier',
      hasPetAttached: b.pets.length > 0,
      petName: b.pets[0]?.name,
      checkedIn: b.status === 'CHECKED_IN',
    };
  }

  return (
    <div id="passenger-verification-portal" className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#6d3cc7] to-[#5426a5] rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <TicketIcon className="w-5 h-5 text-purple-200" />
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-purple-200">
            Passenger Self-Service Portal
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">Verify & Retrieve Flight Details</h2>
        <p className="text-sm text-purple-100 max-w-xl mt-1">
          Enter any of your official identities to view real-time flight status, aircraft assignment, seat allocation, and download certified OpenPDF boarding passes.
        </p>

        {/* Identity Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          {[
            { id: 'PNR', label: 'Booking PNR / Ref' },
            { id: 'TICKET_NUM', label: 'Ticket Number (TK-)' },
            { id: 'PHONE', label: 'Mobile Phone' },
            { id: 'PASSPORT', label: 'Passport Number' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSearchType(tab.id as any);
                setSearched(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                searchType === tab.id
                  ? 'bg-white text-[#6d3cc7] shadow'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchType === 'PNR'
                  ? 'Enter 6-char PNR (e.g. X9L4KP or FE-BK-8921)'
                  : searchType === 'TICKET_NUM'
                  ? 'Enter Ticket (e.g. TK-X9L4KP01)'
                  : searchType === 'PHONE'
                  ? 'Enter Mobile (e.g. +44 7700 900142)'
                  : 'Enter Passport Number (e.g. UK98421092)'
              }
              className="w-full h-12 pl-4 pr-10 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-300 shadow"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-12 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Search className="w-4 h-4" /> Find Booking
          </button>
        </form>
      </div>

      {/* Results Section */}
      {searched && (
        <div>
          {searchResult ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Reservation
                    </span>
                    <span className="font-mono text-xs text-slate-500 font-semibold">
                      PNR: {searchResult.booking.pnr}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    Flight {searchResult.booking.flightNumber} • {searchResult.booking.fromCode} to {searchResult.booking.toCode}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedTicketForModal(searchResult)}
                    className="px-4 py-2 rounded-xl bg-[#6d3cc7] hover:bg-[#5426a5] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-200 transition-all"
                  >
                    <TicketIcon className="w-4 h-4" /> View Pass
                  </button>
                  <button
                    onClick={() => downloadBoardingPassPDF(searchResult.ticket, searchResult.booking)}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>

              {/* Status and Route grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">DEPARTURE</span>
                  <span className="text-sm font-bold text-slate-800">{searchResult.booking.departureDate}</span>
                  <span className="text-slate-500 font-mono block">{searchResult.booking.departureTime} BST</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">AIRCRAFT</span>
                  <span className="text-sm font-bold text-slate-800">Cessna 208B Caravan</span>
                  <span className="text-amber-600 font-mono font-semibold block">{searchResult.booking.aircraftRegistration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">PAYMENT STATUS</span>
                  <span className="text-sm font-bold text-emerald-600">{searchResult.booking.paymentStatus}</span>
                  <span className="text-slate-500 block">Stripe £{searchResult.booking.totalFare}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">SEATS ASSIGNED</span>
                  <span className="text-sm font-mono font-bold text-[#6d3cc7]">
                    {searchResult.booking.seatIds.join(', ') || '1A'}
                  </span>
                  <span className="text-slate-500 block">Executive Cabin</span>
                </div>
              </div>

              {/* Passengers on this PNR */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Passengers & Pet Manifest
                </h4>
                <div className="space-y-2">
                  {searchResult.booking.passengers.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-[#6d3cc7] flex items-center justify-center font-bold">
                          {p.firstName[0]}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-sm">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="text-slate-500">
                            Passport: {p.passportNumber} • Seat {p.seatId || searchResult.booking.seatIds[idx] || '1A'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {p.type}
                      </span>
                    </div>
                  ))}

                  {/* Pets */}
                  {searchResult.booking.pets.map((pet, idx) => (
                    <div
                      key={pet.id || idx}
                      className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Dog className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-emerald-900 block text-sm">
                            {pet.name} ({pet.breed})
                          </span>
                          <span className="text-emerald-700">
                            Weight: {pet.weightKg}kg • Vet Cert: {pet.vetCertificateNumber} • Zone: {pet.assignedZone || 'AFT CLIMATE BAY 1'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                        CLIMATE CRATE BAY
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No Booking Record Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                We could not find any active booking matching "{query}" under {searchType}. Please check your flight confirmation email or test with PNR: <span className="font-mono font-bold text-[#6d3cc7]">X9L4KP</span>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal for Boarding Pass */}
      {selectedTicketForModal && (
        <BoardingPassModal
          booking={selectedTicketForModal.booking}
          ticket={selectedTicketForModal.ticket}
          allTickets={tickets.filter((t) => t.pnr === selectedTicketForModal.booking.pnr)}
          isOpen={true}
          onClose={() => setSelectedTicketForModal(null)}
        />
      )}
    </div>
  );
};
