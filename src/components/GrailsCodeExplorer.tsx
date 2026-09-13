import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, Folder, Terminal, Download, Sparkles } from 'lucide-react';

interface GrailsFile {
  path: string;
  name: string;
  category: 'DOMAIN' | 'SERVICE' | 'CONFIG' | 'CONTROLLER';
  description: string;
  content: string;
}

const GRAILS_FILES: GrailsFile[] = [
  {
    path: 'grails-app/domain/com/flyeclipse/Aircraft.groovy',
    name: 'Aircraft.groovy',
    category: 'DOMAIN',
    description: 'Cessna 208B Grand Caravan EX domain with PT6A turboprop telemetry, pet bays, and tenant_id discriminator.',
    content: `package com.flyeclipse

import groovy.transform.EqualsAndHashCode
import groovy.transform.ToString

/**
 * FlyEclipse Aircraft Domain Class
 * Cessna 208B Grand Caravan EX fleet operating Channel Islands routes
 * Supports multi-tenancy with discriminator column
 */
@EqualsAndHashCode(includes = ['registration'])
@ToString(includes = ['registration', 'model', 'status'], includeNames = true)
class Aircraft implements Serializable {

    String registration         // e.g. G-ECLP, G-ECLS
    String model                // Cessna 208B Grand Caravan EX
    String engineType           // Pratt & Whitney Canada PT6A-140 Turboprop
    Integer passengerCapacity   // 8 Executive Cabin Seats
    Integer petCrateBays        // 2 Climate-controlled Crate Zones
    BigDecimal totalFlightHours
    Integer totalEngineCycles
    String status               // AIRWORTHY, MAINTENANCE, IN_FLIGHT, AOG
    String baseAirportCode      // JER, GCI, ACI, BOH
    Date lastInspectionDate
    Integer nextDueInspectionHours
    String tenantId             // Multi-tenancy discriminator column

    static hasMany = [flightSchedules: FlightSchedule, maintenanceLogs: MaintenanceLog]

    static constraints = {
        registration unique: true, blank: false, size: 4..10
        model blank: false
        engineType blank: false
        passengerCapacity min: 1, max: 14
        petCrateBays min: 0, max: 4
        totalFlightHours min: 0.0G
        totalEngineCycles min: 0
        status inList: ['AIRWORTHY', 'MAINTENANCE', 'IN_FLIGHT', 'AOG']
        baseAirportCode inList: ['JER', 'ACI', 'GCI', 'BOH']
        lastInspectionDate nullable: true
        nextDueInspectionHours min: 0
        tenantId blank: false
    }

    static mapping = {
        table 'aircraft'
        version true
        tenantId column: 'tenant_id', index: 'idx_aircraft_tenant'
        autoTimestamp true
    }
}`,
  },
  {
    path: 'grails-app/domain/com/flyeclipse/Booking.groovy',
    name: 'Booking.groovy',
    category: 'DOMAIN',
    description: 'Core booking entity implementing 2-hour hold expiration, Stripe references, and multi-tenancy.',
    content: `package com.flyeclipse

import java.time.Instant

/**
 * FlyEclipse Booking Domain
 * Implements 2-hour seat holding logic, Stripe integration reference,
 * refund strategy tracking and multi-tenancy discriminator.
 */
class Booking implements Serializable {

    String bookingReference     // e.g. FE-BK-9201
    String pnr                  // 6-character airline PNR e.g. X9L4KP
    FlightSchedule flightSchedule
    User bookedBy
    String leadPassengerName
    
    String bookingStatus        // HELD, CONFIRMED, CHECKED_IN, CANCELLED, REFUNDED
    String paymentStatus        // PENDING, PAID, REFUNDED, FAILED
    
    Date holdExpiresAt          // Automatically expires 2 hours after creation if unpaid
    Date bookingTime = new Date()
    
    BigDecimal totalFare
    BigDecimal refundAmount = 0.0G
    String refundStrategyApplied
    String stripePaymentIntentId
    String stripeChargeId

    String tenantId             // Multi-tenancy discriminator column

    static hasMany = [passengers: Passenger, pets: Pet, tickets: Ticket]

    static constraints = {
        bookingReference unique: true, blank: false
        pnr unique: true, blank: false, size: 6..6
        flightSchedule nullable: false
        bookedBy nullable: false
        leadPassengerName blank: false
        bookingStatus inList: ['HELD', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'REFUNDED']
        paymentStatus inList: ['PENDING', 'PAID', 'REFUNDED', 'FAILED']
        holdExpiresAt nullable: true
        totalFare min: 0.0G
        refundAmount min: 0.0G
        refundStrategyApplied nullable: true
        stripePaymentIntentId nullable: true
        stripeChargeId nullable: true
        tenantId blank: false
    }

    static mapping = {
        table 'booking'
        version true
        tenantId column: 'tenant_id', index: 'idx_booking_tenant'
        passengers cascade: 'all-delete-orphan'
        pets cascade: 'all-delete-orphan'
        tickets cascade: 'all-delete-orphan'
    }

    /**
     * Checks if the 2-hour hold period has lapsed
     */
    boolean isHoldExpired() {
        if (bookingStatus == 'HELD' && holdExpiresAt) {
            return new Date().after(holdExpiresAt)
        }
        return false
    }
}`,
  },
  {
    path: 'grails-app/domain/com/flyeclipse/FlightSchedule.groovy',
    name: 'FlightSchedule.groovy',
    category: 'DOMAIN',
    description: 'Master flight timetable for Jersey, Alderney, Guernsey, and Bournemouth routes.',
    content: `package com.flyeclipse

import groovy.transform.ToString

/**
 * FlyEclipse Flight Schedule Domain Class
 * Covers regular Island routes (Jersey, Alderney, Guernsey, Bournemouth)
 * and ad-hoc Chartered routes.
 */
@ToString(includes = ['flightNumber', 'departureAirport', 'arrivalAirport', 'scheduledDepartureTime', 'status'], includeNames = true)
class FlightSchedule implements Serializable {

    String flightNumber             // e.g. FE-101, FE-102
    String departureAirport         // JER, ACI, GCI, BOH, or charter LON
    String arrivalAirport           // JER, ACI, GCI, BOH
    String viaAirport               // Optional transit hub (e.g. Alderney or Jersey)
    Date flightDate
    String scheduledDepartureTime   // HH:mm (e.g. "07:30", "10:00")
    String scheduledArrivalTime     // HH:mm (e.g. "08:15", "10:45")
    String estimatedDurationMinutes // "30 mins", "45 mins"
    String status                   // ON_TIME, BOARDING, DELAYED, IN_FLIGHT, LANDED, CANCELLED
    String statusRemark             // Reason for delay / weather notice
    BigDecimal baseFareP1           // 1500.00 base charter/P1 rate
    Boolean isCharter = false
    
    Aircraft aircraft
    Pilot pilotInCommand
    Pilot firstOfficer

    String tenantId                 // Discriminator column for multi-tenancy

    static hasMany = [bookings: Booking]

    static constraints = {
        flightNumber blank: false, size: 4..12
        departureAirport inList: ['JER', 'ACI', 'GCI', 'BOH', 'BQH', 'LCY', 'LGW']
        arrivalAirport inList: ['JER', 'ACI', 'GCI', 'BOH', 'BQH', 'LCY', 'LGW']
        viaAirport nullable: true, inList: ['JER', 'ACI', 'GCI', 'BOH']
        flightDate nullable: false
        scheduledDepartureTime matches: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
        scheduledArrivalTime matches: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
        status inList: ['ON_TIME', 'BOARDING', 'DELAYED', 'IN_FLIGHT', 'LANDED', 'CANCELLED']
        statusRemark nullable: true, maxSize: 500
        baseFareP1 min: 0.0G
        pilotInCommand nullable: true
        firstOfficer nullable: true
        tenantId blank: false
    }

    static mapping = {
        table 'flight_schedule'
        version true
        tenantId column: 'tenant_id', index: 'idx_flight_sched_tenant'
        bookings cascade: 'all-delete-orphan'
    }
}`,
  },
  {
    path: 'grails-app/domain/com/flyeclipse/Pet.groovy',
    name: 'Pet.groovy',
    category: 'DOMAIN',
    description: 'Pet passenger domain covering breed, weight, vet cert, and Cessna climate crate bays.',
    content: `package com.flyeclipse

/**
 * FlyEclipse Pet Passenger Domain
 * FlyEclipse allows pets (dogs, cats) to travel comfortably in Cessna Caravan
 * with dedicated climate-controlled crate bays or under-seat tethers.
 */
class Pet implements Serializable {

    String petName
    String petType              // DOG, CAT, OTHER
    String breed
    BigDecimal weightKg
    String microchipNumber
    String vetCertificateNumber
    Date rabiesVaccinationDate
    Boolean crateRequired = true
    String assignedZone         // CRATE_BAY_1, CRATE_BAY_2, UNDER_SEAT
    
    Passenger companionPassenger
    Booking booking
    String tenantId

    static constraints = {
        petName blank: false, size: 2..40
        petType inList: ['DOG', 'CAT', 'BIRD', 'OTHER']
        breed blank: false
        weightKg min: 0.5G, max: 50.0G
        microchipNumber nullable: true
        vetCertificateNumber blank: false
        rabiesVaccinationDate nullable: false
        assignedZone inList: ['CRATE_BAY_1', 'CRATE_BAY_2', 'UNDER_SEAT']
        companionPassenger nullable: true
        booking nullable: false
        tenantId blank: false
    }

    static mapping = {
        table 'pet'
        version true
        tenantId column: 'tenant_id', index: 'idx_pet_tenant'
    }
}`,
  },
  {
    path: 'grails-app/domain/com/flyeclipse/Ticket.groovy',
    name: 'Ticket.groovy',
    category: 'DOMAIN',
    description: 'Ticket domain with QR payload, Code128 sequence, and OpenPDF boarding pass generation hooks.',
    content: `package com.flyeclipse

/**
 * FlyEclipse Ticket and Boarding Pass Domain
 * Formatted for OpenPDF/LibrePDF generation, includes QR code payload
 * and Code128 barcode number.
 */
class Ticket implements Serializable {

    String ticketNumber         // TK-XXXXXXXX
    String pnr
    Passenger passenger
    Booking booking
    FlightSchedule flightSchedule
    String seatNumber
    String qrPayload            // Encrypted base64 QR payload for gate scanner
    String barcodeNumber        // 12-digit Code128 sequence
    Boolean checkedIn = false
    Date checkedInAt
    String gateAssignment = "GATE 1"
    String baggageTagId
    String tenantId

    static constraints = {
        ticketNumber unique: true, blank: false
        pnr blank: false
        passenger nullable: false
        booking nullable: false
        flightSchedule nullable: false
        seatNumber blank: false
        qrPayload blank: false
        barcodeNumber blank: false
        checkedInAt nullable: true
        baggageTagId nullable: true
        tenantId blank: false
    }

    static mapping = {
        table 'ticket'
        version true
        tenantId column: 'tenant_id', index: 'idx_ticket_tenant'
    }
}`,
  },
  {
    path: 'grails-app/domain/com/flyeclipse/AccessLog.groovy',
    name: 'AccessLog.groovy',
    category: 'DOMAIN',
    description: 'Audit log table for signup, signin, signout, CRUD, bookings, holds, and refunds.',
    content: `package com.flyeclipse

/**
 * AccessLog / AuditLog Domain
 * In every signup, signin, signout, booking, check-in, cancel, refund,
 * logs are stored with actor, IP, timestamp and tenant isolation.
 */
class AccessLog implements Serializable {

    Date timestamp = new Date()
    String eventType    // SIGNUP, SIGNIN, SIGNOUT, MFA_VERIFIED, BOOKING_CREATED, SEAT_HELD_2H, PAYMENT_COMPLETED, CHECK_IN, CANCEL_BOOKING, REFUND_MONEY, ENTITY_CRUD
    String actorUsername
    String actorRole
    String ipAddress
    String userAgent
    String entityName   // Booking, FlightSchedule, User, Aircraft, etc.
    String entityId
    String message
    String tenantId

    static constraints = {
        timestamp nullable: false
        eventType inList: [
            'SIGNUP', 'SIGNIN', 'SIGNOUT', 'MFA_VERIFIED', 
            'BOOKING_CREATED', 'SEAT_HELD_2H', 'PAYMENT_COMPLETED', 
            'CHECK_IN', 'CANCEL_BOOKING', 'REFUND_MONEY', 'ENTITY_CRUD'
        ]
        actorUsername blank: false
        actorRole blank: false
        ipAddress nullable: true
        userAgent nullable: true, maxSize: 500
        entityName nullable: true
        entityId nullable: true
        message maxSize: 2000
        tenantId blank: false
    }

    static mapping = {
        table 'access_log'
        version false
        tenantId column: 'tenant_id', index: 'idx_access_log_tenant'
        timestamp index: 'idx_log_timestamp'
    }
}`,
  },
  {
    path: 'grails-app/services/com/flyeclipse/BookingService.groovy',
    name: 'BookingService.groovy',
    category: 'SERVICE',
    description: 'Service implementing exact price matrix, 2-hour hold release, and Stripe integration.',
    content: `package com.flyeclipse

import grails.gorm.transactions.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * FlyEclipse Core Booking & Price Matrix Engine
 * Groovy & Grails Service with Spring Security & Transaction support
 */
@Transactional
class BookingService {

    StripePaymentService stripePaymentService
    PdfTicketService pdfTicketService
    MailGunEmailService mailGunEmailService
    AuditLogService auditLogService

    /**
     * Exact Ticket Pricing Matrix as per FlyEclipse specifications:
     * Passengers | P1   | P2  | P3  | P4  | P5  | P6
     * 1          | 1500 | -   | -   | -   | -   | -
     * 2          | 825  | 975 | -   | -   | -   | -
     * 3          | 675  | 825 | 975 | -   | -   | -
     * 4          | 525  | 675 | 825 | 975 | -   | -
     * 5          | 375  | 525 | 675 | 825 | 975 | -
     * 6          | 225  | 375 | 525 | 675 | 825 | 975
     */
    static final Map<Integer, List<BigDecimal>> PRICING_MATRIX = [
        1: [1500.00G],
        2: [825.00G, 975.00G],
        3: [675.00G, 825.00G, 975.00G],
        4: [525.00G, 675.00G, 825.00G, 975.00G],
        5: [375.00G, 525.00G, 675.00G, 825.00G, 975.00G],
        6: [225.00G, 375.00G, 525.00G, 675.00G, 825.00G, 975.00G]
    ]

    /**
     * Calculates total fare for a given passenger count and breakdown
     */
    BigDecimal calculateTotalFare(int passengerCount) {
        if (passengerCount <= 0) return 0.00G
        int effectiveCount = Math.min(passengerCount, 6)
        List<BigDecimal> rates = PRICING_MATRIX[effectiveCount] ?: [1500.00G]
        return rates.sum() as BigDecimal
    }

    /**
     * Creates a 2-hour held booking before payment is settled
     */
    Booking createHeldBooking(FlightSchedule schedule, User user, List<Passenger> passengers, List<Pet> pets, String tenantId) {
        Date now = new Date()
        Date holdExpiresAt = Date.from(Instant.now().plus(2, ChronoUnit.HOURS))
        
        String ref = "FE-BK-" + (1000 + new Random().nextInt(9000))
        String pnr = generatePNR()

        BigDecimal totalFare = calculateTotalFare(passengers.size())

        Booking booking = new Booking(
            bookingReference: ref,
            pnr: pnr,
            flightSchedule: schedule,
            bookedBy: user,
            leadPassengerName: "\${passengers[0].firstName} \${passengers[0].lastName}",
            bookingStatus: 'HELD',
            paymentStatus: 'PENDING',
            bookingTime: now,
            holdExpiresAt: holdExpiresAt,
            totalFare: totalFare,
            tenantId: tenantId
        )

        booking.save(flush: true, failOnError: true)

        passengers.each { p ->
            p.booking = booking
            p.tenantId = tenantId
            p.save(flush: true)
        }

        pets.each { pet ->
            pet.booking = booking
            pet.tenantId = tenantId
            pet.save(flush: true)
        }

        auditLogService.logEvent(
            'SEAT_HELD_2H', 
            user.username, 
            user.authorities?.first()?.authority ?: 'ROLE_USER',
            "Booking \${booking.pnr} held for 2 hours (until \${holdExpiresAt})",
            'Booking',
            booking.id.toString(),
            tenantId
        )

        return booking
    }

    /**
     * Confirms booking and generates OpenPDF tickets after Stripe payment success
     */
    Booking confirmAndPayBooking(Booking booking, String stripePaymentToken, String tenantId) {
        if (booking.isHoldExpired()) {
            throw new IllegalStateException("Hold has expired after 2 hours. Seats have been released.")
        }

        // Process Stripe Charge
        Map chargeResult = stripePaymentService.chargeCustomer(
            booking.totalFare, 
            "GBP", 
            stripePaymentToken, 
            "FlyEclipse Flight \${booking.flightSchedule.flightNumber} - PNR \${booking.pnr}"
        )

        booking.paymentStatus = 'PAID'
        booking.bookingStatus = 'CONFIRMED'
        booking.stripePaymentIntentId = chargeResult.paymentIntentId
        booking.stripeChargeId = chargeResult.chargeId
        booking.save(flush: true)

        // Generate tickets with Barcodes and QR Codes via OpenPDF
        booking.passengers.each { passenger ->
            Ticket ticket = new Ticket(
                ticketNumber: "TK-" + System.currentTimeMillis().toString().takeRight(8),
                pnr: booking.pnr,
                passenger: passenger,
                booking: booking,
                flightSchedule: booking.flightSchedule,
                seatNumber: passenger.assignedSeatNumber ?: "1A",
                qrPayload: "FLYECLIPSE:\${booking.pnr}:\${passenger.passportNumber}:\${passenger.assignedSeatNumber}",
                barcodeNumber: "FE" + (1000000000L + new Random().nextInt(900000000)),
                tenantId: tenantId
            )
            ticket.save(flush: true)
        }

        // Email tickets via MailGun
        mailGunEmailService.sendBookingConfirmation(booking)

        auditLogService.logEvent(
            'PAYMENT_COMPLETED',
            booking.bookedBy.username,
            'INDIVIDUAL_USER',
            "Stripe payment of £\${booking.totalFare} verified for PNR \${booking.pnr}. Tickets generated.",
            'Booking',
            booking.id.toString(),
            tenantId
        )

        return booking
    }

    /**
     * Automatic cleaner to release expired holds (Called every 5 minutes by Quartz Scheduler)
     */
    void releaseExpiredHolds(String tenantId) {
        List<Booking> expiredBookings = Booking.findAllByBookingStatusAndHoldExpiresAtLessThan(
            'HELD', 
            new Date()
        )
        expiredBookings.each { booking ->
            booking.bookingStatus = 'CANCELLED'
            booking.save(flush: true)
            auditLogService.logEvent(
                'BOOKING_CANCELLED',
                'SYSTEM_QUARTZ',
                'SYSTEM',
                "Expired 2-hour hold auto-released for PNR \${booking.pnr}",
                'Booking',
                booking.id.toString(),
                tenantId
            )
        }
    }

    private String generatePNR() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        (1..6).collect { chars[new Random().nextInt(chars.length())] }.join()
    }
}`,
  },
  {
    path: 'grails-app/conf/application.yml',
    name: 'application.yml',
    category: 'CONFIG',
    description: 'Grails configuration for single-database multi-tenancy discriminator and Spring Security.',
    content: `dataSource:
    pooled: true
    jmxExport: true
    driverClassName: com.mysql.cj.jdbc.Driver
    username: flyeclipse_admin
    password: \${MYSQL_PASSWORD:secret}
    dialect: org.hibernate.dialect.MySQL8Dialect

environments:
    development:
        dataSource:
            dbCreate: update
            url: jdbc:mysql://localhost:3306/flyeclipse_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Europe/London
    production:
        dataSource:
            dbCreate: none
            url: jdbc:mysql://\${MYSQL_HOST:127.0.0.1}:3306/flyeclipse_db?useSSL=true&serverTimezone=Europe/London

grails:
    gorm:
        multiTenancy:
            mode: DISCRIMINATOR
            tenantId: tenant_id
    plugin:
        springsecurity:
            userLookup:
                userDomainClassName: 'com.flyeclipse.User'
                authorityJoinClassName: 'com.flyeclipse.UserRole'
            authority:
                className: 'com.flyeclipse.Role'
            securityConfigType: "InterceptUrlMap"
            interceptUrlMap:
                - pattern: '/'
                  access: ['permitAll']
                - pattern: '/passenger/**'
                  access: ['permitAll']
                - pattern: '/booking/search'
                  access: ['permitAll']
                - pattern: '/admin/**'
                  access: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_TENANT_ADMIN']
                - pattern: '/api/dispatch/**'
                  access: ['ROLE_TENANT_ADMIN', 'ROLE_SUPER_ADMIN']
                - pattern: '/**'
                  access: ['IS_AUTHENTICATED_REMEMBERED']`,
  },
];

