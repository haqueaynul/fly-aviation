package com.flyeclipse

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
}
