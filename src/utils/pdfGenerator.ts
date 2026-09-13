import { jsPDF } from 'jspdf';
import { Ticket, Booking } from '../types';

/**
 * Generates and downloads an official FlyEclipse E-Ticket & Boarding Pass PDF
 * using jsPDF client-side generation.
 */
export function downloadBoardingPassPDF(ticket: Ticket, booking?: Booking | null): void {
  // Create landscape A5 / letter size boarding pass
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [210, 110], // 210mm wide, 110mm high (custom boarding pass aspect)
  });

  const primaryColor = [109, 60, 199]; // #6d3cc7 FlyEclipse Purple
  const darkTextColor = [30, 41, 59];   // #1e293b Slate 800
  const lightBgColor = [248, 250, 252]; // #f8fafc Slate 50
  const borderColor = [226, 232, 240];  // #e2e8f0 Slate 200

  // Outer Border & Card Background
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(0, 0, 210, 110, 'F');

  // Top Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 18, 'F');

  // Airline Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FLYECLIPSE AVIATION', 10, 8);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Channel Islands Executive Commuter | Cessna 208B Grand Caravan EX', 10, 13);

  // Document Tagline on Right of Header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL E-TICKET & BOARDING PASS', 150, 8);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Channel Islands AOC #CI-2026-992 • OpenPDF Compliant', 150, 13);

  // Left Section (Main Ticket Body - 150mm wide)
  // Route Banner
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(8, 22, 140, 78, 3, 3, 'FD');

  // Origin -> Destination Display
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.origin, 14, 33);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(10);
  doc.text('—►', 36, 32);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.destination, 48, 33);

  // Flight number & Aircraft
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`FLIGHT: ${ticket.flightNumber}`, 78, 29);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Aircraft: ${ticket.aircraftModel || 'Cessna 208B Caravan'}`, 78, 34);

  // PNR Badge
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(120, 25, 24, 9, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('BOOKING PNR', 123, 28.5);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.pnr, 123, 32.5);

  // Divider line
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(12, 38, 144, 38);

  // Key Flight Details Grid
  // Row 1: Passenger & Date
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PASSENGER NAME', 14, 43);
  doc.text('DATE', 78, 43);
  doc.text('DEPARTURE (BST)', 115, 43);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.passengerName.toUpperCase(), 14, 48);
  doc.text(ticket.departureDate, 78, 48);
  doc.text(ticket.departureTime, 115, 48);

  // Row 2: Gate & Seat
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6.5);
  doc.text('GATE', 14, 55);
  doc.text('SEAT NUMBER', 45, 55);
  doc.text('PASSENGER TYPE', 78, 55);
  doc.text('BAGGAGE ALLOWANCE', 115, 55);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(9);
  doc.text(ticket.gate || 'GATE 1', 14, 60);

  // Seat Badge
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(44, 56, 15, 6.5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.seatNumber, 48, 60.5);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(8);
  doc.text(ticket.passengerType || 'ADULT', 78, 60);
  doc.setFontSize(7);
  doc.text('20kg Hold + 1 Hand', 115, 60);

  // Pet notification bar if pet is travelling
  if (ticket.hasPetAttached) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.roundedRect(12, 64, 132, 7, 1, 1, 'F');
    doc.setDrawColor(167, 243, 208);
    doc.rect(12, 64, 132, 7, 'S');
    doc.setTextColor(6, 95, 70);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`PET TRAVELLING: ${ticket.petName || 'Companion Pet'} (Cessna Aft Climate Bay - Vet Cleared)`, 15, 68.5);
  }

  // Barcode visualization at bottom of main card
  doc.setFillColor(30, 41, 59);
  const startX = 14;
  const barcodeY = ticket.hasPetAttached ? 74 : 69;
  const barcodeHeight = 12;
  // Draw simulated Code128 pattern
  const barPattern = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 2, 3, 2, 1, 4, 1, 3, 2, 1, 2, 4, 1, 3, 1, 2, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 1, 2, 3, 2, 1, 3, 1, 2, 4];
  let curX = startX;
  barPattern.forEach((width) => {
    doc.rect(curX, barcodeY, width * 0.45, barcodeHeight, 'F');
    curX += width * 0.45 + 0.6;
  });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`*${ticket.barcodeNumber || '298104829104'}*`, 45, barcodeY + barcodeHeight + 4);

  // Perforated Line Between Main Pass and Stub
  doc.setDrawColor(203, 213, 225); // Slate 300
  for (let y = 20; y <= 100; y += 4) {
    doc.line(152, y, 152, y + 2);
  }

  // Right Section (Boarding Stub - 50mm wide)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(155, 22, 48, 78, 3, 3, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BOARDING STUB', 160, 28);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6);
  doc.text('PASSENGER', 160, 34);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const shortName = ticket.passengerName.length > 18 ? ticket.passengerName.substring(0, 17) + '...' : ticket.passengerName;
  doc.text(shortName.toUpperCase(), 160, 38);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6);
  doc.text('FLIGHT / SEAT', 160, 44);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`${ticket.flightNumber}  •  SEAT ${ticket.seatNumber}`, 160, 48);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6);
  doc.text('ROUTE / DATE', 160, 54);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(7);
  doc.text(`${ticket.origin} - ${ticket.destination}  •  ${ticket.departureDate}`, 160, 58);

  // QR Code representation (corner markers + data points)
  const qrX = 163;
  const qrY = 62;
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX, qrY, 30, 30, 'F');
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.rect(qrX, qrY, 30, 30, 'S');

  // QR Corner position boxes
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  // Top-left
  doc.rect(qrX + 2, qrY + 2, 7, 7, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX + 3.2, qrY + 3.2, 4.6, 4.6, 'F');
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(qrX + 4.2, qrY + 4.2, 2.6, 2.6, 'F');

  // Top-right
  doc.rect(qrX + 21, qrY + 2, 7, 7, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX + 22.2, qrY + 3.2, 4.6, 4.6, 'F');
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(qrX + 23.2, qrY + 4.2, 2.6, 2.6, 'F');

  // Bottom-left
  doc.rect(qrX + 2, qrY + 21, 7, 7, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX + 3.2, qrY + 22.2, 4.6, 4.6, 'F');
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(qrX + 4.2, qrY + 23.2, 2.6, 2.6, 'F');

  // Random data dots for realistic QR
  doc.setFillColor(30, 41, 59);
  const dotCoords = [
    [11, 4], [13, 5], [15, 3], [17, 6],
    [3, 11], [5, 13], [7, 15], [9, 12],
    [11, 11], [13, 13], [15, 12], [17, 14], [19, 11], [21, 13], [23, 11], [25, 14],
    [11, 17], [13, 18], [15, 16], [17, 19], [19, 17], [21, 18], [24, 16],
    [11, 23], [13, 21], [15, 24], [17, 22], [19, 25], [23, 23], [25, 21],
  ];
  dotCoords.forEach(([dx, dy]) => {
    doc.rect(qrX + dx, qrY + dy, 1.4, 1.4, 'F');
  });

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(5.5);
  doc.text('SCAN AT GATE', 170, 95);

  // Bottom Footer Legal Notice
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(5.5);
  doc.text(
    `Gate closes 10 minutes prior to departure. Please present official government photo ID / passport. FlyEclipse AOC #CI-2026-992. Ticket Ref: ${ticket.ticketNumber}`,
    10,
    106
  );

  // Trigger browser download
  const filename = `FlyEclipse-BoardingPass-${ticket.pnr}-${ticket.seatNumber}.pdf`;
  doc.save(filename);
}
