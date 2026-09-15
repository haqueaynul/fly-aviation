import { RegularFlight } from '../types';

/**
 * Format a Date object to YYYY-MM-DD in UTC/local consistent manner
 */
export function formatToYmd(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add or subtract days to a YYYY-MM-DD date string
 */
export function addDaysToDate(dateStr: string, daysToAdd: number): string {
  const parts = dateStr.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return formatToYmd(d);
  }
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + daysToAdd);
  return formatToYmd(date);
}

/**
 * Metadata for a calendar day in the 5-day schedule view
 */
export interface ScheduleDayMeta {
  date: string; // 'YYYY-MM-DD'
  offset: number; // -1, 0, 1, 2, 3, 4
  isDepartureDate: boolean;
  dayOfWeekShort: string; // 'Sun', 'Mon'
  dayOfWeekFull: string; // 'Sunday', 'Monday'
  formattedDate: string; // '14 Sep'
  formattedFull: string; // 'Mon, 14 Sep 2026'
  label?: string; // '1 Day Back', 'Departure Date', '1 Day Forward', etc.
}

/**
 * Returns the calendar days spanning from 1 day back to 4 days forward from departureDate
 */
export function get5DayScheduleWindow(departureDateStr: string): ScheduleDayMeta[] {
  // Offsets: -1 (1 day back), 0 (departure date), 1, 2, 3, 4 (4 days forward)
  const offsets = [-1, 0, 1, 2, 3, 4];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return offsets.map((offset) => {
    const targetDate = addDaysToDate(departureDateStr, offset);
    const parts = targetDate.split('-').map((p) => parseInt(p, 10));
    const dObj = new Date(parts[0], parts[1] - 1, parts[2]);

    const dayNameFull = daysOfWeek[dObj.getDay()] || 'Day';
    const dayNameShort = dayNameFull.slice(0, 3);
    const monthShort = months[dObj.getMonth()] || '';
    const dayNum = parts[2];

    let label: string | undefined;
    if (offset === -1) label = '1 Day Back';
    else if (offset === 0) label = 'Departure Date';
    else if (offset === 1) label = '+1 Day';
    else if (offset === 2) label = '+2 Days';
    else if (offset === 3) label = '+3 Days';
    else if (offset === 4) label = '+4 Days Forward';

    return {
      date: targetDate,
      offset,
      isDepartureDate: offset === 0,
      dayOfWeekShort: dayNameShort,
      dayOfWeekFull: dayNameFull,
      formattedDate: `${dayNum} ${monthShort}`,
      formattedFull: `${dayNameShort}, ${dayNum} ${monthShort} ${parts[0]}`,
      label,
    };
  });
}

/**
 * Deterministic pseudo-random seed based on string (to ensure consistent booked seat counts for mock days)
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Retrieve or generate scheduled flights for a given route and date
 */
export function getFlightsForRouteAndDate(
  fromCode: string,
  toCode: string,
  targetDate: string,
  allSchedules: RegularFlight[]
): RegularFlight[] {
  // 1. Direct match on route AND date
  const directMatches = allSchedules.filter(
    (f) => f.fromCode === fromCode && f.toCode === toCode && f.date === targetDate
  );
  if (directMatches.length > 0) {
    return directMatches;
  }

  // 2. Matching route template from allSchedules (ignoring date)
  const routeTemplates = allSchedules.filter(
    (f) => f.fromCode === fromCode && f.toCode === toCode
  );

  if (routeTemplates.length > 0) {
    // Clone and adapt for targetDate with consistent realistic seat availability
    return routeTemplates.map((template, idx) => {
      const seed = hashString(`${targetDate}-${template.flightNumber}-${idx}`);
      const freeSeats = 4 + (seed % 4); // 4 to 7 free seats
      const bookedCount = 8 - freeSeats;
      const allSeatIds = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B'];
      const reserved = allSeatIds.slice(0, bookedCount);

      return {
        ...template,
        id: `${template.id}-${targetDate}`,
        date: targetDate,
        availableSeatsCount: freeSeats,
        reservedSeats: reserved,
        bookedSeats: [],
      };
    });
  }

  // 3. Fallback: synthesize standard Cessna 208B commuter flights between the two airports
  const seed = hashString(`${fromCode}-${toCode}-${targetDate}`);
  const flightNum1 = `FE-${(seed % 300) + 101}`;
  const flightNum2 = `FE-${(seed % 300) + 201}`;

  return [
    {
      id: `${flightNum1}-${targetDate}`,
      flightNumber: flightNum1,
      departureTime: '08:30',
      arrivalTime: '09:05',
      fromCode,
      toCode,
      aircraftRegistration: seed % 2 === 0 ? 'G-ECLP' : 'G-ECLS',
      pilotId: 'PLT-01',
      status: 'ON_TIME',
      date: targetDate,
      availableSeatsCount: 6,
      bookedSeats: [],
      reservedSeats: ['1A', '2B'],
    },
    {
      id: `${flightNum2}-${targetDate}`,
      flightNumber: flightNum2,
      departureTime: '14:30',
      arrivalTime: '15:05',
      fromCode,
      toCode,
      aircraftRegistration: seed % 2 === 0 ? 'G-ECLS' : 'G-ECLP',
      pilotId: 'PLT-02',
      status: 'ON_TIME',
      date: targetDate,
      availableSeatsCount: 5,
      bookedSeats: [],
      reservedSeats: ['1B', '3A', '4A'],
    },
  ];
}

/**
 * Calculate human-readable flight duration (Flight Time) between departureTime and arrivalTime (e.g. '35 mins')
 */
export function calculateFlightDuration(departureTime: string, arrivalTime: string): string {
  if (!departureTime || !arrivalTime) return '35 mins';
  const [depH, depM] = departureTime.split(':').map((v) => parseInt(v, 10));
  const [arrH, arrM] = arrivalTime.split(':').map((v) => parseInt(v, 10));
  if (isNaN(depH) || isNaN(depM) || isNaN(arrH) || isNaN(arrM)) return '35 mins';

  let totalMinutes = arrH * 60 + arrM - (depH * 60 + depM);
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Crosses midnight
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h 00m`;
  }
  return `${minutes} mins`;
}
