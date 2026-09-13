package com.flyeclipse

class Passenger implements Serializable {

    String title            // MR, MRS, MS, DR, CAPT
    String firstName
    String lastName
    String passengerType    // ADULT, CHILD, PET_HANDLER
    Date dateOfBirth
    String passportNumber
    String passportCountry
    Date passportExpiryDate
    String mobileNumber
    String emailAddress
    String assignedSeatNumber // 1A, 1B, 2A, 2B, 3A, 3B, etc.
    Boolean isLeadPassenger = false

    Booking booking
    String tenantId

    static constraints = {
        title inList: ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Capt', 'Master']
        firstName blank: false, size: 2..50
        lastName blank: false, size: 2..50
        passengerType inList: ['ADULT', 'CHILD', 'PET_HANDLER']
        dateOfBirth nullable: false
        passportNumber blank: false, size: 6..20
        passportCountry blank: false, size: 2..3
        passportExpiryDate nullable: true
        mobileNumber nullable: true
        emailAddress nullable: true, email: true
        assignedSeatNumber nullable: true, matches: '^[1-4][A-C]$'
        booking nullable: false
        tenantId blank: false
    }

    static mapping = {
        table 'passenger'
        version true
        tenantId column: 'tenant_id', index: 'idx_passenger_tenant'
    }
}