export const GrailsCodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<GrailsFile>(GRAILS_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="grails-code-explorer" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6d3cc7]">
              Apache Tomcat & GORM Source Code
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6d3cc7] font-mono font-bold border border-purple-200">
              Groovy 3.0 / Grails 5.3+
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            FlyEclipse Groovy & Grails Backend Codebase
          </h2>
          <p className="text-xs text-slate-500">
            Complete GORM domain models, Single-Database Discriminator Multi-Tenancy, OpenPDF tickets, and Spring Security ACL.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2.5 rounded-2xl bg-[#6d3cc7] hover:bg-[#5426a5] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Groovy Source!' : 'Copy Groovy File'}</span>
        </button>
      </div>

      {/* Explorer Grid */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* File Tree Sidebar */}
        <div className="lg:col-span-4 bg-slate-900/90 border-r border-slate-800 p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-slate-800 pb-3">
            <Folder className="w-4 h-4 text-[#a882f7]" />
            <span>grails-app/ Source Tree</span>
          </div>

          <div className="space-y-1">
            {GRAILS_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                  selectedFile.path === file.path
                    ? 'bg-[#6d3cc7] text-white font-bold shadow'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                <div className="truncate">
                  <span className="block truncate font-mono text-[11px]">{file.name}</span>
                  <span className="text-[10px] opacity-75 truncate block">
                    {file.category} • {file.description.slice(0, 38)}...
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-200 block">Architecture Directives:</span>
            <p>• Multi-Tenancy: Discriminator column <code className="text-[#a882f7]">tenant_id</code>.</p>
            <p>• Payment: Stripe REST charge endpoint.</p>
            <p>• PDF Engine: OpenPDF with Code128 and 2D QR.</p>
            <p>• Logging: Event audit logging on DB triggers.</p>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950">
          {/* Top file breadcrumb */}
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-purple-300">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>{selectedFile.path}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
              {selectedFile.category}
            </span>
          </div>

          {/* Description banner */}
          <div className="px-6 py-2.5 bg-slate-900/30 border-b border-slate-800/60 text-xs text-slate-400">
            {selectedFile.description}
          </div>

          {/* Code Viewer */}
          <div className="p-6 overflow-x-auto flex-1 font-mono text-xs text-slate-200 leading-relaxed">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
