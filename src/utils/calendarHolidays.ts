import type { CalendarHoliday, HolidayCountryCode, ResolvedCountryCode } from '../types';

export interface CountryMetadata {
  code: ResolvedCountryCode;
  name: string;
  shortName: string;
  flagText: string;
}

export const SUPPORTED_HOLIDAY_COUNTRIES: CountryMetadata[] = [
  { code: 'IN', name: 'India', shortName: 'India (IN)', flagText: 'IN' },
  { code: 'US', name: 'United States', shortName: 'USA (US)', flagText: 'US' },
  { code: 'GB', name: 'United Kingdom', shortName: 'UK (GB)', flagText: 'UK' },
  { code: 'CA', name: 'Canada', shortName: 'Canada (CA)', flagText: 'CA' },
  { code: 'AU', name: 'Australia', shortName: 'Australia (AU)', flagText: 'AU' },
  { code: 'SG', name: 'Singapore', shortName: 'Singapore (SG)', flagText: 'SG' },
  { code: 'AE', name: 'United Arab Emirates', shortName: 'UAE (AE)', flagText: 'AE' },
];

export const COUNTRY_META_MAP: Record<ResolvedCountryCode, CountryMetadata> = {
  IN: SUPPORTED_HOLIDAY_COUNTRIES[0],
  US: SUPPORTED_HOLIDAY_COUNTRIES[1],
  GB: SUPPORTED_HOLIDAY_COUNTRIES[2],
  CA: SUPPORTED_HOLIDAY_COUNTRIES[3],
  AU: SUPPORTED_HOLIDAY_COUNTRIES[4],
  SG: SUPPORTED_HOLIDAY_COUNTRIES[5],
  AE: SUPPORTED_HOLIDAY_COUNTRIES[6],
};

export interface DetectedRegionInfo {
  country: ResolvedCountryCode;
  countryName: string;
  timezone: string;
  locale: string;
}

const TIMEZONE_TO_COUNTRY_PREFIX: Array<{ match: RegExp; country: ResolvedCountryCode }> = [
  { match: /^Asia\/(Kolkata|Calcutta)$/i, country: 'IN' },
  { match: /^Asia\/Singapore$/i, country: 'SG' },
  { match: /^Asia\/Dubai$/i, country: 'AE' },
  { match: /^Europe\/London$/i, country: 'GB' },
  { match: /^Australia\//i, country: 'AU' },
  { match: /^America\/(Toronto|Vancouver|Montreal|Edmonton|Winnipeg|Halifax|St_Johns)/i, country: 'CA' },
  { match: /^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit)/i, country: 'US' },
  { match: /^Pacific\/Honolulu$/i, country: 'US' },
];

export function detectDeviceRegion(
  timezoneOverride?: string,
  localeOverride?: string
): DetectedRegionInfo {
  let timezone = timezoneOverride || '';
  let locale = localeOverride || '';

  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions();
    if (!timezone) timezone = resolved.timeZone || 'UTC';
    if (!locale) locale = resolved.locale || 'en-IN';
  } catch {
    timezone = timezone || 'UTC';
    locale = locale || 'en-IN';
  }

  // Check web navigator language if available and override not provided
  if (!localeOverride && typeof navigator !== 'undefined' && navigator.language) {
    locale = navigator.language;
  }

  // 1. Timezone takes highest priority because device location sets timezone accurately
  for (const rule of TIMEZONE_TO_COUNTRY_PREFIX) {
    if (rule.match.test(timezone)) {
      return {
        country: rule.country,
        countryName: COUNTRY_META_MAP[rule.country].name,
        timezone,
        locale,
      };
    }
  }

  // 2. Fallback to region subtag in locale (e.g. en-IN, en-US, en-GB)
  const regionMatch = locale.match(/[-_]([A-Za-z]{2})\b/);
  if (regionMatch) {
    const tag = regionMatch[1].toUpperCase();
    const mapped = tag === 'UK' ? 'GB' : tag;
    if (mapped in COUNTRY_META_MAP) {
      const code = mapped as ResolvedCountryCode;
      return {
        country: code,
        countryName: COUNTRY_META_MAP[code].name,
        timezone,
        locale,
      };
    }
  }

  // 3. Default academic profile fallback (India)
  return {
    country: 'IN',
    countryName: COUNTRY_META_MAP.IN.name,
    timezone: timezone || 'Asia/Kolkata',
    locale: locale || 'en-IN',
  };
}

