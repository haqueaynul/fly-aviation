package com.flyeclipse

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
}
