/**
 * Externalized HTML Templates Registry
 * All HTML codes are maintained in external .html files in the /template directory
 * and imported here as string properties.
 */
import boardingPassHtml from './boarding-pass.html?raw';
import cessnaSeatMapHtml from './cessna-seat-map.html?raw';
import bookingEngineHtml from './booking-engine.html?raw';
import passengerVerificationHtml from './passenger-verification.html?raw';
import flightSchedulesHtml from './flight-schedules.html?raw';
import maintenanceDashboardHtml from './maintenance-dashboard.html?raw';
import crewRosterHtml from './crew-roster.html?raw';
import entityManagementHtml from './entity-management.html?raw';
import loginModalHtml from './login-modal.html?raw';
import confirmationEmailHtml from './confirmation-email.html?raw';

export interface ExternalHtmlTemplate {
  id: string;
  name: string;
  filename: string;
  category: string;
  htmlString: string;
}

export const boardingPassTemplate: string = boardingPassHtml;
export const cessnaSeatMapTemplate: string = cessnaSeatMapHtml;
export const bookingEngineTemplate: string = bookingEngineHtml;
export const passengerVerificationTemplate: string = passengerVerificationHtml;
export const flightSchedulesTemplate: string = flightSchedulesHtml;
export const maintenanceDashboardTemplate: string = maintenanceDashboardHtml;
export const crewRosterTemplate: string = crewRosterHtml;
export const entityManagementTemplate: string = entityManagementHtml;
export const loginModalTemplate: string = loginModalHtml;
export const confirmationEmailTemplate: string = confirmationEmailHtml;

export const ALL_TEMPLATES: ExternalHtmlTemplate[] = [
  {
    id: 'boarding-pass',
    name: 'Boarding Pass & E-Ticket',
    filename: 'template/boarding-pass.html',
    category: 'Ticketing',
    htmlString: boardingPassHtml,
  },
  {
    id: 'cessna-seat-map',
    name: 'Cessna 208B Cabin & Pet Bay Layout',
    filename: 'template/cessna-seat-map.html',
    category: 'Cabin & Aircraft',
    htmlString: cessnaSeatMapHtml,
  },
  {
    id: 'booking-engine',
    name: 'Flight Booking & Route Selector',
    filename: 'template/booking-engine.html',
    category: 'Reservations',
    htmlString: bookingEngineHtml,
  },
  {
    id: 'passenger-verification',
    name: 'Gate Verification & Kiosk Check-in',
    filename: 'template/passenger-verification.html',
    category: 'Airport Dispatch',
    htmlString: passengerVerificationHtml,
  },
  {
    id: 'flight-schedules',
    name: 'Scheduled Timetable & Dispatch',
    filename: 'template/flight-schedules.html',
    category: 'Flight Operations',
    htmlString: flightSchedulesHtml,
  },
  {
    id: 'maintenance-dashboard',
    name: 'PT6A Turbine & Maintenance Log',
    filename: 'template/maintenance-dashboard.html',
    category: 'Technical Operations',
    htmlString: maintenanceDashboardHtml,
  },
  {
    id: 'crew-roster',
    name: 'Flight Crew Roster & Duty',
    filename: 'template/crew-roster.html',
    category: 'Crew Command',
    htmlString: crewRosterHtml,
  },
  {
    id: 'entity-management',
    name: 'Aviation Domain Entity Studio',
    filename: 'template/entity-management.html',
    category: 'Database & CRUD',
    htmlString: entityManagementHtml,
  },
  {
    id: 'login-modal',
    name: 'Node.js Authentication Modal',
    filename: 'template/login-modal.html',
    category: 'Security & Auth',
    htmlString: loginModalHtml,
  },
  {
    id: 'confirmation-email',
    name: 'Reservation Confirmation Email',
    filename: 'template/confirmation-email.html',
    category: 'Customer Communications',
    htmlString: confirmationEmailHtml,
  },
];
