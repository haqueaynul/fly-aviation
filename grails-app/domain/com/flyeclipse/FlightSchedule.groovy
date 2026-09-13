package com.flyeclipse

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
}
