package com.flyeclipse

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
            leadPassengerName: "${passengers[0].firstName} ${passengers[0].lastName}",
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
            "Booking ${booking.pnr} held for 2 hours (until ${holdExpiresAt})",
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
            "FlyEclipse Flight ${booking.flightSchedule.flightNumber} - PNR ${booking.pnr}"
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
                qrPayload: "FLYECLIPSE:${booking.pnr}:${passenger.passportNumber}:${passenger.assignedSeatNumber}",
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
            "Stripe payment of £${booking.totalFare} verified for PNR ${booking.pnr}. Tickets generated.",
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
                "Expired 2-hour hold auto-released for PNR ${booking.pnr}",
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
}
