import React, { useState, useEffect } from 'react';
import { Ticket, Booking } from '../types';
import { Plane, Calendar, Clock, MapPin, User, ShieldCheck, Download, Printer, X, Dog, CheckCircle, ArrowRight } from 'lucide-react';
import { downloadBoardingPassPDF } from '../utils/pdfGenerator';

interface BoardingPassModalProps {
  booking: Booking;
  ticket: Ticket;
  allTickets?: Ticket[];
  isOpen: boolean;
  onClose: () => void;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({
  booking,
  ticket: initialTicket,
  allTickets,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTicket, setActiveTicket] = useState<Ticket>(initialTicket);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    setActiveTicket(initialTicket);
  }, [initialTicket]);

  const ticketList = allTickets && allTickets.length > 0 ? allTickets : [initialTicket];

  const handleDownloadPDF = () => {
    downloadBoardingPassPDF(activeTicket, booking);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="bg-[#6d3cc7] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold font-mono">
              FE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">FlyEclipse E-Ticket & Official Boarding Pass</h2>
                {activeTicket.legType && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/20 font-bold">
                    {activeTicket.legType} LEG
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-200">OpenPDF Certified Document | Timezone GMT/BST</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              title="Download official PDF document directly"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition-all hidden sm:flex"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download Success Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-500 text-white text-xs py-2 px-6 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>
                Boarding Pass PDF downloaded: FlyEclipse-BoardingPass-{activeTicket.pnr}-{activeTicket.seatNumber}.pdf
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded font-bold">
              Ready to Save / Print
            </span>
          </div>
        )}

        {/* Multiple Tickets Selector (if Inbound trip or multi-passenger) */}
        {ticketList.length > 1 && (
          <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 font-bold shrink-0">Available Passes:</span>
            {ticketList.map((t, idx) => {
              const isSelected = activeTicket.ticketNumber === t.ticketNumber;
              return (
                <button
                  key={t.ticketNumber || idx}
                  onClick={() => setActiveTicket(t)}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                    isSelected
                      ? 'bg-[#6d3cc7] text-white shadow'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{t.legType ? `${t.legType}: ` : ''}{t.origin} → {t.destination}</span>
                  <span className="font-mono text-[10px] opacity-80">({t.seatNumber})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Boarding Pass Body */}
        <div className="p-6 md:p-8 bg-slate-50">
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Main Ticket Left */}
            <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-dashed border-slate-300">
              {/* Airline Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">FlyEclipse Private Aviation</span>
                    {activeTicket.legType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#6d3cc7]">
                        {activeTicket.legType} TRIP
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">CHANNEL ISLANDS COMMUTER</h3>
                  <p className="text-xs text-slate-500">Cessna 208B Grand Caravan EX • Executive Fleet</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">BOOKING REF / PNR</span>
                  <span className="text-lg font-black font-mono text-[#6d3cc7] bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                    {activeTicket.pnr}
                  </span>
                </div>
              </div>

              {/* Route */}
              <div className="grid grid-cols-3 gap-2 items-center my-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">ORIGIN</span>
                  <span className="text-2xl font-black text-slate-800 font-mono">{activeTicket.origin}</span>
                  <span className="text-xs text-slate-500 block truncate">Departure Hub</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono text-[#6d3cc7] font-bold">{activeTicket.flightNumber}</span>
                  <div className="w-full flex items-center my-1">
                    <div className="h-0.5 w-full bg-purple-200"></div>
                    <Plane className="w-5 h-5 text-[#6d3cc7] mx-1 shrink-0" />
                    <div className="h-0.5 w-full bg-purple-200"></div>
                  </div>
                  <span className="text-[10px] text-slate-400">Direct Island Hop</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 block">DESTINATION</span>
                  <span className="text-2xl font-black text-slate-800 font-mono">{activeTicket.destination}</span>
                  <span className="text-xs text-slate-500 block truncate">Arrival Terminal</span>
                </div>
              </div>

              {/* Passenger & Flight Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">PASSENGER</span>
                  <span className="font-bold text-slate-800 text-sm">{activeTicket.passengerName}</span>
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                    {activeTicket.passengerType}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">DATE</span>
                  <span className="font-bold text-slate-800">{activeTicket.departureDate}</span>
                  <span className="text-[10px] text-slate-500 block">Scheduled BST</span>
                </div>

                <div>
                  <span className="text-slate-400 block">DEPARTURE</span>
                  <span className="font-bold text-slate-800 text-sm">{activeTicket.departureTime}</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">Gate Closes -10m</span>
                </div>

                <div>
                  <span className="text-slate-400 block">GATE / SEAT</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">{activeTicket.gate}</span>
                    <span className="font-black text-white bg-[#6d3cc7] px-2 py-0.5 rounded font-mono text-xs">
                      {activeTicket.seatNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pet Indicator if attached */}
              {activeTicket.hasPetAttached && (
                <div className="mt-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <Dog className="w-4 h-4 text-emerald-600" />
                    <span>Pet Accommodated: {activeTicket.petName || 'Companion Pet'} (Cessna Aft Climate Bay)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                    VET CHECKED
                  </span>
                </div>
              )}

              {/* Code128 Barcode Simulation */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col items-center">
                <svg className="w-full max-w-sm h-12" viewBox="0 0 300 40">
                  {/* Generate aesthetic barcode bars */}
                  {[
                    2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 1, 3, 4, 1, 2, 5, 3, 2, 1, 4, 2, 3, 1, 5, 2, 4, 1, 3, 2, 4, 1, 2, 5, 3,
                    1, 2, 4, 2, 3, 1, 4, 2, 1, 3, 5, 2, 1, 4, 2, 3, 1, 2, 4, 3, 1, 2, 5, 2, 4, 1,
                  ].map((w, idx) => (
                    <rect
                      key={idx}
                      x={idx * 5}
                      y={0}
                      width={w > 3 ? 3 : w > 1 ? 2 : 1}
                      height={idx % 7 === 0 ? 38 : 32}
                      fill="#1e293b"
                    />
                  ))}
                </svg>
                <span className="text-[11px] font-mono tracking-widest text-slate-600 mt-1">
                  *{activeTicket.barcodeNumber}*
                </span>
              </div>
            </div>

            {/* Boarding Pass Stub Right with QR */}
            <div className="p-6 bg-slate-100/60 md:w-56 flex flex-col items-center justify-between text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">BOARDING PASS STUB</span>
                <p className="font-mono text-xs font-bold text-slate-800 mt-0.5">{activeTicket.ticketNumber}</p>
                <div className="my-2 p-1.5 rounded bg-purple-100 text-[#6d3cc7] font-mono text-xs font-bold">
                  SEAT {activeTicket.seatNumber}
                </div>
              </div>

              {/* SVG 2D QR Code Representation */}
              <div className="my-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm inline-block">
                <svg className="w-28 h-28" viewBox="0 0 100 100">
                  {/* Outer Frame */}
                  <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                  {/* Corner Position Boxes */}
                  <rect x="10" y="10" width="24" height="24" fill="#6d3cc7" rx="3" />
                  <rect x="14" y="14" width="16" height="16" fill="#ffffff" rx="1" />
                  <rect x="18" y="18" width="8" height="8" fill="#6d3cc7" />

                  <rect x="66" y="10" width="24" height="24" fill="#6d3cc7" rx="3" />
                  <rect x="70" y="14" width="16" height="16" fill="#ffffff" rx="1" />
                  <rect x="74" y="18" width="8" height="8" fill="#6d3cc7" />

                  <rect x="10" y="66" width="24" height="24" fill="#6d3cc7" rx="3" />
                  <rect x="14" y="70" width="16" height="16" fill="#ffffff" rx="1" />
                  <rect x="18" y="74" width="8" height="8" fill="#6d3cc7" />

                  {/* Aesthetic Data Matrix Points */}
                  {[
                    [42, 12], [48, 16], [54, 12], [42, 24], [52, 26], [40, 36], [48, 38], [56, 36],
                    [16, 44], [22, 48], [30, 44], [38, 52], [48, 48], [58, 52], [68, 46], [78, 48],
                    [84, 42], [14, 56], [26, 58], [42, 64], [50, 68], [60, 64], [72, 68], [80, 62],
                    [44, 76], [54, 78], [64, 74], [42, 84], [52, 86], [62, 82], [74, 86], [82, 78],
                  ].map(([x, y], i) => (
                    <rect key={i} x={x} y={y} width="5" height="5" fill="#1e293b" rx="1" />
                  ))}
                </svg>
              </div>

              <div className="text-[10px] text-slate-500 leading-tight">
                <span className="font-semibold text-slate-700 block">Gate Scanner Scan</span>
                Fast-Track Island Boarding
              </div>

              <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-emerald-600 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> Ready for Boarding
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note & Quick Action */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Stripe Transaction:</span>
            <span className="font-mono">{booking.stripePaymentIntentId || 'pi_test_flyeclipse8921'}</span>
            <span>•</span>
            <span>Baggage: 20kg Hold + 1 Pet Carrier</span>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-1.5 rounded-lg bg-[#6d3cc7] hover:bg-[#5426a5] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
          >
            <Download className="w-3.5 h-3.5" /> Download Boarding Pass PDF
          </button>
        </div>
      </div>
    </div>
  );
};
