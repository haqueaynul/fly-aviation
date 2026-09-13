package com.flyeclipse

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
}
