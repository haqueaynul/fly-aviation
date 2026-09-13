package com.flyeclipse

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
}
