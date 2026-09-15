import React, { useState, useEffect } from 'react';
import { RegularFlight, Airport, SeatInfo, PassengerInfo, PetInfo, Booking, Ticket, UserProfile } from '../types';
import { AIRPORTS, CESSNA_SEATS } from '../data/mockData';
import { calculateFare } from '../utils/pricing';
import { CessnaSeatMap } from './CessnaSeatMap';
import { BoardingPassModal } from './BoardingPassModal';
import { FlightSearchCalendar } from './FlightSearchCalendar';
import { downloadBoardingPassPDF } from '../utils/pdfGenerator';
import { calculateFlightDuration } from '../utils/scheduleCalendar';
import {
  Plane,
  Calendar,
  Clock,
  MapPin,
  Users,
  Dog,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeftRight,
  ChevronRight,
  Timer,
  Lock,
  Sparkles,
  Ticket as TicketIcon,
  Download,
  Copy,
  RotateCcw,
  Search,
} from 'lucide-react';

interface BookingEngineProps {
  schedules: RegularFlight[];
  currentUser: UserProfile;
  onBookingConfirmed: (newBooking: Booking, newTickets: Ticket | Ticket[]) => void;
  onLogEvent: (eventType: any, details: string, entityId?: string) => void;
}

export const BookingEngine: React.FC<BookingEngineProps> = ({
  schedules,
  currentUser,
  onBookingConfirmed,
  onLogEvent,
}) => {
  // Stepper state: 1: SEARCH, 2: SEAT_SELECTION, 3: PASSENGER_DETAILS, 4: PAYMENT_CONFIRMATION, 5: SUCCESS_TICKET
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Search parameters
  const [origin, setOrigin] = useState<string>('JER');
  const [destination, setDestination] = useState<string>('ACI');
  const [flightDate, setFlightDate] = useState<string>('2026-09-14');
  const [returnDate, setReturnDate] = useState<string>('2026-09-16');
  const [tripType, setTripType] = useState<'ONE_WAY' | 'RETURN'>('ONE_WAY');
  const [isCharter, setIsCharter] = useState<boolean>(false);

  // Selected Flights
  const [selectedFlight, setSelectedFlight] = useState<RegularFlight | null>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<RegularFlight | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const handleExecuteSearch = () => {
    setSearchFeedback(`Displaying 5-day schedule for ${origin} → ${destination} around departure date ${flightDate}`);
    setTimeout(() => setSearchFeedback(null), 4000);
    onLogEvent(
      'FLIGHT_SEARCH',
      `Searched 5-day flight schedule for route ${origin} to ${destination} around departure date ${flightDate}`
    );
  };

  // Selected Seats & Active Cabin Leg
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>(['1A']);
  const [selectedReturnSeatIds, setSelectedReturnSeatIds] = useState<string[]>(['1A']);
  const [activeCabinLeg, setActiveCabinLeg] = useState<'OUTBOUND' | 'RETURN'>('OUTBOUND');

  // Pets
  const [pets, setPets] = useState<PetInfo[]>([
    {
      id: 'PET-1',
      name: 'Barnaby',
      type: 'DOG',
      breed: 'Cocker Spaniel',
      weightKg: 14.5,
      vetCertificateNumber: 'UK-VET-2026-8819',
      crateRequired: true,
      assignedZone: 'CRATE_BAY_1',
    },
  ]);
  const [hasPetsTravelling, setHasPetsTravelling] = useState<boolean>(true);

  // Passenger form records (one per selected seat)
  const [passengers, setPassengers] = useState<PassengerInfo[]>([
    {
      id: 'PAX-1',
      title: 'Mr',
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      type: 'ADULT',
      dob: currentUser.dob || '1992-06-14',
      passportNumber: currentUser.passportNumber || 'UK98421092',
      passportCountry: 'GBR',
      phone: currentUser.mobile,
      email: currentUser.email,
      seatId: '1A',
    },
  ]);

  // Pricing breakdown: outbound + optional return + pet supplements
  const outboundFare = calculateFare(selectedSeatIds.length, 0);
  const returnFare = tripType === 'RETURN' ? calculateFare(selectedReturnSeatIds.length, 0) : null;
  const petFeePerLeg = 75;
  const petTotal = hasPetsTravelling ? pets.length * petFeePerLeg * (tripType === 'RETURN' ? 2 : 1) : 0;
  const baseTotal = outboundFare.baseTotal + (returnFare ? returnFare.baseTotal : 0);
  const grandTotal = baseTotal + petTotal;

  // Stripe & Hold State
  const [holdTimerSeconds, setHoldTimerSeconds] = useState<number>(7200); // 2 hours
  const [isProcessingStripe, setIsProcessingStripe] = useState<boolean>(false);
  const [saveCardForFuture, setSaveCardForFuture] = useState<boolean>(true);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [issuedTickets, setIssuedTickets] = useState<Ticket[]>([]);
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<Ticket | null>(null);
  const [showBoardingPassModal, setShowBoardingPassModal] = useState<boolean>(false);

  // Filter available flights
  const availableOutboundFlights = schedules.filter((f) => {
    return f.fromCode === origin && f.toCode === destination;
  });

  const availableReturnFlights = schedules.filter((f) => {
    return f.fromCode === destination && f.toCode === origin;
  });

  // Handle airport swapping
  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setSelectedFlight(null);
    setSelectedReturnFlight(null);
  };

  // Toggle seat on current active cabin leg
  const handleToggleSeat = (seatId: string) => {
    if (activeCabinLeg === 'OUTBOUND') {
      let updated: string[];
      if (selectedSeatIds.includes(seatId)) {
        if (selectedSeatIds.length === 1) return; // Keep at least one
        updated = selectedSeatIds.filter((id) => id !== seatId);
      } else {
        if (selectedSeatIds.length >= 6) {
          alert('Cessna 208B executive group booking is capped at 6 seats per transaction.');
          return;
        }
        updated = [...selectedSeatIds, seatId];
      }
      setSelectedSeatIds(updated);

      // Adjust passengers list size
      setPassengers((prev) => {
        const newPax = [...prev];
        while (newPax.length < updated.length) {
          const nextSeatId = updated[newPax.length];
          const relative = currentUser.savedRelatives[newPax.length - 1];
          if (relative) {
            newPax.push({
              id: 'PAX-' + (newPax.length + 1),
              title: 'Mrs',
              firstName: relative.firstName,
              lastName: relative.lastName,
              type: 'ADULT',
              dob: relative.dob,
              passportNumber: relative.passportNumber,
              passportCountry: 'GBR',
              phone: relative.phone || currentUser.mobile,
              email: relative.email || currentUser.email,
              seatId: nextSeatId,
            });
          } else {
            newPax.push({
              id: 'PAX-' + (newPax.length + 1),
              title: 'Mr',
              firstName: '',
              lastName: '',
              type: 'ADULT',
              dob: '1995-01-01',
              passportNumber: '',
              passportCountry: 'GBR',
              phone: '',
              email: '',
              seatId: nextSeatId,
            });
          }
        }
        return newPax.slice(0, updated.length).map((p, idx) => ({ ...p, seatId: updated[idx] }));
      });
    } else {
      // Return Leg
      let updated: string[];
      if (selectedReturnSeatIds.includes(seatId)) {
        if (selectedReturnSeatIds.length === 1) return;
        updated = selectedReturnSeatIds.filter((id) => id !== seatId);
      } else {
        if (selectedReturnSeatIds.length >= 6) {
          alert('Cessna 208B executive group booking is capped at 6 seats per transaction.');
          return;
        }
        updated = [...selectedReturnSeatIds, seatId];
      }
      setSelectedReturnSeatIds(updated);
    }
  };

  // Copy outbound seats to return leg
  const handleCopyOutboundSeatsToReturn = () => {
    if (!selectedReturnFlight) return;
    const available = selectedSeatIds.filter(
      (s) => !selectedReturnFlight.bookedSeats.includes(s) && !selectedReturnFlight.reservedSeats.includes(s)
    );
    if (available.length > 0) {
      setSelectedReturnSeatIds(available);
    }
  };

  // Hold Countdown effect
  useEffect(() => {
    if (step >= 4 && holdTimerSeconds > 0) {
      const timer = setInterval(() => {
        setHoldTimerSeconds((s) => s - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, holdTimerSeconds]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Step 3 -> 4: Hold Seats for 2 Hours
  const handleConfirm2HourHold = () => {
    if (!selectedFlight) return;
    const refNum = 'FE-BK-' + Math.floor(1000 + Math.random() * 9000);
    const pnrCode = 'ECL' + Math.floor(100 + Math.random() * 900);

    const booking: Booking = {
      id: 'BK-' + Date.now(),
      referenceNumber: refNum,
      pnr: pnrCode,
      flightId: selectedFlight.id,
      flightNumber: selectedFlight.flightNumber,
      fromCode: selectedFlight.fromCode,
      toCode: selectedFlight.toCode,
      departureDate: flightDate,
      departureTime: selectedFlight.departureTime,
      aircraftRegistration: selectedFlight.aircraftRegistration,
      isReturnTrip: tripType === 'RETURN',
      returnFlightId: selectedReturnFlight ? selectedReturnFlight.id : undefined,
      returnFlightNumber: selectedReturnFlight ? selectedReturnFlight.flightNumber : undefined,
      returnDepartureDate: selectedReturnFlight ? returnDate : undefined,
      returnDepartureTime: selectedReturnFlight ? selectedReturnFlight.departureTime : undefined,
      returnAircraftRegistration: selectedReturnFlight ? selectedReturnFlight.aircraftRegistration : undefined,
      returnSeatIds: tripType === 'RETURN' ? selectedReturnSeatIds : undefined,
      userId: currentUser.id,
      userEmail: currentUser.email,
      passengers,
      pets: hasPetsTravelling ? pets : [],
      seatIds: selectedSeatIds,
      totalFare: grandTotal,
      currency: 'GBP',
      status: 'HELD',
      paymentStatus: 'PENDING',
      bookingCreatedAt: new Date().toISOString(),
      holdExpiresAt: Date.now() + 7200000, // 2 hours
      leadPassengerName: `${passengers[0].firstName} ${passengers[0].lastName}`,
      isCharter,
    };

    setActiveBooking(booking);
    setStep(4);
    onLogEvent(
      'SEAT_HELD_2H',
      `Seats [${selectedSeatIds.join(', ')}] held for 2 hours on flight ${selectedFlight.flightNumber}${
        selectedReturnFlight ? ` and inbound flight ${selectedReturnFlight.flightNumber}` : ''
      } under PNR ${pnrCode}`,
      booking.id
    );
  };

  // Step 4 -> 5: Process Stripe Payment & Issue Tickets
  const handleProcessStripePayment = () => {
    if (!activeBooking || !selectedFlight) return;
    setIsProcessingStripe(true);

    setTimeout(() => {
      setIsProcessingStripe(false);

      const confirmedBooking: Booking = {
        ...activeBooking,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        stripePaymentIntentId: 'pi_3M' + Math.random().toString(36).substring(2, 12),
      };

      // Outbound ticket
      const outboundTicket: Ticket = {
        ticketNumber: 'TK-' + Math.floor(10000000 + Math.random() * 90000000),
        bookingReference: confirmedBooking.referenceNumber,
        pnr: confirmedBooking.pnr,
        passengerId: confirmedBooking.passengers[0].id,
        passengerName: confirmedBooking.leadPassengerName,
        passengerType: confirmedBooking.passengers[0].type,
        flightNumber: confirmedBooking.flightNumber,
        origin: confirmedBooking.fromCode,
        destination: confirmedBooking.toCode,
        departureDate: confirmedBooking.departureDate,
        departureTime: confirmedBooking.departureTime,
        gate: 'GATE 1',
        seatNumber: confirmedBooking.seatIds[0] || '1A',
        qrPayload: `FLYECLIPSE:${confirmedBooking.pnr}:${confirmedBooking.passengers[0].passportNumber}:${confirmedBooking.seatIds[0]}`,
        barcodeNumber: '298104829104',
        aircraftModel: 'Cessna 208B Grand Caravan EX',
        baggageAllowance: '20kg Hold + 1 Pet Carrier Allowed',
        hasPetAttached: hasPetsTravelling && pets.length > 0,
        petName: pets[0]?.name,
        checkedIn: false,
        legType: 'OUTBOUND',
      };

      const generatedTickets: Ticket[] = [outboundTicket];

      // Return ticket if round trip
      if (confirmedBooking.isReturnTrip && confirmedBooking.returnFlightNumber) {
        const returnTicket: Ticket = {
          ticketNumber: 'TK-' + Math.floor(10000000 + Math.random() * 90000000),
          bookingReference: confirmedBooking.referenceNumber,
          pnr: confirmedBooking.pnr,
          passengerId: confirmedBooking.passengers[0].id,
          passengerName: confirmedBooking.leadPassengerName,
          passengerType: confirmedBooking.passengers[0].type,
          flightNumber: confirmedBooking.returnFlightNumber,
          origin: confirmedBooking.toCode, // Origin is return origin
          destination: confirmedBooking.fromCode,
          departureDate: confirmedBooking.returnDepartureDate || returnDate,
          departureTime: confirmedBooking.returnDepartureTime || '14:30',
          gate: 'GATE 2',
          seatNumber: (confirmedBooking.returnSeatIds && confirmedBooking.returnSeatIds[0]) || confirmedBooking.seatIds[0] || '1A',
          qrPayload: `FLYECLIPSE:${confirmedBooking.pnr}:${confirmedBooking.passengers[0].passportNumber}:${(confirmedBooking.returnSeatIds && confirmedBooking.returnSeatIds[0]) || '1A'}`,
          barcodeNumber: '381904829105',
          aircraftModel: 'Cessna 208B Grand Caravan EX',
          baggageAllowance: '20kg Hold + 1 Pet Carrier Allowed',
          hasPetAttached: hasPetsTravelling && pets.length > 0,
          petName: pets[0]?.name,
          checkedIn: false,
          legType: 'INBOUND',
        };
        generatedTickets.push(returnTicket);
      }

      setActiveBooking(confirmedBooking);
      setIssuedTickets(generatedTickets);
      setSelectedTicketForModal(outboundTicket);
      onBookingConfirmed(confirmedBooking, generatedTickets);
      setStep(5);

      onLogEvent(
        'PAYMENT_COMPLETED',
        `Stripe verified £${grandTotal} for PNR ${confirmedBooking.pnr}. ${generatedTickets.length} OpenPDF Boarding Passes issued.`,
        confirmedBooking.id
      );
    }, 1500);
  };

  return (
    <div id="booking-engine-wrapper" className="max-w-6xl mx-auto space-y-6">
      {/* Modern Floating Stepper */}
      <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-slate-200 shadow-md flex items-center justify-between">
        {[
          { num: 1, label: 'Search & Route' },
          { num: 2, label: 'Cessna Cabin & Pets' },
          { num: 3, label: 'Passenger Manifest' },
          { num: 4, label: 'Hold & Stripe Pay' },
          { num: 5, label: 'Issued Ticket' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                step === s.num
                  ? 'bg-[#6d3cc7] text-white ring-4 ring-[#6d3cc7]/20 shadow'
                  : step > s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`hidden md:inline text-xs font-bold ${
                step === s.num ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {s.label}
            </span>
            {s.num < 5 && <ChevronRight className="hidden md:inline w-4 h-4 text-slate-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* STEP 1: Search & Schedules */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Card-based Search Widget */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
                  Channel Islands Regional Airway
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Book Cessna Caravan Flight
                </h2>
                <p className="text-xs text-slate-500">
                  Direct scheduled hops between Jersey, Alderney, Guernsey, and Bournemouth. Pet friendly.
                </p>
              </div>

              {/* Trip Segmented Control */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setTripType('ONE_WAY');
                    setSelectedReturnFlight(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    tripType === 'ONE_WAY' ? 'bg-white text-[#6d3cc7] shadow' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('RETURN')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    tripType === 'RETURN' ? 'bg-white text-[#6d3cc7] shadow' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Return
                </button>
              </div>
            </div>

            {/* Airport Dropdowns & Date Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Outbound Origin */}
              <div className={tripType === 'RETURN' ? 'md:col-span-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200' : 'md:col-span-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200'}>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Departing From (Outbound)
                </label>
                <select
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value);
                    setSelectedFlight(null);
                    setSelectedReturnFlight(null);
                  }}
                  className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code} disabled={a.code === destination}>
                      {a.code} - {a.name} ({a.islandOrCity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className="w-10 h-10 rounded-full bg-purple-50 hover:bg-purple-100 text-[#6d3cc7] border border-purple-200 flex items-center justify-center transition-all shadow-sm"
                  title="Swap Origin & Destination"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* Destination */}
              <div className={tripType === 'RETURN' ? 'md:col-span-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200' : 'md:col-span-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200'}>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Arriving At (Destination)
                </label>
                <select
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setSelectedFlight(null);
                    setSelectedReturnFlight(null);
                  }}
                  className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code} disabled={a.code === origin}>
                      {a.code} - {a.name} ({a.islandOrCity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Departure Date */}
              <div className={tripType === 'RETURN' ? 'md:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200' : 'md:col-span-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200'}>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={flightDate}
                  onChange={(e) => {
                    setFlightDate(e.target.value);
                    if (e.target.value > returnDate) {
                      setReturnDate(e.target.value);
                    }
                  }}
                  className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none"
                />
              </div>

              {/* Return Date (Visible when tripType === 'RETURN') */}
              {tripType === 'RETURN' && (
                <div className="md:col-span-3 bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 animate-in fade-in">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase text-[#6d3cc7] block">
                      Return Date
                    </label>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#6d3cc7] text-white">
                      Return
                    </span>
                  </div>
                  <input
                    type="date"
                    min={flightDate}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-transparent font-bold text-[#6d3cc7] text-sm focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Pet Travelling Toggle Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Dog className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">Travelling with Pets?</h4>
                  <p className="text-xs text-emerald-800">
                    FlyEclipse Cessna Caravans feature 2 dedicated Aft Climate-Controlled Crate Bays & under-seat tethers.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPetsTravelling}
                  onChange={(e) => setHasPetsTravelling(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6d3cc7] focus:ring-[#6d3cc7]"
                />
                <span className="text-xs font-bold text-emerald-900">
                  Include Pet Booking (+£{petFeePerLeg * (tripType === 'RETURN' ? 2 : 1)} {tripType === 'RETURN' ? 'Round-trip' : 'One-way'})
                </span>
              </label>
            </div>

            {/* Flight Search Button Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-4 h-4 text-[#6d3cc7]" />
                <span>
                  Searching <strong>{origin} → {destination}</strong> • 5-day schedule window (1 day back & 4 days forward)
                </span>
              </div>
              <button
                type="button"
                onClick={handleExecuteSearch}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#6d3cc7] hover:bg-[#5b32a8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Search 5-Day Schedules</span>
              </button>
            </div>

            {searchFeedback && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-[#6d3cc7] flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4" />
                <span>{searchFeedback}</span>
              </div>
            )}
          </div>

          {/* 5-Day Outbound Flight Schedule Calendar */}
          <FlightSearchCalendar
            origin={origin}
            destination={destination}
            departureDate={flightDate}
            selectedFlight={selectedFlight}
            onSelectFlight={(flight) => {
              setSelectedFlight(flight);
              setFlightDate(flight.date);
              onLogEvent('ENTITY_CRUD', `Selected outbound flight ${flight.flightNumber} on ${flight.date}`);
            }}
            allSchedules={schedules}
            legLabel="Outbound"
            stepNumber={1}
            onDateChange={(newDate) => {
              setFlightDate(newDate);
            }}
          />

          {/* 5-Day Return Flight Schedule Calendar (when tripType === 'RETURN') */}
          {tripType === 'RETURN' && (
            <div className="pt-4 border-t border-slate-200">
              <FlightSearchCalendar
                origin={destination}
                destination={origin}
                departureDate={returnDate}
                selectedFlight={selectedReturnFlight}
                onSelectFlight={(flight) => {
                  setSelectedReturnFlight(flight);
                  setReturnDate(flight.date);
                  onLogEvent('ENTITY_CRUD', `Selected inbound flight ${flight.flightNumber} on ${flight.date}`);
                }}
                allSchedules={schedules}
                legLabel="Inbound"
                stepNumber={2}
                onDateChange={(newDate) => {
                  setReturnDate(newDate);
                }}
              />
            </div>
          )}

          {/* Bottom Bar: Selections Summary & Continue Button */}
          <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-800">Outbound Flight:</span>
                {selectedFlight ? (
                  <span className="font-mono bg-purple-50 text-[#6d3cc7] px-2.5 py-1 rounded-lg font-bold flex items-center gap-2 border border-purple-200">
                    <span>{selectedFlight.flightNumber}</span>
                    <span>•</span>
                    <span>Departs {selectedFlight.departureTime} BST → Arrives {selectedFlight.arrivalTime} BST</span>
                    <span className="bg-purple-200/60 text-purple-900 px-1.5 py-0.2 rounded text-[11px]">
                      Flight Time: {calculateFlightDuration(selectedFlight.departureTime, selectedFlight.arrivalTime)}
                    </span>
                    <span>•</span>
                    <span>{flightDate}</span>
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium italic">Please select an outbound flight above</span>
                )}
              </div>

              {tripType === 'RETURN' && (
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <span className="font-bold text-slate-800">Inbound Flight:</span>
                  {selectedReturnFlight ? (
                    <span className="font-mono bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-2 border border-amber-200">
                      <span>{selectedReturnFlight.flightNumber}</span>
                      <span>•</span>
                      <span>Departs {selectedReturnFlight.departureTime} BST → Arrives {selectedReturnFlight.arrivalTime} BST</span>
                      <span className="bg-amber-200/60 text-amber-950 px-1.5 py-0.2 rounded text-[11px]">
                        Flight Time: {calculateFlightDuration(selectedReturnFlight.departureTime, selectedReturnFlight.arrivalTime)}
                      </span>
                      <span>•</span>
                      <span>{returnDate}</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium italic">Please select an inbound flight above</span>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              id="btn-proceed-to-seats"
              disabled={tripType === 'RETURN' ? !selectedFlight || !selectedReturnFlight : !selectedFlight}
              onClick={() => setStep(2)}
              className="px-8 py-3 rounded-2xl bg-[#6d3cc7] hover:bg-[#5426a5] disabled:opacity-40 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
            >
              Continue to Seat Selection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Interactive Cessna Caravan Seat Map & Pet Allocation */}
      {step === 2 && selectedFlight && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
                {tripType === 'RETURN' ? 'Round-Trip Cabin Allocation' : 'One-Way Cabin Allocation'}
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Select Your Cessna Caravan Executive Seats
              </h2>
              <p className="text-xs text-slate-500">
                Choose up to 6 seats. Pricing matrix dynamically adjusts per passenger count.
              </p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              ← Back to Flight Search
            </button>
          </div>

          {/* Leg Tabs for Return Trip */}
          {tripType === 'RETURN' && selectedReturnFlight && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCabinLeg('OUTBOUND')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeCabinLeg === 'OUTBOUND'
                      ? 'bg-[#6d3cc7] text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Outbound Leg ({origin} → {destination})</span>
                  <span className="font-mono text-[10px] bg-black/20 px-1.5 py-0.5 rounded">
                    Seats: {selectedSeatIds.join(', ')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCabinLeg('RETURN')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeCabinLeg === 'RETURN'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Inbound Leg ({destination} → {origin})</span>
                  <span className="font-mono text-[10px] bg-black/20 px-1.5 py-0.5 rounded">
                    Seats: {selectedReturnSeatIds.join(', ')}
                  </span>
                </button>
              </div>

              {activeCabinLeg === 'RETURN' && (
                <button
                  type="button"
                  onClick={handleCopyOutboundSeatsToReturn}
                  className="text-xs text-[#6d3cc7] hover:underline font-bold flex items-center gap-1"
                  title="Match same seats as outbound"
                >
                  <Copy className="w-3.5 h-3.5" /> Same seats as outbound
                </button>
              )}
            </div>
          )}

          {/* Active Cabin Map Header */}
          <div className="p-3.5 bg-[#6d3cc7]/[0.05] rounded-2xl border border-[#6d3cc7]/15 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Configuring Cabin for:{' '}
              {activeCabinLeg === 'OUTBOUND'
                ? `Outbound Flight ${selectedFlight.flightNumber} (${selectedFlight.fromCode} → ${selectedFlight.toCode}) • ${flightDate}`
                : `Inbound Flight ${selectedReturnFlight?.flightNumber} (${selectedReturnFlight?.fromCode} → ${selectedReturnFlight?.toCode}) • ${returnDate}`}
            </span>
            <span className="font-mono text-[#6d3cc7] font-bold">
              {activeCabinLeg === 'OUTBOUND' ? selectedFlight.aircraftRegistration : selectedReturnFlight?.aircraftRegistration}
            </span>
          </div>

          {/* The interactive SVG Cabin Map */}
          <CessnaSeatMap
            selectedSeatIds={activeCabinLeg === 'OUTBOUND' ? selectedSeatIds : selectedReturnSeatIds}
            bookedSeatIds={activeCabinLeg === 'OUTBOUND' ? selectedFlight.bookedSeats : (selectedReturnFlight?.bookedSeats || [])}
            reservedSeatIds={activeCabinLeg === 'OUTBOUND' ? selectedFlight.reservedSeats : (selectedReturnFlight?.reservedSeats || [])}
            pets={hasPetsTravelling ? pets : []}
            onToggleSeat={handleToggleSeat}
            aircraftRegistration={activeCabinLeg === 'OUTBOUND' ? selectedFlight.aircraftRegistration : (selectedReturnFlight?.aircraftRegistration || 'G-ECLS')}
          />

          {/* Pricing Matrix Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d3cc7] block">
                Dynamic Tiered Matrix Applied
              </span>
              <h4 className="text-base font-bold text-slate-900">
                {tripType === 'RETURN' ? 'Round-Trip Total' : 'One-Way Total'}: £{grandTotal}
              </h4>
              <div className="flex flex-wrap items-center gap-3 text-slate-600">
                <span>
                  Outbound ({selectedSeatIds.length} pax): <strong className="font-mono text-[#6d3cc7]">£{outboundFare.baseTotal}</strong>
                </span>
                {returnFare && (
                  <span>
                    • Inbound ({selectedReturnSeatIds.length} pax): <strong className="font-mono text-amber-700">£{returnFare.baseTotal}</strong>
                  </span>
                )}
                {hasPetsTravelling && pets.length > 0 && (
                  <span>
                    • Pet Climate Bays: <strong className="font-mono text-emerald-700">£{petTotal}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold">Total Payable</span>
                <span className="text-2xl font-black font-mono text-[#6d3cc7]">
                  £{grandTotal}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={selectedSeatIds.length === 0 || (tripType === 'RETURN' && selectedReturnSeatIds.length === 0)}
                className="px-6 py-3 rounded-2xl bg-[#6d3cc7] hover:bg-[#5426a5] disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
              >
                Continue to Manifest <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Passenger & Pet Details */}
      {step === 3 && selectedFlight && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
                Official Travel Manifest
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Passenger & Pet Information
              </h2>
              <p className="text-xs text-slate-500">
                Required for Channel Islands CTA immigration, customs, and pet passport compliance
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Back to Seat Selection
            </button>
          </div>

          {/* Passenger Input Forms */}
          <div className="space-y-6">
            {passengers.map((pax, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#6d3cc7] text-white flex items-center justify-center font-bold font-mono">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      Passenger {idx + 1}
                    </span>
                    <span className="font-mono text-xs bg-purple-100 text-[#6d3cc7] px-2 py-0.5 rounded font-bold">
                      Outbound Seat: {selectedSeatIds[idx] || '1A'}
                      {tripType === 'RETURN' && ` • Inbound Seat: ${selectedReturnSeatIds[idx] || selectedSeatIds[idx] || '1A'}`}
                    </span>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#6d3cc7] font-bold text-[10px]">
                        Lead Passenger
                      </span>
                    )}
                  </div>

                  {/* Relative Auto-fill button */}
                  {currentUser.savedRelatives.length > 0 && idx > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Select Relative:</span>
                      <select
                        onChange={(e) => {
                          const rel = currentUser.savedRelatives.find((r) => r.id === e.target.value);
                          if (rel) {
                            const updated = [...passengers];
                            updated[idx] = {
                              ...updated[idx],
                              firstName: rel.firstName,
                              lastName: rel.lastName,
                              dob: rel.dob,
                              passportNumber: rel.passportNumber,
                              phone: rel.phone,
                              email: rel.email,
                            };
                            setPassengers(updated);
                          }
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700"
                      >
                        <option value="">-- Choose saved relative --</option>
                        {currentUser.savedRelatives.map((rel) => (
                          <option key={rel.id} value={rel.id}>
                            {rel.firstName} {rel.lastName} ({rel.relationship})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Title</label>
                    <select
                      value={pax.title}
                      onChange={(e) => {
                        const u = [...passengers];
                        u[idx].title = e.target.value;
                        setPassengers(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                    >
                      <option>Mr</option>
                      <option>Mrs</option>
                      <option>Ms</option>
                      <option>Dr</option>
                      <option>Capt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={pax.firstName}
                      onChange={(e) => {
                        const u = [...passengers];
                        u[idx].firstName = e.target.value;
                        setPassengers(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={pax.lastName}
                      onChange={(e) => {
                        const u = [...passengers];
                        u[idx].lastName = e.target.value;
                        setPassengers(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Type</label>
                    <select
                      value={pax.type}
                      onChange={(e) => {
                        const u = [...passengers];
                        u[idx].type = e.target.value as any;
                        setPassengers(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                    >
                      <option value="ADULT">Adult (12+)</option>
                      <option value="CHILD">Child (2-11)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Passport / Travel ID Number</label>
                    <input
                      type="text"
                      required
                      value={pax.passportNumber}
                      onChange={(e) => {
                        const u = [...passengers];
                        u[idx].passportNumber = e.target.value;
                        setPassengers(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Contact Mobile</label>
                    <input
                      type="tel"
                      value={pax.phone}
                      onChange={(e) => {
                        const u = [...passengers];
                        u[idx].phone = e.target.value;
                        setPassengers(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Email for Tickets</label>
                    <input
                      type="email"
                      value={pax.email}
                      onChange={(e) => {
                        const u = [...passengers];
                        u[idx].email = e.target.value;
                        setPassengers(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Pet Form if Travelling */}
            {hasPetsTravelling && (
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dog className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-emerald-950 text-sm">Pet Passenger Information</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                    Cessna Aft Climate Bay
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">Pet Name</label>
                    <input
                      type="text"
                      value={pets[0]?.name || ''}
                      onChange={(e) => {
                        const u = [...pets];
                        u[0] = { ...u[0], name: e.target.value };
                        setPets(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-emerald-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">Pet Type</label>
                    <select
                      value={pets[0]?.type || 'DOG'}
                      onChange={(e) => {
                        const u = [...pets];
                        u[0] = { ...u[0], type: e.target.value as any };
                        setPets(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-emerald-300 bg-white font-medium"
                    >
                      <option value="DOG">Dog</option>
                      <option value="CAT">Cat</option>
                      <option value="OTHER">Other Small Pet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">Breed & Weight (kg)</label>
                    <input
                      type="text"
                      placeholder="e.g. Cocker Spaniel (14kg)"
                      value={pets[0]?.breed || ''}
                      onChange={(e) => {
                        const u = [...pets];
                        u[0] = { ...u[0], breed: e.target.value };
                        setPets(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-emerald-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">Veterinary Cert / Passport</label>
                    <input
                      type="text"
                      value={pets[0]?.vetCertificateNumber || ''}
                      onChange={(e) => {
                        const u = [...pets];
                        u[0] = { ...u[0], vetCertificateNumber: e.target.value };
                        setPets(u);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-emerald-300 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Passes will be automatically held for 2 hours once confirmed.
            </div>

            <button
              type="button"
              onClick={handleConfirm2HourHold}
              className="px-8 py-3 rounded-2xl bg-[#6d3cc7] hover:bg-[#5426a5] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
            >
              Confirm 2-Hour Seat Hold & Review <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: 2-Hour Hold Active & Stripe Payment */}
      {step === 4 && activeBooking && selectedFlight && (
        <div className="space-y-6">
          {/* 2-Hour Hold Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center">
                <Timer className="w-6 h-6 text-slate-950 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                  2-Hour Reservation Hold Active
                </span>
                <h3 className="text-xl font-black">
                  Seats {activeBooking.seatIds.join(', ')} Held for PNR: {activeBooking.pnr}
                </h3>
                <p className="text-xs text-amber-950 font-medium">
                  Your seats are temporarily locked. If unpaid within 2 hours, they are automatically returned to open inventory.
                </p>
              </div>
            </div>

            <div className="bg-black/20 px-5 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-amber-950 block">Time Remaining</span>
              <span className="text-2xl font-black font-mono tracking-wider">{formatTimer(holdTimerSeconds)}</span>
            </div>
          </div>

          {/* Stripe Payment Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Summary */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Trip Breakdown</h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                {/* Outbound leg details */}
                <div className="border-b border-slate-200 pb-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="text-[#6d3cc7]">OUTBOUND LEG</span>
                    <span className="font-mono">{selectedFlight.flightNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>Route:</span>
                    <span className="font-medium">{selectedFlight.fromCode} → {selectedFlight.toCode}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Departure & Arrival:</span>
                    <span className="font-medium">
                      {flightDate} • {selectedFlight.departureTime} BST → {selectedFlight.arrivalTime} BST
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Flight Time:</span>
                    <span className="font-bold text-[#6d3cc7] font-mono">
                      {calculateFlightDuration(selectedFlight.departureTime, selectedFlight.arrivalTime)} (Non-stop)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Aircraft & Seats:</span>
                    <span className="font-medium font-mono">{selectedFlight.aircraftRegistration} • Seats {selectedSeatIds.join(', ')}</span>
                  </div>
                </div>

                {/* Return leg details if applicable */}
                {tripType === 'RETURN' && selectedReturnFlight && (
                  <div className="border-b border-slate-200 pb-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="text-amber-700">INBOUND LEG</span>
                      <span className="font-mono">{selectedReturnFlight.flightNumber}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 mt-1">
                      <span>Route:</span>
                      <span className="font-medium">{selectedReturnFlight.fromCode} → {selectedReturnFlight.toCode}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Departure & Arrival:</span>
                      <span className="font-medium">
                        {returnDate} • {selectedReturnFlight.departureTime} BST → {selectedReturnFlight.arrivalTime} BST
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Flight Time:</span>
                      <span className="font-bold text-amber-800 font-mono">
                        {calculateFlightDuration(selectedReturnFlight.departureTime, selectedReturnFlight.arrivalTime)} (Non-stop)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Aircraft & Seats:</span>
                      <span className="font-medium font-mono">{selectedReturnFlight.aircraftRegistration} • Seats {selectedReturnSeatIds.join(', ')}</span>
                    </div>
                  </div>
                )}

                {hasPetsTravelling && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Pet Accommodated:</span>
                    <span className="font-bold">{pets[0]?.name || 'Dog'} (Aft Bay)</span>
                  </div>
                )}

                <div className="pt-2 flex justify-between text-sm">
                  <span className="font-bold text-slate-800">Total Charged to Card:</span>
                  <span className="font-black text-[#6d3cc7] font-mono text-base">£{grandTotal}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-100 text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6d3cc7] shrink-0" />
                <span>
                  Refund Policy: Full refund if cancelled 24h prior to flight; 50% refund within 12h; OpenPDF tickets generated on checkout.
                </span>
              </div>
            </div>

            {/* Right: Stripe Payment Form */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#6d3cc7]" /> Stripe Payment Gateway
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 256-Bit Encrypted
                </span>
              </div>

              <div className="p-5 rounded-2xl border-2 border-slate-200 space-y-3 text-xs bg-slate-50/50">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.firstName + ' ' + currentUser.lastName}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="•••• •••• •••• 4242"
                      className="w-full h-10 pl-3 pr-10 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                      VISA
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Expiry</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      defaultValue="888"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveCardForFuture}
                    onChange={(e) => setSaveCardForFuture(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6d3cc7] focus:ring-[#6d3cc7]"
                  />
                  <span className="text-[11px] text-slate-600 font-medium">
                    Save card info securely for future Channel Islands bookings
                  </span>
                </label>
              </div>

              <button
                type="button"
                id="btn-process-stripe-pay"
                disabled={isProcessingStripe}
                onClick={handleProcessStripePayment}
                className="w-full py-3.5 rounded-2xl bg-[#6d3cc7] hover:bg-[#5426a5] disabled:opacity-75 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-200 transition-all"
              >
                {isProcessingStripe ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Stripe Charge...</span>
                  </>
                ) : (
                  <>
                    <span>Pay £{grandTotal} via Stripe & Issue Tickets</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Success Confirmation & OpenPDF Boarding Pass View */}
      {step === 5 && activeBooking && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
              Reservation Confirmed & Paid
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Booking Complete! PNR: {activeBooking.pnr}
            </h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Your flight on the Cessna 208B Grand Caravan EX is locked in. We have generated your official OpenPDF boarding passes with gate QR codes and Code128 barcodes.
            </p>
          </div>

          {/* List of Issued Tickets for this Journey */}
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
              Issued E-Tickets & Boarding Passes ({issuedTickets.length})
            </h3>

            {issuedTickets.map((t, idx) => (
              <div
                key={t.ticketNumber || idx}
                className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-left"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#6d3cc7] font-mono text-sm">{t.flightNumber}</span>
                    {t.legType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200/80 text-[#6d3cc7] uppercase">
                        {t.legType} LEG
                      </span>
                    )}
                    <span className="text-slate-400 font-mono">PNR: {t.pnr}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {t.origin} → {t.destination}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Date: {t.departureDate} at {t.departureTime} BST • Seat: <strong className="text-[#6d3cc7]">{t.seatNumber}</strong> • {t.passengerName}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedTicketForModal(t);
                      setShowBoardingPassModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <TicketIcon className="w-4 h-4 text-[#6d3cc7]" /> View Pass
                  </button>

                  <button
                    onClick={() => downloadBoardingPassPDF(t, activeBooking)}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                issuedTickets.forEach((t) => downloadBoardingPassPDF(t, activeBooking));
              }}
              className="px-6 py-3 rounded-2xl bg-[#6d3cc7] hover:bg-[#5426a5] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
            >
              <Download className="w-4 h-4" /> Download All Boarding Passes (PDF)
            </button>

            <button
              onClick={() => {
                setStep(1);
                setSelectedFlight(null);
                setSelectedReturnFlight(null);
                setSelectedSeatIds(['1A']);
                setSelectedReturnSeatIds(['1A']);
              }}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              Book Another Flight
            </button>
          </div>

          {/* Modal for Boarding Pass */}
          {showBoardingPassModal && selectedTicketForModal && (
            <BoardingPassModal
              booking={activeBooking}
              ticket={selectedTicketForModal}
              allTickets={issuedTickets}
              isOpen={showBoardingPassModal}
              onClose={() => setShowBoardingPassModal(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};
