# Software Requirements Specification (SRS)
## FlyEclipse Aviation Management System

**Document Version:** 1.0.0  
**Status:** Approved / Production Baseline  
**Standard:** IEEE 830-1998 / ISO/IEC/IEEE 29148:2018 Compliant  
**Date:** September 16, 2026  
**Author:** FlyEclipse Systems Engineering & Architecture Group  
**Target Platform:** Web / Cloud-Native React & TypeScript Application  

---

### Table of Contents
1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Scope of the System
   - 1.3 Definitions, Acronyms, and Abbreviations
   - 1.4 References & Regulatory Framework
   - 1.5 System Overview
2. [Overall Description](#2-overall-description)
   - 2.1 Product Perspective & Context
   - 2.2 Product Functions
   - 2.3 User Classes and Personas (Role-Based Access Control)
   - 2.4 Operating Environment & Constraints
   - 2.5 Assumptions and Dependencies
3. [System Architecture & Data Models](#3-system-architecture--data-models)
   - 3.1 Logical Architecture
   - 3.2 Domain Entities & Schema Definitions
   - 3.3 State Machines & Lifecycle Flows
4. [Specific Functional Requirements](#4-specific-functional-requirements)
   - 4.1 Module 1: Flight Timetable, Corridors & Connecting Routing Engine
   - 4.2 Module 2: Cessna 208B Grand Caravan EX Cabin & Pet Bay Allocation
   - 4.3 Module 3: Dynamic Ticket Pricing & Revenue Matrix Engine
   - 4.4 Module 4: 2-Hour Reservation Hold & Booking Engine
   - 4.5 Module 5: Stripe Payment Gateway Integration
   - 4.6 Module 6: Certified OpenPDF Boarding Pass Generation
   - 4.7 Module 7: Passenger Verification & Self-Service Portal
   - 4.8 Module 8: Tenant Administration, Dispatch & Financial Analytics
   - 4.9 Module 9: Corporate Travel Management Portal
   - 4.10 Module 10: Aircraft Maintenance & Airworthiness Logging (Part 66)
   - 4.11 Module 11: Flight Crew Rostering & Fatigue Risk Management
   - 4.12 Module 12: Security, Multi-Factor Authentication & Audit Logging
5. [External Interface Requirements](#5-external-interface-requirements)
   - 5.1 User Interfaces
   - 5.2 Hardware Interfaces
   - 5.3 Software & API Interfaces
   - 5.4 Communications Interfaces
6. [Non-Functional Requirements](#6-non-functional-requirements)
   - 6.1 Performance & Latency
   - 6.2 Reliability, Availability & Fault Tolerance
   - 6.3 Security & Data Privacy
   - 6.4 Usability & Accessibility (WCAG 2.1 AA)
   - 6.5 Maintainability & Portability
7. [Verification & Traceability Matrix](#7-verification--traceability-matrix)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) provides a comprehensive, rigorous, and fine-grained description of the **FlyEclipse Aviation Management System**. It specifies the functional behaviors, operational constraints, performance metrics, data models, security parameters, and user interfaces required for operating a premier island-hopping commercial and private charter airline across the Channel Islands and Southern United Kingdom.

This specification serves as the formal contractual and technical baseline for software developers, quality assurance engineers, flight dispatchers, aviation regulators (UK CAA / Channel Islands DCA), and corporate travel managers.

### 1.2 Scope of the System
The software system, titled **FlyEclipse Aviation Management System**, is a web-based, full-stack aviation reservation and airline operational control suite. The platform encompasses:
- Real-time scheduled and connecting flight timetable management for Channel Islands hubs (Jersey `JER/EGJJ`, Alderney `ACI/EGJA`, Guernsey `GCI/EGJB`, Bournemouth `BOH/EGHH`, and London Biggin Hill `BQH/EGKB`).
- Interactive cabin seat maps modeling the bespoke 8-seat executive configuration and dual climate-controlled pet bays of the **Cessna 208B Grand Caravan EX**.
- A proprietary dynamic marginal pricing matrix calculation engine adapting seat yields to party size and flight sectors.
- A 2-hour automated seat reservation hold engine preventing double-booking prior to payment settlement.
- A client-side vector OpenPDF boarding pass generator with cryptographic QR validation payload and IATA-compliant barcodes.
- Tenant administration consoles for flight status dispatch (On-Time, Delayed, Cancelled), assistant administrator provisioning with granular ACL, flight manifest inspections, and multi-period revenue reporting.
- A corporate travel management portal managing employee rosters and designated lead passengers.
- Part 66 aircraft airworthiness maintenance tracking and pilot crew rostering with medical and duty-time limits.
- Multi-factor authentication (Biometric WebAuthn, SMS, Email, TOTP) and an immutable security audit trail.

### 1.3 Definitions, Acronyms, and Abbreviations
| Term / Acronym | Definition |
| :--- | :--- |
| **ACL** | Access Control List (granular security permissions model) |
| **AOG** | Aircraft On Ground (grounded due to critical technical malfunction) |
| **BST** | British Summer Time (UTC+1) |
| **CAA** | Civil Aviation Authority (United Kingdom) |
| **C208B** | Cessna 208B Grand Caravan EX turboprop utility aircraft |
| **CTA** | Common Travel Area (UK, Channel Islands, Isle of Man, Ireland) |
| **DCA** | Director of Civil Aviation (Channel Islands) |
| **ETD** | Estimated Time of Departure |
| **IATA** | International Air Transport Association |
| **ICAO** | International Civil Aviation Organization |
| **MEL** | Minimum Equipment List |
| **MFA** | Multi-Factor Authentication |
| **OpenPDF / jsPDF** | Vector-based PDF generation engine for digital documents |
| **Part 66** | European / UK aviation maintenance engineer certifying standard |
| **PNR** | Passenger Name Record (6-character alphanumeric booking locator) |
| **PT6A** | Pratt & Whitney Canada PT6A-140 turboprop engine (867 shaft horsepower) |
| **RBAC** | Role-Based Access Control |
| **SRS** | Software Requirements Specification |
| **STOL** | Short Take-Off and Landing |
| **TOTP** | Time-Based One-Time Password |

### 1.4 References & Regulatory Framework
1. **ICAO Annex 6**: Operation of Aircraft — Commercial Air Transport.
2. **UK CAA CAP 393**: Air Navigation: The Order and the Regulations.
3. **Channel Islands Aviation Regulations**: Channel Islands Air Safety Rules.
4. **IATA Resolution 722e**: Electronic Ticketing Specifications and Barcode Standards.
5. **W3C Web Authentication API (WebAuthn)**: Level 2 / Level 3 Specifications.
6. **PCI-DSS v4.0**: Payment Card Industry Data Security Standard.

### 1.5 System Overview
The FlyEclipse Aviation Management System is engineered as a responsive Single Page Application (SPA) leveraging React 18+, TypeScript, Tailwind CSS, Lucide Icons, and Motion animations. The application is partitioned into discrete operational domains:
1. Passenger Booking & Seat Selection Engine
2. Passenger Verification & Boarding Pass Retrieval Portal
3. Tenant Administration, Dispatch & Revenue Analytics Hub
4. Corporate Travel Management Portal
5. Master Entity Management Console (Airports, Routes, Aircraft, Users)
6. Flight Timetable & Connecting Route Manager
7. Part 66 Fleet Maintenance & Airworthiness Control
8. Crew Rostering & Flight Dispatcher Console
9. Security, MFA & Immutable Audit Log Viewer

---

## 2. Overall Description

### 2.1 Product Perspective & Context
The Channel Islands present unique aviation challenges: short, island runways (e.g., Alderney's 880-meter asphalt runway), persistent sea fog, tidal weather patterns, and high demand for executive passenger and domestic pet transport. 

FlyEclipse operates as the primary scheduled commuter and VIP shuttle bridging the islands with the UK mainland. The application provides an end-to-end digital nervous system that links the traveling public, corporate clients, dispatchers, flight crews, and regulatory compliance engineers into a single synchronized interface.

```
       +-----------------------------------------------------------+
       |               FlyEclipse Web Application                  |
       +-----------------------------+-----------------------------+
                                     |
    +-------------------+------------+------------+--------------------+
    |                   |                         |                    |
[Passenger / Corp]  [Tenant Dispatch]     [Flight Operations]     [Regulator / Audit]
    |                   |                         |                    |
- Seat Map (C208B)  - Status Broadcasting - Part 66 Maintenance   - Security Audit
- Pet Reservations  - Revenue Analytics   - Crew Duty Times       - Compliance PNR
- PDF Boarding Pass - Assistant Admin ACL - Aircraft Utilization  - MFA Validation
- PNR Verification  - Manifest CSV Export - Timetable Editor      - Flight Logs
```

### 2.2 Product Functions
- **Flight Discovery**: Direct point-to-point and two-sector connecting flights with automated layover calculations and schedule filtering.
- **Cabin & Pet Allocation**: Interactive graphical layout of the Cessna 208B Grand Caravan EX featuring 8 passenger seats with pitch metrics and two aft climate-controlled pet bays.
- **Dynamic Pricing Engine**: Automated calculation of base fare according to passenger party size, connecting flight sectors, and pet handling surcharges.
- **2-Hour Hold Management**: Temporary reservation holds with visible countdown timers to preserve inventory during corporate approval or payment authorization.
- **Ticket & Pass Issuance**: Automatic generation of unique PNRs, ticket numbers (`TK-`), digital boarding passes with QR codes, and downloadable PDF documents.
- **Passenger Self-Service**: Comprehensive identity search engine supporting PNR, email, ticket number, mobile phone, and passport queries.
- **Tenant Operations**: Flight status updates (On-Time, Delayed with duration/reason, Cancelled with passenger care advisory) with real-time UI synchronization.
- **Financial Analytics**: Multi-period aggregation of revenues (By Month, By Weeks, By Day, By Flight) with refund tracking and CSV export.
- **Delegated Administration**: Provisioning of Assistant Admins with role-based feature toggle permissions.
- **Corporate Account Governance**: Corporate employee rosters, job titles, and designated lead passenger status.
- **Airworthiness Management**: Aircraft flight hours, PT6A engine cycles, 100-hour phase checks, squawks, and engineer certifications.

### 2.3 User Classes and Personas (Role-Based Access Control)
The system enforces strict multi-role partitioning via the `UserRole` taxonomy:

| User Role | Description | Access Rights |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Global platform administrator and system overseer. | Unrestricted access across all tenants, route management, audit inspection, and global system configuration. |
| `TENANT_ADMIN` | Airline Director of Operations / Base Station Manager. | Manages flight status dispatch, passenger manifests, payment analytics, timetable modifications, and assistant admin provisioning. |
| `TENANT_ADMIN_ASSISTANT` | Operations Assistant / Station Dispatch Officer. | Delegated actions based on assigned permissions: flight status updates, booking on behalf of pax, ticket additions, manifest view, financial access. |
| `CORPORATE_USER` | Corporate Travel Booker (e.g., Apex Capital Partners CI). | Corporate portal access, employee roster administration, group booking with corporate billing, designated lead passengers. |
| `CORPORATE_USER_ASSISTANT` | Delegated corporate assistant booker. | Books flights on behalf of authorized corporate employees; view company bookings. |
| `INDIVIDUAL_USER` | Private passenger / Island resident. | Self-service booking, 2-hour seat holds, pet accommodations, passenger verification portal, boarding pass downloads. |
| `FAMILY_USER` | Household coordinator. | Manages saved dependents/relatives, family travel profiles, and household pet transport. |
| `PASSENGER` | Traveler without administrative rights. | Verification of active PNR and digital boarding pass retrieval. |

### 2.4 Operating Environment & Constraints
1. **Host Client**: Modern evergreen web browsers (Google Chrome 110+, Mozilla Firefox 115+, Apple Safari 16+, Microsoft Edge 110+).
2. **Display Resolution**: Responsive rendering from 375px (mobile viewports) to 2560px (4K ultra-wide displays).
3. **Execution Runtime**: Node.js 18+ containerized on Linux with reverse-proxy routing bound to port 3000.
4. **Regulatory Constraints**: Strict adherence to Channel Islands Common Travel Area (CTA) photographic identity rules, dangerous goods separation, and animal transit welfare regulations.

### 2.5 Assumptions and Dependencies
1. All scheduled flights are operated utilizing the Cessna 208B Grand Caravan EX aircraft type with 8 passenger capacity and 2 pet bay capacity.
2. Currency default is British Pound Sterling (`GBP £`).
3. Local operational time zone is British Summer Time (`BST`, UTC+1) during summer months and Greenwich Mean Time (`GMT`, UTC+0) during winter months.
4. Stripe payment gateway simulations execute with mock test vectors while strictly enforcing PCI card syntax and cryptographic validation.

---

## 3. System Architecture & Data Models

### 3.1 Logical Architecture
The application architecture is organized into distinct layered components:
- **Presentation Layer**: React 18 components structured with Tailwind CSS utility styling, Lucide icons, and Motion transition animations.
- **State Management Layer**: React state hooks synchronized through top-level application state managers in `App.tsx`, providing instant reactivity across tabs without extraneous network round-trips.
- **Business Logic Layer**:
  - `pricing.ts`: Pricing matrix calculations, multi-sector compounding, and pet supplements.
  - `pdfGenerator.ts`: Vector PDF boarding pass rendering and print stream formatting.
  - `scheduleCalendar.ts`: Timetable date-time arithmetic, duration calculations, and connecting flight assembly.
- **Data & Mock Engine**: Pre-seeded operational datasets in `src/data/mockData.ts` reflecting real-world Channel Islands flight corridors, aircraft airworthiness records, and corporate organizations.

### 3.2 Domain Entities & Schema Definitions

```
+----------------------------------------------------------------------------------------------------+
|                                      DATA MODEL RELATIONSHIPS                                      |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +-------------------+          +-------------------+          +-------------------+              |
|   |      Airport      | 1      * |       Route       | *      1 |     Aircraft      |              |
|   |  (JER, ACI, etc)  +----------+ (fromCode/toCode) +----------+   (G-ECLP/G-ECLS) |              |
|   +---------+---------+          +---------+---------+          +---------+---------+              |
|             |                              |                              |                        |
|             |                              | 1                            | 1                      |
|             |                              |                              |                        |
|             |                              *                              *                        |
|             |                    +-------------------+          +-------------------+              |
|             |                    |   RegularFlight   | 1      * |  MaintenanceLog   |              |
|             |                    | (FE-101, Status)  +----------+ (100h, Airworthy) |              |
|             |                    +---------+---------+          +-------------------+              |
|             |                              |                                                       |
|             |                              | 1                                                     |
|             |                              |                                                       |
|             |                              *                                                       |
|             |                    +-------------------+                                             |
|             +------------------->|      Booking      |                                             |
|                                  |   (PNR, Fare)     |                                             |
|                                  +----+----+----+----+                                             |
|                                       |    |    |                                                  |
|                      +----------------+    |    +----------------+                                 |
|                      | 1                   | 1                   | 1                               |
|                      |                     |                     |                                 |
|                      *                     *                     *                                 |
|             +-----------------+   +-----------------+   +-----------------+                        |
|             |  PassengerInfo  |   |     PetInfo     |   |     Ticket      |                        |
|             | (Lead Pax, Pass)|   | (Breed, Bay #)  |   | (TK-Num, QR)    |                        |
|             +-----------------+   +-----------------+   +-----------------+                        |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

#### Key Schema Attributes:
- **`RegularFlight`**:
  - `id: string`, `flightNumber: string`, `departureTime: string`, `arrivalTime: string`
  - `fromCode: string`, `toCode: string`, `viaCode?: string`
  - `status: FlightStatus` (`ON_TIME` | `BOARDING` | `DELAYED` | `IN_FLIGHT` | `LANDED` | `CANCELLED`)
  - `delayMinutes?: number`, `delayReason?: string`, `estimatedDepartureTime?: string`
  - `availableSeatsCount: number`, `bookedSeats: string[]`, `reservedSeats: string[]`
  - `isConnecting?: boolean`, `legs?: FlightLegSegment[]`
- **`Booking`**:
  - `id: string`, `referenceNumber: string`, `pnr: string`
  - `flightId: string`, `flightNumber: string`, `totalFare: number`, `currency: string`
  - `passengers: PassengerInfo[]`, `pets: PetInfo[]`, `seatIds: string[]`
  - `status: BookingStatus` (`HELD` | `CONFIRMED` | `CHECKED_IN` | `CANCELLED` | `REFUNDED`)
  - `paymentStatus: PaymentStatus` (`PENDING` | `PAID` | `REFUNDED` | `FAILED`)
  - `holdExpiresAt: number`, `leadPassengerName: string`, `leadPassengerEmail?: string`
  - `isReturnTrip?: boolean`, `returnFlightId?: string`, `returnSeatIds?: string[]`
- **`AssistantAdminUser`**:
  - `id: string`, `tenantId: string`, `firstName: string`, `lastName: string`, `email: string`
  - `department: string`, `status: 'ACTIVE' | 'SUSPENDED'`
  - `permissions: { canUpdateFlightStatus, canBookFlights, canAddPassengers, canViewManifests, canViewFinancials }`

### 3.3 State Machines & Lifecycle Flows

#### 3.3.1 Seat Inventory & Booking Lifecycle State Machine
```
[ Open Seat: AVAILABLE ]
        |
        | (Passenger selects seat & enters profile)
        v
[ Temporary Hold: HELD (Status: PENDING) ] <--- 2-Hour Timer Active
        |
        +-----------------------------------+
        |                                   | (Timer expires or user cancels)
        | (Stripe Payment Confirmed)        v
        v                         [ Released to AVAILABLE ]
[ Confirmed Seat: RESERVED (Status: CONFIRMED) ]
        |
        +-----------------------------------+
        |                                   | (Passenger cancels booking)
        | (Passenger Checks In)             v
        v                         [ CANCELLED / REFUNDED ]
[ Boarding Status: CHECKED_IN ]
        |
        | (Flight Departs)
        v
[ Completed Status: FLOWN ]
```

#### 3.3.2 Operational Flight Status Lifecycle State Machine
```
[ ON_TIME ] ------------> [ DELAYED ] (ETD + delayReason specified)
     |                          |
     +------------+-------------+
                  |
                  v
            [ BOARDING ]
                  |
                  v
            [ IN_FLIGHT ]
                  |
                  v
             [ LANDED ]

* Exception Path: Any status prior to departure may transition to [ CANCELLED ] with mandatory passenger re-accommodation broadcast.
```

---

## 4. Specific Functional Requirements

### 4.1 Module 1: Flight Timetable, Corridors & Connecting Routing Engine
- **FR-1.1**: The system **SHALL** provide real-time schedule queries across all active Channel Islands and UK corridors:
  - Jersey (`JER`) <-> Alderney (`ACI`)
  - Jersey (`JER`) <-> Guernsey (`GCI`)
  - Guernsey (`GCI`) <-> Alderney (`ACI`)
  - Alderney (`ACI`) <-> Bournemouth (`BOH`)
  - Guernsey (`GCI`) <-> Bournemouth (`BOH`)
  - Jersey (`JER`) <-> London Biggin Hill (`BQH` - Charter Hub)
- **FR-1.2 (Connecting Multi-Sector Flights)**: When a direct flight corridor is not scheduled, the system **SHALL** compute and display two-sector connecting journeys routed via Alderney (`ACI`) or Guernsey (`GCI`).
  - Example: `JER` -> `ACI` (Sector 1, 30m) + 30-minute layover + `ACI` -> `BOH` (Sector 2, 45m).
  - The system **SHALL** present total travel time, layover duration, individual flight sector numbers, and connecting airport names.
- **FR-1.3**: The system **SHALL** display scheduled flight waves:
  - Morning Bank: 07:30 to 11:30 BST.
  - Afternoon / Evening Bank: 13:30 to 18:40 BST.
- **FR-1.4**: The system **SHALL** dynamically recalculate flight seat availability counts as seats are held or confirmed.

### 4.2 Module 2: Cessna 208B Grand Caravan EX Cabin & Pet Bay Allocation
- **FR-2.1**: The system **SHALL** render an interactive top-down graphical cabin map replicating the Cessna 208B Grand Caravan EX layout.
- **FR-2.2**: The passenger cabin **SHALL** feature exactly 8 executive leather seats arranged in 4 rows:
  - Row 1: `1A` (Solo Window, 38" pitch), `1B` (Solo Window, 38" pitch)
  - Row 2: `2A` (Window / Pet-Friendly, 36" pitch), `2B` (Window / Pet-Friendly, 36" pitch)
  - Row 3: `3A` (Window Executive, 36" pitch), `3B` (Window Executive, 36" pitch)
  - Row 4: `4A` (Window / Pet-Friendly, 40" pitch), `4B` (Window / Pet-Friendly, 40" pitch)
- **FR-2.3**: The cabin map **SHALL** visually distinguish seat operational states:
  - `AVAILABLE`: Neutral slate border, clickable for selection.
  - `SELECTED`: Highlighted in royal purple with checkmark indicator.
  - `HELD`: Amber badge with countdown indicator (2-hour hold active).
  - `BOOKED / PAID`: Dark slate filled, disabled for selection.
- **FR-2.4 (Pet Accommodation Bays)**: The system **SHALL** model dedicated aft pet accommodations:
  - `CRATE_BAY_1`: Aft climate-controlled kennel bay (maximum weight 35kg).
  - `CRATE_BAY_2`: Aft climate-controlled kennel bay (maximum weight 35kg).
  - Under-seat tether options for approved small carriers in rows 2 and 4.
- **FR-2.5**: The system **SHALL** enforce a hard limit of two (2) large pet crates per aircraft flight leg to comply with aircraft weight and balance limits.

### 4.3 Module 3: Dynamic Ticket Pricing & Revenue Matrix Engine
- **FR-3.1**: The system **SHALL** calculate base ticket prices using the calibrated marginal passenger pricing matrix:
  ```
  Passengers | P1    | P2   | P3   | P4   | P5   | P6
  1 Pax      | £1500 |  -   |  -   |  -   |  -   |  -
  2 Pax      | £825  | £975 |  -   |  -   |  -   |  -
  3 Pax      | £675  | £825 | £975 |  -   |  -   |  -
  4 Pax      | £525  | £675 | £825 | £975 |  -   |  -
  5 Pax      | £375  | £525 | £675 | £825 | £975 |  -
  6 Pax      | £225  | £375 | £525 | £675 | £825 | £975
  ```
- **FR-3.2**: If more than 6 passengers are booked in a single party, each marginal passenger (P7 and P8) **SHALL** be priced at the base floor rate of £225 per sector.
- **FR-3.3 (Multi-Sector Compounding)**: For connecting flights with multiple sectors (e.g. `JER -> ACI -> BOH`, 2 sectors), the system **SHALL** multiply the per-sector base price by the number of scheduled sectors (`totalBaseFare = perSectorBaseTotal * sectorsCount`).
- **FR-3.4 (Pet Surcharge)**: The system **SHALL** add a mandatory handling and climate crate bay supplement of £75 per pet per sector.
- **FR-3.5 (Round-Trip Fare)**: If a return itinerary is selected, the grand total **SHALL** equal the sum of the outbound fare, return fare, and pet supplements across all flown sectors.

### 4.4 Module 4: 2-Hour Reservation Hold & Booking Engine
- **FR-4.1**: Upon completion of passenger data entry and seat assignment, the system **SHALL** permit the user to initiate a **2-Hour Seat Hold**.
- **FR-4.2**: The system **SHALL** assign a unique 6-character alphanumeric PNR (e.g. `X9L4KP`) and booking reference (e.g. `FE-BK-8921`).
- **FR-4.3**: The held seats **SHALL** be immediately locked in application state with a timestamp set to `Date.now() + 7,200,000` milliseconds (2 hours).
- **FR-4.4**: An active visual countdown timer (`hh:mm:ss`) **SHALL** be rendered in the reservation banner.
- **FR-4.5**: If the timer reaches zero before payment is settled, the held seats **SHALL** automatically revert to `AVAILABLE` inventory.
- **FR-4.6 (Lead Passenger Enforcement)**: Every booking with one or more passengers **SHALL** require the explicit designation of a Lead Passenger (`isLeadPassenger: true`), whose contact information is recorded for emergency manifest communications.

### 4.5 Module 5: Stripe Payment Gateway Integration
- **FR-5.1**: The booking engine **SHALL** provide a simulated PCI-compliant Stripe payment gateway modal.
- **FR-5.2**: The gateway **SHALL** validate credit cardholder name, 16-digit card number (with automatic Visa / Mastercard detection), expiration date (`MM/YY`), and 3-digit CVC code.
- **FR-5.3**: Upon card submission, the system **SHALL** generate a mock Stripe Payment Intent ID (e.g. `pi_3M8829104821`).
- **FR-5.4**: Successful authorization **SHALL** transition booking status from `HELD` to `CONFIRMED`, payment status from `PENDING` to `PAID`, and generate official digital tickets.

### 4.6 Module 6: Certified OpenPDF Boarding Pass Generation
- **FR-6.1**: The system **SHALL** generate digital boarding passes for every passenger and pet on a confirmed booking.
- **FR-6.2 (Connecting Flight Leg Split)**: For multi-sector connecting journeys, the system **SHALL** generate distinct boarding passes for each leg:
  - Leg 1 of 2: Origin to transit hub (e.g. `JER` -> `ACI`).
  - Leg 2 of 2: Transit hub to final destination (e.g. `ACI` -> `BOH`), indicating layover duration and connecting flight number.
- **FR-6.3**: Every boarding pass **SHALL** display:
  - Official Airline Header: FlyEclipse Channel Islands Shuttle.
  - Passenger full legal name and Lead Passenger badge (if applicable).
  - PNR code, Ticket Number (`TK-`), Flight Number, Gate, and Seat Number.
  - Aircraft model (`Cessna 208B Grand Caravan EX`).
  - Baggage allowance details (Hold baggage + pet carrier allowances).
  - Cryptographic QR validation payload (`FLYECLIPSE:PNR:PASSPORT:SEAT`).
  - 12-digit IATA barcode representation.
  - Pet travel notification banner when an animal is attached to the ticket.
- **FR-6.4 (Vector PDF Download)**: The system **SHALL** include a one-click client-side PDF export utilizing `jspdf` to generate an A4/pass-sized, printable document with embedded vector graphics and barcodes.

### 4.7 Module 7: Passenger Verification & Self-Service Portal
- **FR-7.1**: The system **SHALL** provide a dedicated public-facing passenger verification and flight status lookup engine.
- **FR-7.2**: The verification engine **SHALL** support searching across five distinct identity parameters:
  1. Booking PNR Locator (e.g. `X9L4KP`)
  2. Passenger / Lead Email Address
  3. Electronic Ticket Number (`TK-X9L4KP01`)
  4. Registered Mobile Phone Number
  5. Official Passport / Photo ID Number
- **FR-7.3**: Upon finding a matching record, the portal **SHALL** render:
  - Real-time flight operational status (On-Time, Delayed, Cancelled).
  - Scheduled departure date, time, and assigned Cessna registration.
  - Payment settlement status and Stripe transaction amount.
  - Itemized passenger roster with assigned seat numbers.
  - Pet manifest specifications with crate bay locations.
  - Direct button to launch the digital Boarding Pass modal and download PDF passes.

### 4.8 Module 8: Tenant Administration, Dispatch & Financial Analytics
- **FR-8.1 (Operational Flight Status Dispatch)**:
  - Tenant administrators and authorized assistant admins **SHALL** be able to update flight operational statuses: `ON_TIME`, `DELAYED`, `CANCELLED`, `BOARDING`, `IN_FLIGHT`, and `LANDED`.
  - When marking a flight as `DELAYED`, the system **SHALL** require input of:
    - Delay duration in minutes (with quick-select buttons: +15m, +30m, +45m, +60m, +90m, +120m).
    - Revised Estimated Time of Departure (`ETD`).
    - Standardized delay cause category (e.g., Channel Sea Fog / Low Visibility, Air Traffic Control Flow Management, Technical Inspection, Connecting Passenger Hold).
    - Public passenger broadcast remark.
  - When marking a flight as `CANCELLED`, the system **SHALL** require cancellation reason entry and display passenger protection advisories.
- **FR-8.2 (Flight Passenger Manifest Viewer)**:
  - The system **SHALL** provide a live passenger manifest for every scheduled flight.
  - The manifest **SHALL** display: Total confirmed passengers vs. capacity (e.g. `3 / 8 Seats`), Lead Passenger identifiers, seat assignments, passport numbers, check-in status, and attached pet details.
  - The system **SHALL** support one-click CSV export of the passenger manifest for ground handling and immigration clearance.
- **FR-8.3 (Multi-Period Payment Analytics Dashboard)**:
  - The system **SHALL** calculate gross revenue, refund deductions, net revenue, booking counts, and passenger volume grouped by:
    - 📅 **By Month**: Calendar month revenue trends and growth rates.
    - 🗓️ **By Weeks**: 7-day rolling performance.
    - 📆 **By Day**: Date-specific transaction items.
    - ✈️ **By Flight**: Financial yield per flight corridor and load factors.
  - The system **SHALL** provide filtering by payment status (`PAID`, `PENDING`, `REFUNDED`), PNR keyword search, and CSV export.
- **FR-8.4 (Assistant Admin Provisioning & Delegation)**:
  - Tenant Admins **SHALL** be able to provision new Assistant Admin accounts assigned to their tenant (`FLYECLIPSE_CI`, `GUERNSEY_SHUTTLE`, `ALDERNEY_AIR`).
  - The system **SHALL** enforce granular permission toggles:
    - `canUpdateFlightStatus`: Authorization to modify timetable status.
    - `canBookFlights`: Authorization to book on behalf of passengers.
    - `canAddPassengers`: Authorization to append passengers to existing flights.
    - `canViewManifests`: Access to passenger manifests and passport data.
    - `canViewFinancials`: Access to revenue analytics and payment records.
  - The system **SHALL** provide instant user impersonation ("Login as User") for operational flexibility and testing.

### 4.9 Module 9: Corporate Travel Management Portal
- **FR-9.1**: The system **SHALL** provide a dedicated portal for corporate travel coordinators (e.g., Apex Capital Partners CI).
- **FR-9.2**: The portal **SHALL** maintain a corporate employee roster including: Employee ID, Full Name, Email, Phone, Job Title, Department, Passport details, Date of Birth, Frequent Flyer Number, and Emergency Contact.
- **FR-9.3**: Corporate coordinators **SHALL** be able to designate which employees are authorized to act as Lead Passengers (`canBeLeadPassenger: true`).
- **FR-9.4**: The booking engine **SHALL** support corporate direct booking, attaching company VAT and corporate invoicing credentials to issued tickets.

### 4.10 Module 10: Aircraft Maintenance & Airworthiness Logging (Part 66)
- **FR-10.1**: The system **SHALL** track aircraft airworthiness metrics for all fleet aircraft:
  - Registration (e.g. `G-ECLP`, `G-ECLS`)
  - Airframe total flight hours and PT6A turbine engine cycles.
  - Airworthiness status: `AIRWORTHY`, `MAINTENANCE`, `IN_FLIGHT`, `PRE_FLIGHT_CHECK`.
  - Next scheduled inspection threshold (e.g. 100-hour phase inspection).
- **FR-10.2**: The system **SHALL** maintain Part 66 maintenance engineering logs:
  - Log ID, timestamp, aircraft registration, and category (`PRE_FLIGHT_CHECK`, `100_HOUR_INSPECTION`, `AVIONICS`, `ENGINE_PT6A`, `SQUAWK_DEFECT`).
  - Technician name and UK Part 66 engineering license number (e.g. `UK.PART66.B1.B2.4920`).
  - Engineering status stamp: `CLEARED_AIRWORTHY`, `DEFERRED_MEL`, `GROUNDED_AOG`.
  - Detailed action taken and engine diagnostics summary.

### 4.11 Module 11: Flight Crew Rostering & Fatigue Risk Management
- **FR-11.1**: The system **SHALL** maintain pilot and dispatcher profiles:
  - Crew ID, Full Name, Callsign (e.g. `Eclipse Alpha`), and Role (`CAPTAIN`, `FIRST_OFFICER`, `FLIGHT_DISPATCHER`, `A&P_CHIEF_ENGINEER`).
  - Professional flight license number (e.g. `UK.ATPL.882910`).
  - Class 1 medical examination expiration date.
  - Aircraft type ratings (e.g., Cessna C208B Grand Caravan, PT6A Turboprop, Channel Islands IFR/STOL).
  - Total cumulative flight hours and flight hours logged this calendar month.
- **FR-11.2**: The system **SHALL** track real-time duty status (`ON_DUTY`, `STANDBY`, `RESTING`, `IN_FLIGHT`) to support compliance with flight duty period (FDP) limitations.

### 4.12 Module 12: Security, Multi-Factor Authentication & Audit Logging
- **FR-12.1**: The system **SHALL** provide Multi-Factor Authentication (MFA) supporting four distinct verification modalities:
  1. WebAuthn Biometric verification (TouchID, FaceID, Windows Hello).
  2. Time-Based One-Time Password (TOTP) Authenticator apps.
  3. SMS OTP code dispatch.
  4. Email OTP code dispatch.
- **FR-12.2**: The system **SHALL** enforce an immutable security audit trail recording:
  - Unique log ID, ISO timestamp, and event category (`SIGNIN`, `SIGNUP`, `BOOKING_CREATED`, `SEAT_HELD_2H`, `PAYMENT_COMPLETED`, `CHECK_IN`, `BOOKING_CANCELLED`, `FLIGHT_SCHEDULE_UPDATED`, `MAINTENANCE_LOG_CREATED`, `ROLE_PERMISSION_CHANGED`, `ENTITY_CRUD`).
  - Actor ID, actor email, and security role.
  - Client IP address and tenant identifier.
  - Detailed description of data mutation or access request.

---

## 5. External Interface Requirements

### 5.1 User Interfaces
1. **Design System & Aesthetics**: Clean, high-contrast, modern aviation typography paired with a royal purple primary brand palette (`#6d3cc7` / `#5426a5`), emerald accents for pet bays (`#10b981`), and amber warning accents for held seats and flight delays.
2. **Navigation Paradigm**: Top-level tabbed navigation with persistent role indicator, tenant switcher, and quick-action user switches.
3. **Responsive Breakpoints**:
   - Mobile: Single-column stacked cards, full-width touch targets (minimum 44px height).
   - Tablet / Desktop: Multi-column analytical grids, split bento-style flight search and seat selection layout.

### 5.2 Hardware Interfaces
- **Camera / Biometric Sensors**: Interaction with client hardware via standard W3C Web Authentication API (`navigator.credentials`) for TouchID/FaceID authentication.
- **Printing Hardware**: Output formatting formatted for standard 300 DPI thermal boarding pass printers and standard A4 office printers.

### 5.3 Software & API Interfaces
- **Stripe API Simulation**: PCI-compliant mock credit card tokenization and Payment Intent webhook simulation.
- **PDF Generation Engine**: Client-side DOM-to-Vector conversion using `jspdf` library.
- **Browser Storage**: Session state persistence and localStorage caching for user preferences and draft bookings.

### 5.4 Communications Interfaces
- HTTPS encryption (TLS 1.3) required for all transmission.
- Simulated WebSocket push notification channel for real-time flight status delay broadcasts to passenger itinerary views.

---

## 6. Non-Functional Requirements

### 6.1 Performance & Latency
- **NFR-1.1**: The dynamic pricing calculation engine **SHALL** recompute fares and multi-sector sums in under 10 milliseconds upon any seat or passenger count modification.
- **NFR-1.2**: Boarding pass vector PDF compilation and download trigger **SHALL** complete within 500 milliseconds on standard client devices.
- **NFR-1.3**: The initial application bundle **SHALL** load and render the interactive booking timetable in under 1.5 seconds on broadband connections.

### 6.2 Reliability, Availability & Fault Tolerance
- **NFR-2.1**: The system **SHALL** maintain zero data loss for held seat reservations during active 2-hour hold countdowns.
- **NFR-2.2**: State mutations (such as flight delay status changes or assistant admin provisioning) **SHALL** instantly reflect across all interconnected components in memory without requiring full browser reload.

### 6.3 Security & Data Privacy
- **NFR-3.1**: Passport numbers and date of birth records **SHALL** be handled with strict client-side isolation, and only exposed to authorized operations personnel.
- **NFR-3.2**: Assistant Admin users **SHALL NOT** be able to view financial revenue figures if the `canViewFinancials` permission flag is disabled.
- **NFR-3.3**: All security-critical events (login, seat holds, status updates, permission edits) **SHALL** generate unmodifiable audit log records.

### 6.4 Usability & Accessibility (WCAG 2.1 AA)
- **NFR-4.1**: All text elements **SHALL** satisfy WCAG 2.1 AA contrast ratio requirements (minimum 4.5:1 for body copy).
- **NFR-4.2**: Every interactive seat element on the Cessna 208B cabin map **SHALL** include accessible aria-labels denoting seat number, pitch, status, and pricing.
- **NFR-4.3**: Form fields across booking and admin consoles **SHALL** feature explicit visual focus indicators.

### 6.5 Maintainability & Portability
- **NFR-5.1**: Codebase **SHALL** be structured in modular TypeScript components under `/src/components/`, strictly typed without `any` overrides in core domain definitions.
- **NFR-5.2**: The application **SHALL** remain fully portable, capable of compiling into static distribution assets (`dist/`) or running in containerized cloud environments.

---

## 7. Verification & Traceability Matrix

| Requirement ID | Module / Feature | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **FR-1.1** | Flight Timetable | Inspection & Test | All 5 Channel Islands/UK airports render with valid scheduled departures. |
| **FR-1.2** | Connecting Itineraries | Unit Test & Demo | Connecting flights via ACI compute 2 sectors, layover time, and combined legs. |
| **FR-2.2** | C208B Seat Map | Visual Inspection | Exactly 8 passenger seats (1A-4B) and 2 pet bays render with pitch specs. |
| **FR-3.1** | Pricing Matrix | Automated Test | Matrix correctly yields £1500 for 1 pax, £1800 for 2 pax, down to £225 base. |
| **FR-3.4** | Pet Surcharge | Automated Test | £75/pet/sector is accurately compounded into grand total. |
| **FR-4.1** | 2-Hour Seat Hold | System Execution | Countdown timer initializes to 7200s and locks seat IDs from duplicate booking. |
| **FR-5.2** | Stripe Payment | Integration Test | Form validates 16-digit card and CVV before generating Payment Intent. |
| **FR-6.4** | OpenPDF Generation | Functional Test | Clicking "Download PDF" streams valid binary PDF with barcode and QR payload. |
| **FR-7.2** | Passenger Verification | Functional Test | PNR `X9L4KP` returns matching booking, passenger manifest, and pass link. |
| **FR-8.1** | Status Dispatch | Functional Test | Setting flight to DELAYED with +30m recalculates ETD and broadcasts remark. |
| **FR-8.3** | Revenue Analytics | Calculation Test | Financial engine accurately aggregates revenue By Month, Week, Day, and Flight. |
| **FR-8.4** | Assistant Admin ACL | Security Test | Assistant Admin accounts enforce granular permission restrictions. |
| **FR-10.2**| Maintenance Logging| Inspection & Test | Part 66 sign-off clears airworthiness status for C208B airframes. |
| **FR-12.1**| MFA Authentication | Security Test | WebAuthn and OTP verification steps succeed and record audit logs. |

---
*End of Software Requirements Specification (SRS) — FlyEclipse Aviation Management System*
