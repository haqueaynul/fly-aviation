package com.flyeclipse

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
    String tenantId             // Multi-tenancy discriminator

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
}