export function resolveActiveCountry(
  selected: HolidayCountryCode,
  timezoneOverride?: string,
  localeOverride?: string
): { country: ResolvedCountryCode; isAuto: boolean; detected: DetectedRegionInfo } {
  const detected = detectDeviceRegion(timezoneOverride, localeOverride);
  if (selected === 'AUTO') {
    return { country: detected.country, isAuto: true, detected };
  }
  return { country: selected, isAuto: false, detected };
}

export function toIsoDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatLiveClock(now: Date): string {
  return now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function formatLiveDateBanner(now: Date): string {
  return now.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function computeDaysRemaining(targetIso: string, now: Date = new Date()): number {
  const [y, m, d] = targetIso.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return 0;
  const targetUtc = Date.UTC(y, m - 1, d);
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((targetUtc - todayUtc) / 86400000));
}

function makeFixedHolidaysForYears(
  years: number[],
  country: ResolvedCountryCode,
  defs: Array<{ mmdd: string; name: string; category: CalendarHoliday['category']; note?: string }>
): CalendarHoliday[] {
  const out: CalendarHoliday[] = [];
  for (const year of years) {
    for (const def of defs) {
      const date = `${year}-${def.mmdd}`;
      out.push({
        id: `hol_${country}_${date}_${def.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
        date,
        name: def.name,
        country,
        category: def.category,
        note: def.note,
      });
    }
  }
  return out;
}

const SUPPORTED_YEARS = [2025, 2026, 2027, 2028];

const STATIC_HOLIDAY_DB: Record<ResolvedCountryCode, CalendarHoliday[]> = {
  IN: [
    ...makeFixedHolidaysForYears(SUPPORTED_YEARS, 'IN', [
      { mmdd: '01-01', name: "New Year's Day", category: 'observance' },
      { mmdd: '01-26', name: 'Republic Day', category: 'public', note: 'National Gazetted Holiday (India)' },
      { mmdd: '02-28', name: 'National Science Day', category: 'academic', note: 'Raman Effect commemoration · Great day for Physics revision' },
      { mmdd: '03-14', name: 'Pi (π) Approximation Day', category: 'academic' },
      { mmdd: '05-01', name: 'Maharashtra / Labour Day', category: 'observance' },
      { mmdd: '08-15', name: 'Independence Day', category: 'public', note: 'National Gazetted Holiday (India)' },
      { mmdd: '09-05', name: "Teachers' Day", category: 'academic', note: 'Dr. S. Radhakrishnan Birth Anniversary' },
      { mmdd: '10-02', name: 'Gandhi Jayanti', category: 'public', note: 'National Gazetted Holiday (India)' },
      { mmdd: '11-14', name: "Children's Day", category: 'academic' },
      { mmdd: '12-22', name: 'National Mathematics Day', category: 'academic', note: 'Srinivasa Ramanujan Birth Anniversary' },
      { mmdd: '12-25', name: 'Christmas Day', category: 'public' },
    ]),
    // Variable lunar/lunisolar Indian holidays 2025–2028
    { id: 'in_2026_holi', date: '2026-03-04', name: 'Holi (Dhulandi)', country: 'IN', category: 'public' },
    { id: 'in_2026_eid_fitr', date: '2026-03-21', name: 'Eid-ul-Fitr', country: 'IN', category: 'public' },
    { id: 'in_2026_ram_navami', date: '2026-03-26', name: 'Ram Navami', country: 'IN', category: 'public' },
    { id: 'in_2026_good_fri', date: '2026-04-03', name: 'Good Friday', country: 'IN', category: 'public' },
    { id: 'in_2026_eid_adha', date: '2026-05-27', name: 'Eid al-Adha (Bakrid)', country: 'IN', category: 'public' },
    { id: 'in_2026_rakhi', date: '2026-08-28', name: 'Raksha Bandhan', country: 'IN', category: 'observance' },
    { id: 'in_2026_janmashtami', date: '2026-09-04', name: 'Janmashtami', country: 'IN', category: 'public' },
    { id: 'in_2026_ganesh', date: '2026-09-14', name: 'Ganesh Chaturthi', country: 'IN', category: 'observance' },
    { id: 'in_2026_dussehra', date: '2026-10-20', name: 'Dussehra (Vijayadashami)', country: 'IN', category: 'public' },
    { id: 'in_2026_diwali', date: '2026-11-08', name: 'Diwali (Deepavali)', country: 'IN', category: 'public', note: 'Festival of Lights · National Public Holiday' },
    { id: 'in_2026_govardhan', date: '2026-11-09', name: 'Govardhan Puja / Vikram New Year', country: 'IN', category: 'observance' },
    { id: 'in_2026_bhai_dooj', date: '2026-11-11', name: 'Bhai Dooj', country: 'IN', category: 'observance', note: 'Study light / revision sprint recommended' },
    { id: 'in_2026_nanak', date: '2026-11-24', name: 'Guru Nanak Jayanti', country: 'IN', category: 'public' },
    // 2027
    { id: 'in_2027_pongal', date: '2027-01-14', name: 'Makar Sankranti / Pongal', country: 'IN', category: 'observance' },
    { id: 'in_2027_holi', date: '2027-03-22', name: 'Holi', country: 'IN', category: 'public' },
    { id: 'in_2027_good_fri', date: '2027-03-26', name: 'Good Friday', country: 'IN', category: 'public' },
    { id: 'in_2027_eid_fitr', date: '2027-03-10', name: 'Eid-ul-Fitr', country: 'IN', category: 'public' },
    { id: 'in_2027_dussehra', date: '2027-10-09', name: 'Dussehra (Vijayadashami)', country: 'IN', category: 'public' },
    { id: 'in_2027_diwali', date: '2027-10-29', name: 'Diwali (Deepavali)', country: 'IN', category: 'public' },
    { id: 'in_2027_nanak', date: '2027-11-14', name: 'Guru Nanak Jayanti', country: 'IN', category: 'public' },
  ],
  US: [
    ...makeFixedHolidaysForYears(SUPPORTED_YEARS, 'US', [
      { mmdd: '01-01', name: "New Year's Day", category: 'public' },
      { mmdd: '03-14', name: 'Pi (π) Day', category: 'academic' },
      { mmdd: '06-19', name: 'Juneteenth National Independence Day', category: 'public' },
      { mmdd: '07-04', name: 'Independence Day', category: 'public' },
      { mmdd: '11-11', name: 'Veterans Day', category: 'public' },
      { mmdd: '12-25', name: 'Christmas Day', category: 'public' },
    ]),
    { id: 'us_2026_mlk', date: '2026-01-19', name: 'Martin Luther King Jr. Day', country: 'US', category: 'public' },
    { id: 'us_2026_pres', date: '2026-02-16', name: "Presidents' Day", country: 'US', category: 'public' },
    { id: 'us_2026_memorial', date: '2026-05-25', name: 'Memorial Day', country: 'US', category: 'public' },
    { id: 'us_2026_labor', date: '2026-09-07', name: 'Labor Day', country: 'US', category: 'public' },
    { id: 'us_2026_thanksgiving', date: '2026-11-26', name: 'Thanksgiving Day', country: 'US', category: 'public' },
    { id: 'us_2027_mlk', date: '2027-01-18', name: 'Martin Luther King Jr. Day', country: 'US', category: 'public' },
    { id: 'us_2027_memorial', date: '2027-05-31', name: 'Memorial Day', country: 'US', category: 'public' },
    { id: 'us_2027_labor', date: '2027-09-06', name: 'Labor Day', country: 'US', category: 'public' },
    { id: 'us_2027_thanksgiving', date: '2027-11-25', name: 'Thanksgiving Day', country: 'US', category: 'public' },
  ],
  GB: [
    ...makeFixedHolidaysForYears(SUPPORTED_YEARS, 'GB', [
      { mmdd: '01-01', name: "New Year's Day", category: 'public' },
      { mmdd: '03-14', name: 'Pi (π) Day', category: 'academic' },
      { mmdd: '12-25', name: 'Christmas Day', category: 'public' },
      { mmdd: '12-26', name: 'Boxing Day', category: 'public' },
    ]),
    { id: 'gb_2026_gf', date: '2026-04-03', name: 'Good Friday', country: 'GB', category: 'public' },
    { id: 'gb_2026_em', date: '2026-04-06', name: 'Easter Monday', country: 'GB', category: 'public' },
    { id: 'gb_2026_may1', date: '2026-05-04', name: 'Early May Bank Holiday', country: 'GB', category: 'public' },
    { id: 'gb_2026_spring', date: '2026-05-25', name: 'Spring Bank Holiday', country: 'GB', category: 'public' },
    { id: 'gb_2026_summer', date: '2026-08-31', name: 'Summer Bank Holiday', country: 'GB', category: 'public' },
    { id: 'gb_2027_gf', date: '2027-03-26', name: 'Good Friday', country: 'GB', category: 'public' },
    { id: 'gb_2027_em', date: '2027-03-29', name: 'Easter Monday', country: 'GB', category: 'public' },
    { id: 'gb_2027_summer', date: '2027-08-30', name: 'Summer Bank Holiday', country: 'GB', category: 'public' },
  ],
  CA: [
    ...makeFixedHolidaysForYears(SUPPORTED_YEARS, 'CA', [
      { mmdd: '01-01', name: "New Year's Day", category: 'public' },
      { mmdd: '07-01', name: 'Canada Day', category: 'public' },
      { mmdd: '09-30', name: 'Truth & Reconciliation Day', category: 'public' },
      { mmdd: '11-11', name: 'Remembrance Day', category: 'public' },
      { mmdd: '12-25', name: 'Christmas Day', category: 'public' },
    ]),
    { id: 'ca_2026_victoria', date: '2026-05-18', name: 'Victoria Day', country: 'CA', category: 'public' },
    { id: 'ca_2026_labour', date: '2026-09-07', name: 'Labour Day', country: 'CA', category: 'public' },
    { id: 'ca_2026_thanks', date: '2026-10-12', name: 'Thanksgiving (Canada)', country: 'CA', category: 'public' },
  ],
  AU: [
    ...makeFixedHolidaysForYears(SUPPORTED_YEARS, 'AU', [
      { mmdd: '01-01', name: "New Year's Day", category: 'public' },
      { mmdd: '01-26', name: 'Australia Day', category: 'public' },
      { mmdd: '04-25', name: 'ANZAC Day', category: 'public' },
      { mmdd: '12-25', name: 'Christmas Day', category: 'public' },
      { mmdd: '12-26', name: 'Boxing Day', category: 'public' },
    ]),
    { id: 'au_2026_kings', date: '2026-06-08', name: "King's Birthday", country: 'AU', category: 'public' },
  ],
  SG: [
    ...makeFixedHolidaysForYears(SUPPORTED_YEARS, 'SG', [
      { mmdd: '01-01', name: "New Year's Day", category: 'public' },
      { mmdd: '05-01', name: 'Labour Day', category: 'public' },
      { mmdd: '08-09', name: 'National Day (Singapore)', category: 'public' },
      { mmdd: '12-25', name: 'Christmas Day', category: 'public' },
    ]),
    { id: 'sg_2026_cny1', date: '2026-02-17', name: 'Chinese New Year', country: 'SG', category: 'public' },
    { id: 'sg_2026_deepavali', date: '2026-11-08', name: 'Deepavali', country: 'SG', category: 'public' },
    { id: 'sg_2026_hari_p', date: '2026-05-27', name: 'Hari Raya Haji', country: 'SG', category: 'public' },
  ],
  AE: [
    ...makeFixedHolidaysForYears(SUPPORTED_YEARS, 'AE', [
      { mmdd: '01-01', name: "New Year's Day", category: 'public' },
      { mmdd: '12-01', name: 'Commemoration Day', category: 'public' },
      { mmdd: '12-02', name: 'UAE National Day', category: 'public' },
    ]),
    { id: 'ae_2026_fitr', date: '2026-03-20', name: 'Eid Al Fitr', country: 'AE', category: 'public' },
    { id: 'ae_2026_arafat', date: '2026-05-26', name: 'Arafat Day', country: 'AE', category: 'public' },
    { id: 'ae_2026_adha', date: '2026-05-27', name: 'Eid Al Adha', country: 'AE', category: 'public' },
  ],
};

export function getHolidaysForCountryAndMonth(
  country: ResolvedCountryCode,
  year: number,
  monthIndex: number,
  remoteHolidays: CalendarHoliday[] = []
): CalendarHoliday[] {
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;
  const staticList = STATIC_HOLIDAY_DB[country] || [];
  const merged = new Map<string, CalendarHoliday>();

  for (const h of staticList) {
    if (h.date.startsWith(monthPrefix)) {
      merged.set(`${h.date}__${h.name.toLowerCase()}`, h);
    }
  }
  for (const rh of remoteHolidays) {
    if (rh.country === country && rh.date.startsWith(monthPrefix)) {
      merged.set(`${rh.date}__${rh.name.toLowerCase()}`, rh);
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getHolidaysForCountryAndYear(
  country: ResolvedCountryCode,
  year: number,
  remoteHolidays: CalendarHoliday[] = []
): CalendarHoliday[] {
  const yearPrefix = `${year}-`;
  return getAllHolidaysForCountry(country, remoteHolidays).filter((h) =>
    h.date.startsWith(yearPrefix)
  );
}

export function getAllHolidaysForCountry(
  country: ResolvedCountryCode,
  remoteHolidays: CalendarHoliday[] = []
): CalendarHoliday[] {
  const merged = new Map<string, CalendarHoliday>();
  for (const h of STATIC_HOLIDAY_DB[country] || []) {
    merged.set(`${h.date}__${h.name.toLowerCase()}`, h);
  }
  for (const h of remoteHolidays) {
    if (h.country === country) {
      merged.set(`${h.date}__${h.name.toLowerCase()}`, h);
    }
  }
  return Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetches live public holidays from public Nager.Date REST API when online.
 * Returns [] seamlessly on unsupported codes or offline failures.
 */
export async function fetchPublicHolidaysLive(
  year: number,
  country: ResolvedCountryCode
): Promise<CalendarHoliday[]> {
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 3500) : null;
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`, {
      signal: controller?.signal,
    });
    if (timeout) clearTimeout(timeout);
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ date: string; name: string; localName?: string }>;
    if (!Array.isArray(data)) return [];
    return data.map((item, idx) => ({
      id: `live_${country}_${item.date}_${idx}`,
      date: item.date,
      name: item.localName && item.localName !== item.name ? `${item.localName} (${item.name})` : item.name,
      country,
      category: 'public',
    }));
  } catch {
    return [];
  }
}

export interface CalendarGridCell {
  dateKey: string;
  dayOfMonth: number;
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  holidays: CalendarHoliday[];
  hasGoal: boolean;
  hasExam: boolean;
}

export function buildCalendarMonthGrid(
  year: number,
  monthIndex: number,
  holidays: CalendarHoliday[],
  goalDateKeys: Set<string>,
  examDateKeys: Set<string>,
  today: Date = new Date()
): CalendarGridCell[][] {
  const holidayByDate = new Map<string, CalendarHoliday[]>();
  for (const h of holidays) {
    const list = holidayByDate.get(h.date) || [];
    list.push(h);
    holidayByDate.set(h.date, list);
  }

  const todayKey = toIsoDateKey(today);
  const firstDay = new Date(year, monthIndex, 1);
  // Convert Sun=0..Sat=6 -> Mon=0..Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const weeks: CalendarGridCell[][] = [];

  for (let idx = 0; idx < totalCells; idx++) {
    if (idx % 7 === 0) weeks.push([]);
    const cellDate = new Date(year, monthIndex, idx - startOffset + 1);
    const inMonth = cellDate.getMonth() === monthIndex;
    const dateKey = toIsoDateKey(cellDate);
    const dow = idx % 7; // 5 = Sat, 6 = Sun

    weeks[weeks.length - 1].push({
      dateKey,
      dayOfMonth: cellDate.getDate(),
      inMonth,
      isToday: dateKey === todayKey,
      isWeekend: dow === 5 || dow === 6,
      holidays: inMonth ? holidayByDate.get(dateKey) || [] : [],
      hasGoal: inMonth && goalDateKeys.has(dateKey),
      hasExam: inMonth && examDateKeys.has(dateKey),
    });
  }

  return weeks;
}
