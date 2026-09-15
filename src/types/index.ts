export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'ASSISTANT_ADMIN'
  | 'TENANT_ADMIN'
  | 'TENANT_ADMIN_ASSISTANT'
  | 'INDIVIDUAL_USER'
  | 'FAMILY_USER'
  | 'CORPORATE_USER'
  | 'CORPORATE_USER_ASSISTANT'
  | 'PASSENGER';

export type MfaMethod = 'BIOMETRIC' | 'EMAIL_OTP' | 'SMS_OTP' | 'TOTP_APP';

export type FlightStatus = 'ON_TIME' | 'BOARDING' | 'DELAYED' | 'IN_FLIGHT' | 'LANDED' | 'CANCELLED';

export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'BOOKED' | 'RESERVED';

export type BookingStatus = 'HELD' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface Airport {
  code: string; // e.g., 'JER'
  icao: string; // e.g., 'EGJJ'
  name: string;
  islandOrCity: string;
  country: string;
  timezone: string; // e.g., 'Europe/London' (GMT/BST)
  lat: number;
  lng: number;
  isRegularIsland: boolean;
}

export interface Aircraft {
  registration: string; // 'G-ECLP', 'G-ECLS'
  model: string; // 'Cessna 208B Grand Caravan EX'
  nickname: string;
  engine: string; // 'Pratt & Whitney Canada PT6A-140 Turboprop'
  totalFlightHours: number;
  engineCycles: number;
  status: 'AIRWORTHY' | 'MAINTENANCE' | 'IN_FLIGHT' | 'PRE_FLIGHT_CHECK';
  seatCapacity: number; // 8 Executive passenger seats
  petCapacity: number; // 2 Climate-controlled Crate bays + Under-seat tether
  baseAirport: string;
  lastInspectionDate: string;
  nextScheduledCheckHours: number;
}

export interface Route {
  id: string;
  fromCode: string;
  toCode: string;
  viaCode?: string;
  flightTimeMinutes: number;
  nauticalMiles: number;
  isCharterOnly?: boolean;
}

export interface FlightLegSegment {
  legIndex: number;
  flightNumber: string;
  fromCode: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraftRegistration: string;
}

export interface RegularFlight {
  id: string;
  flightNumber: string; // e.g., 'FE-101' or 'FE-101 / FE-102'
  departureTime: string; // '07:30'
  arrivalTime: string; // '08:00'
  fromCode: string;
  toCode: string;
  viaCode?: string; // 'ACI'
  aircraftRegistration: string;
  pilotId: string;
  copilotId?: string;
  status: FlightStatus;
  statusRemark?: string;
  date: string; // 'YYYY-MM-DD'
  availableSeatsCount: number;
  bookedSeats: string[]; // seatIds on 2h hold
  reservedSeats: string[]; // seatIds paid
  heldExpiresAt?: Record<string, number>; // seatId -> timestamp
  // Connecting flight details
  isConnecting?: boolean;
  connectingVia?: string; // 'ACI'
  connectingViaName?: string; // 'Alderney Airport'
  layoverDuration?: string; // '30 mins'
  totalTravelTime?: string; // '1h 45m'
  sectorsCount?: number; // 2
  legs?: FlightLegSegment[];
}

export interface SeatInfo {
  id: string; // '1A', '1B', '2A', '2B', '2C', '3A', '3B', '3C'
  label: string;
  row: number;
  type: 'WINDOW' | 'AISLE' | 'SOLO' | 'PET_FRIENDLY';
  pitchInches: number;
  basePriceP1: number;
}

export interface PetInfo {
  id: string;
  name: string;
  type: 'DOG' | 'CAT' | 'BIRD' | 'OTHER';
  breed: string;
  weightKg: number;
  vetCertificateNumber: string;
  crateRequired: boolean;
  assignedZone?: 'CRATE_BAY_1' | 'CRATE_BAY_2' | 'UNDER_SEAT';
}

export interface PassengerInfo {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  type: 'ADULT' | 'CHILD' | 'PET';
  dob: string;
  passportNumber: string;
  passportCountry: string;
  phone: string;
  email: string;
  seatId?: string;
  petDetails?: PetInfo;
}

export interface RelativeProfile {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dob: string;
  passportNumber: string;
  phone: string;
  email: string;
  hasPet: boolean;
  petName?: string;
  petBreed?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  surname?: string;
  dob?: string;
  country?: string;
  city?: string;
  mobile: string;
  homeAddress?: string;
  billingAddress?: string;
  photoUrl?: string;
  mapCoordinates?: { lat: number; lng: number };
  passportNumber?: string;
  passportExpiry?: string;
  passportImageUploaded?: boolean;
  drivingLicenseNumber?: string;
  drivingLicenseUploaded?: boolean;
  visaInfo?: string;
  paymentMethodSaved?: boolean;
  savedRelatives: RelativeProfile[];
  companyName?: string;
  companyVatNumber?: string;
  isMfaEnabled: boolean;
  preferredMfaMethod: MfaMethod;
  profileCompletePercentage: number;
  skippedSteps: string[];
}

export interface Booking {
  id: string;
  referenceNumber: string; // 'FE-BK-8921'
  pnr: string; // 'X9L4KP'
  flightId: string;
  flightNumber: string;
  fromCode: string;
  toCode: string;
  departureDate: string;
  departureTime: string;
  aircraftRegistration: string;
  // Connecting flight fields for outbound
  isConnecting?: boolean;
  viaCode?: string;
  connectingViaName?: string;
  sectorsCount?: number;
  outboundLegs?: FlightLegSegment[];
  // Return flight fields for return journeys
  isReturnTrip?: boolean;
  returnFlightId?: string;
  returnFlightNumber?: string;
  returnDepartureDate?: string;
  returnDepartureTime?: string;
  returnAircraftRegistration?: string;
  returnSeatIds?: string[];
  returnIsConnecting?: boolean;
  returnViaCode?: string;
  returnConnectingViaName?: string;
  returnSectorsCount?: number;
  returnLegs?: FlightLegSegment[];
  userId: string;
  userEmail: string;
  passengers: PassengerInfo[];
  pets: PetInfo[];
  seatIds: string[];
  totalFare: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingCreatedAt: string;
  holdExpiresAt: number; // 2 hours from booking creation timestamp
  stripePaymentIntentId?: string;
  leadPassengerName: string;
  isCharter: boolean;
  refundAmount?: number;
  refundStrategyApplied?: string;
}

export interface Ticket {
  ticketNumber: string; // 'TK-7819024'
  bookingReference: string;
  pnr: string;
  passengerId: string;
  passengerName: string;
  passengerType: 'ADULT' | 'CHILD' | 'PET';
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  gate: string;
  seatNumber: string;
  qrPayload: string;
  barcodeNumber: string;
  aircraftModel: string;
  baggageAllowance: string;
  hasPetAttached: boolean;
  petName?: string;
  checkedIn: boolean;
  legType?: 'OUTBOUND' | 'RETURN' | 'INBOUND';
  // Connecting flight details
  isConnecting?: boolean;
  viaCode?: string; // 'ACI'
  viaAirportName?: string; // 'Alderney Airport'
  connectingLegIndex?: number; // 1 or 2
  totalConnectingLegs?: number; // 2
  finalDestination?: string; // 'BOH'
  journeyOrigin?: string; // 'JER'
  layoverDuration?: string; // '30 mins'
  connectingFlightNumber?: string; // 'FE-102'
  connectingDepartureTime?: string; // '08:30'
}

export interface PilotCrew {
  id: string;
  name: string;
  callsign: string;
  role: 'CAPTAIN' | 'FIRST_OFFICER' | 'FLIGHT_DISPATCHER' | 'A&P_CHIEF_ENGINEER';
  licenseNumber: string;
  medicalExpiry: string;
  aircraftRatings: string[]; // ['C208B', 'PT6A Turboprop', 'IFR/Night']
  totalFlightHours: number;
  hoursThisMonth: number;
  dutyStatus: 'ON_DUTY' | 'STANDBY' | 'RESTING' | 'IN_FLIGHT';
  baseAirport: string;
  assignedAircraft?: string;
  photoUrl: string;
}

export interface MaintenanceLog {
  id: string;
  aircraftRegistration: string;
  logDate: string;
  logTime: string;
  category: 'PRE_FLIGHT_CHECK' | '100_HOUR_INSPECTION' | 'AVIONICS' | 'ENGINE_PT6A' | 'SQUAWK_DEFECT';
  flightHours: number;
  engineCycles: number;
  description: string;
  technicianName: string;
  technicianLicense: string;
  status: 'CLEARED_AIRWORTHY' | 'DEFERRED_MEL' | 'GROUNDED_AOG';
  actionTaken: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType:
    | 'SIGNUP'
    | 'SIGNIN'
    | 'SIGNOUT'
    | 'BOOKING_CREATED'
    | 'SEAT_HELD_2H'
    | 'PAYMENT_COMPLETED'
    | 'CHECK_IN'
    | 'BOOKING_CANCELLED'
    | 'REFUND_PROCESSED'
    | 'FLIGHT_SCHEDULE_UPDATED'
    | 'MAINTENANCE_LOG_CREATED'
    | 'ROLE_PERMISSION_CHANGED'
    | 'MFA_VERIFIED'
    | 'ENTITY_CRUD';
  actorId?: string;
  actorEmail: string;
  actorRole: UserRole;
  ipAddress: string;
  details: string;
  tenantId: string;
  entityId?: string;
}

export interface PricingMatrixRule {
  passengerCount: number;
  pricePerSeat: number[]; // P1, P2, P3, P4, P5, P6
}

export interface RefundPolicy {
  hoursBeforeDeparture: number;
  refundPercentage: number;
  deductionFee: number;
  policyDescription: string;
}
