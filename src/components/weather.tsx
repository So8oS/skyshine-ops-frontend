import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Loader2,
  MapPin,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/** UAE Emirates with WGS84 coordinates for Open-Meteo */
const EMIRATES = [
  { id: "abu-dhabi", name: "Abu Dhabi", latitude: 24.4539, longitude: 54.3773 },
  { id: "dubai", name: "Dubai", latitude: 25.2048, longitude: 55.2708 },
  { id: "sharjah", name: "Sharjah", latitude: 25.3573, longitude: 55.4033 },
  { id: "ajman", name: "Ajman", latitude: 25.4052, longitude: 55.5136 },
  { id: "umm-al-quwain", name: "Umm Al Quwain", latitude: 25.5647, longitude: 55.5553 },
  { id: "ras-al-khaimah", name: "Ras Al Khaimah", latitude: 25.7895, longitude: 55.9432 },
  { id: "fujairah", name: "Fujairah", latitude: 25.1288, longitude: 56.3265 },
] as const;

/** Weekday order for calendar: Sun–Sat (0–6) */
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** WMO weather codes → label + Lucide-style icon (per Open-Meteo docs) */
const WMO_WEATHER: Record<number, { label: string; icon: typeof Cloud }> = {
  0: { label: "Clear sky", icon: Sun },
  1: { label: "Mainly clear", icon: CloudSun },
  2: { label: "Partly cloudy", icon: CloudSun },
  3: { label: "Overcast", icon: Cloud },
  45: { label: "Fog", icon: CloudFog },
  48: { label: "Depositing rime fog", icon: CloudFog },
  51: { label: "Light drizzle", icon: CloudRain },
  53: { label: "Moderate drizzle", icon: CloudRain },
  55: { label: "Dense drizzle", icon: CloudRain },
  56: { label: "Light freezing drizzle", icon: CloudRain },
  57: { label: "Dense freezing drizzle", icon: CloudRain },
  61: { label: "Slight rain", icon: CloudRain },
  63: { label: "Moderate rain", icon: CloudRain },
  65: { label: "Heavy rain", icon: CloudRain },
  66: { label: "Light freezing rain", icon: CloudRain },
  67: { label: "Heavy freezing rain", icon: CloudRain },
  71: { label: "Slight snow", icon: CloudSnow },
  73: { label: "Moderate snow", icon: CloudSnow },
  75: { label: "Heavy snow", icon: CloudSnow },
  77: { label: "Snow grains", icon: CloudSnow },
  80: { label: "Slight rain showers", icon: CloudRain },
  81: { label: "Moderate rain showers", icon: CloudRain },
  82: { label: "Violent rain showers", icon: CloudRain },
  85: { label: "Slight snow showers", icon: CloudSnow },
  86: { label: "Heavy snow showers", icon: CloudSnow },
  95: { label: "Thunderstorm", icon: CloudLightning },
  96: { label: "Thunderstorm with slight hail", icon: CloudLightning },
  99: { label: "Thunderstorm with heavy hail", icon: CloudLightning },
};

function getWeatherInfo(code: number | undefined): { label: string; icon: typeof Cloud } {
  if (code === undefined || code === null) return { label: "—", icon: Cloud };
  const exact = WMO_WEATHER[code];
  if (exact) return exact;
  if (code >= 0 && code <= 3) return WMO_WEATHER[0];
  if (code >= 45 && code <= 48) return WMO_WEATHER[45];
  if (code >= 51 && code <= 67) return WMO_WEATHER[61];
  if (code >= 71 && code <= 77) return WMO_WEATHER[71];
  if (code >= 80 && code <= 82) return WMO_WEATHER[80];
  if (code >= 85 && code <= 86) return WMO_WEATHER[85];
  if (code >= 95 && code <= 99) return WMO_WEATHER[95];
  return { label: "—", icon: Cloud };
}

type WeeklyDates = {
  weekIndex: number;
  weekStart: string;
  weekEnd: string;
  dates: string[];
};

/** Daily variables per Open-Meteo; add daylight_duration for drawer */
const DAILY_VARS =
  "temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,weather_code";

type OpenMeteoForecastResponse = {
  timezone: string;
  daily?: {
    time: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    sunrise?: string[];
    sunset?: string[];
    daylight_duration?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
    wind_speed_10m_max?: number[];
    wind_gusts_10m_max?: number[];
    weather_code?: number[];
  };
};

/** Display units */
const DISPLAY_UNITS = { temp: "°C", wind: "km/h", precip: "mm" } as const;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function fmtPrettyDate(yyyyMMdd: string) {
  const d = new Date(`${yyyyMMdd}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function getWeekdayIndex(yyyyMMdd: string): number {
  const d = new Date(`${yyyyMMdd}T12:00:00`);
  return d.getDay();
}

function fmtTimeOnly(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "—";
  }
}

function formatDaylightDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function todayString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

type DayRow = {
  date: string;
  tempMin?: number;
  tempMax?: number;
  sunrise?: string;
  sunset?: string;
  daylightDurationSeconds?: number;
  precipSum?: number;
  precipProbMax?: number;
  windSpeedMax?: number;
  windGustsMax?: number;
  weatherCode?: number;
};

function buildDayRows(data: OpenMeteoForecastResponse): DayRow[] {
  const times = data.daily?.time ?? [];
  const tempMax = data.daily?.temperature_2m_max ?? [];
  const tempMin = data.daily?.temperature_2m_min ?? [];
  const sunrise = data.daily?.sunrise ?? [];
  const sunset = data.daily?.sunset ?? [];
  const daylight = data.daily?.daylight_duration ?? [];
  const precipSum = data.daily?.precipitation_sum ?? [];
  const precipProbMax = data.daily?.precipitation_probability_max ?? [];
  const windSpeedMax = data.daily?.wind_speed_10m_max ?? [];
  const windGustsMax = data.daily?.wind_gusts_10m_max ?? [];
  const weatherCode = data.daily?.weather_code ?? [];

  return times.map((date, i) => ({
    date,
    tempMin: tempMin[i],
    tempMax: tempMax[i],
    sunrise: sunrise[i],
    sunset: sunset[i],
    daylightDurationSeconds: daylight[i],
    precipSum: precipSum[i],
    precipProbMax: precipProbMax[i],
    windSpeedMax: windSpeedMax[i],
    windGustsMax: windGustsMax[i],
    weatherCode: weatherCode[i],
  }));
}

type HourlyRow = {
  time: string;
  temperature_2m?: number;
  apparent_temperature?: number;
  precipitation_probability?: number;
  precipitation?: number;
  wind_speed_10m?: number;
  weather_code?: number;
};

async function fetchWeather(lat: number, lon: number): Promise<{
  timezone: string;
  weeks: WeeklyDates[];
  dayRows: DayRow[];
}> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "auto",
    forecast_days: "14",
    daily: DAILY_VARS,
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`);
  const data = (await res.json()) as OpenMeteoForecastResponse;
  const dayRows = buildDayRows(data);
  const dates = dayRows.map((r) => r.date);
  const weeks = chunk(dates, 7).map((weekDates, idx) => ({
    weekIndex: idx + 1,
    weekStart: weekDates[0],
    weekEnd: weekDates[weekDates.length - 1],
    dates: weekDates,
  }));
  return { timezone: data.timezone ?? "auto", weeks, dayRows };
}

async function fetchHourlyForDay(
  lat: number,
  lon: number,
  date: string
): Promise<{ hourly: HourlyRow[] }> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "auto",
    start_date: date,
    end_date: date,
    hourly:
      "temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,weather_code",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("Failed to load hourly data");
  const data = (await res.json()) as {
    hourly?: {
      time?: string[];
      temperature_2m?: number[];
      apparent_temperature?: number[];
      precipitation_probability?: number[];
      precipitation?: number[];
      wind_speed_10m?: number[];
      weather_code?: number[];
    };
  };
  const h = data.hourly;
  const times = h?.time ?? [];
  const rows: HourlyRow[] = times.map((t, i) => ({
    time: t,
    temperature_2m: h?.temperature_2m?.[i],
    apparent_temperature: h?.apparent_temperature?.[i],
    precipitation_probability: h?.precipitation_probability?.[i],
    precipitation: h?.precipitation?.[i],
    wind_speed_10m: h?.wind_speed_10m?.[i],
    weather_code: h?.weather_code?.[i],
  }));
  return { hourly: rows };
}

/** Build calendar grid with leading padding so first day aligns under its weekday (Sun=0). */
function buildCalendarCells(allDates: string[]): (string | null)[] {
  if (allDates.length === 0) return [];
  const first = allDates[0];
  const padCount = getWeekdayIndex(first);
  const leading = Array.from({ length: padCount }, () => null as null);
  return [...leading, ...allDates];
}

export default function WeeklyWeatherCalendar() {
  const [emirateId, setEmirateId] = useState<string>(EMIRATES[0].id);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("");
  const [weeks, setWeeks] = useState<WeeklyDates[]>([]);
  const [dayRows, setDayRows] = useState<DayRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hourlyRows, setHourlyRows] = useState<HourlyRow[]>([]);
  const [hourlyLoading, setHourlyLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hourlyDetailExpanded, setHourlyDetailExpanded] = useState(false);

  const selectedEmirate = useMemo(
    () => EMIRATES.find((e) => e.id === emirateId) ?? EMIRATES[0],
    [emirateId]
  );
  const allDates = useMemo(() => weeks.flatMap((w) => w.dates), [weeks]);
  const calendarCells = useMemo(() => buildCalendarCells(allDates), [allDates]);
  /** When collapsed, show only first 5 days (include leading empty cells so grid aligns). */
  const visibleCells = useMemo(() => {
    if (expanded) return calendarCells;
    let dayCount = 0;
    const result: (string | null)[] = [];
    for (const cell of calendarCells) {
      result.push(cell);
      if (cell !== null) dayCount++;
      if (dayCount >= 5) break;
    }
    return result;
  }, [calendarCells, expanded]);
  const hiddenCount = calendarCells.filter((c) => c !== null).length - visibleCells.filter((c) => c !== null).length;
  const dateToRow = useMemo(() => {
    const m = new Map<string, DayRow>();
    for (const r of dayRows) m.set(r.date, r);
    return m;
  }, [dayRows]);

  const isUpdating = loading && dayRows.length > 0;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        if (dayRows.length === 0) setErr(null);
        const result = await fetchWeather(selectedEmirate.latitude, selectedEmirate.longitude);
        if (!alive) return;
        setTimezone(result.timezone);
        setWeeks(result.weeks);
        setDayRows(result.dayRows);
        setErr(null);
      } catch (e) {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : "Failed to fetch weather");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedEmirate.latitude, selectedEmirate.longitude]);

  useEffect(() => {
    if (!selectedDate || !selectedEmirate) return;
    setHourlyDetailExpanded(false);
    let alive = true;
    setHourlyLoading(true);
    setHourlyRows([]);
    fetchHourlyForDay(selectedEmirate.latitude, selectedEmirate.longitude, selectedDate)
      .then(({ hourly }) => {
        if (alive) setHourlyRows(hourly);
      })
      .finally(() => {
        if (alive) setHourlyLoading(false);
      });
    return () => { alive = false; };
  }, [selectedDate, selectedEmirate.latitude, selectedEmirate.longitude]);

  const closeDetail = useCallback(() => setSelectedDate(null), []);

  const today = todayString();

  if (loading && dayRows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-semibold">Weather Calendar</div>
        <p className="mt-2 text-sm text-muted-foreground">Loading 14-day forecast…</p>
      </div>
    );
  }

  if (err && dayRows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="text-lg font-semibold">Weather Calendar</div>
        <p className="mt-2 text-destructive">{err}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Data from Open-Meteo. Check network or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Weather calendar</h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {timezone} · 14-day · Temp {DISPLAY_UNITS.temp}, wind {DISPLAY_UNITS.wind}, precip {DISPLAY_UNITS.precip}
            </p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Select value={emirateId} onValueChange={setEmirateId} disabled={loading}>
              <SelectTrigger className="w-full sm:w-[180px]" size="default">
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4 shrink-0" />
                )}
                <SelectValue placeholder="Emirate" />
              </SelectTrigger>
              <SelectContent>
                {EMIRATES.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isUpdating && (
              <span className="text-muted-foreground text-xs">Updating…</span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium">
              <Thermometer className="h-3.5 w-3.5" /> Temp {DISPLAY_UNITS.temp}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium">
              <Wind className="h-3.5 w-3.5" /> Wind {DISPLAY_UNITS.wind}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium">
              <Droplets className="h-3.5 w-3.5" /> Precip {DISPLAY_UNITS.precip}
            </span>
          </div>
        </div>

        {/* Mobile: vertical list of day cards (full width, no truncation) */}
        <div className="mt-4 flex flex-col gap-3 md:hidden">
          {visibleCells.filter((cell): cell is string => cell !== null).map((date) => {
            const r = dateToRow.get(date);
            const weatherInfo = getWeatherInfo(r?.weatherCode);
            const WeatherIcon = weatherInfo.icon;
            const isToday = date === today;
            const weekday = getWeekdayIndex(date);
            const isWeekend = weekday === 5 || weekday === 6;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  isToday ? "ring-2 ring-primary border-primary bg-primary/5" : "bg-muted/30 border-border"
                } ${isWeekend ? "bg-blue-500/5 dark:bg-blue-400/5" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">{fmtPrettyDate(date)}</div>
                    <div className="text-xs text-muted-foreground">{date}</div>
                    {isToday && <span className="mt-0.5 inline-block text-xs font-medium text-primary">Today</span>}
                  </div>
                  <WeatherIcon className="h-6 w-6 shrink-0 text-muted-foreground" aria-hidden />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Temp</span>
                  <span className="col-span-2 font-medium tabular-nums text-right">
                    {typeof r?.tempMin === "number" && typeof r?.tempMax === "number"
                      ? `${r.tempMin.toFixed(0)}–${r.tempMax.toFixed(0)}${DISPLAY_UNITS.temp}`
                      : "—"}
                  </span>
                  <span className="text-muted-foreground">Wind / Gust</span>
                  <span className="col-span-2 font-medium tabular-nums text-right">
                    {typeof r?.windSpeedMax === "number" && typeof r?.windGustsMax === "number"
                      ? `${Math.round(r.windSpeedMax)} / ${Math.round(r.windGustsMax)} ${DISPLAY_UNITS.wind}`
                      : "—"}
                  </span>
                  <span className="text-muted-foreground">Precip</span>
                  <span className="col-span-2 font-medium tabular-nums text-right">
                    {typeof r?.precipProbMax === "number" ? `${Math.round(r.precipProbMax)}%` : "—"}
                    {typeof r?.precipSum === "number" ? ` · ${r.precipSum.toFixed(1)} ${DISPLAY_UNITS.precip}` : ""}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop: Sun–Sat header + 7-column calendar grid */}
        <div className="mt-4 hidden md:block">
          <div className="grid grid-cols-7 gap-2 xl:gap-3">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2 xl:gap-3">
            {visibleCells.map((date, idx) => {
              if (date === null) {
                return <div key={`empty-${idx}`} className="min-h-[100px] rounded-lg border border-dashed border-muted/50 bg-muted/10 sm:min-h-[180px]" />;
              }
              const r = dateToRow.get(date);
              const weatherInfo = getWeatherInfo(r?.weatherCode);
              const WeatherIcon = weatherInfo.icon;
              const isToday = date === today;
              const weekday = getWeekdayIndex(date);
              const isWeekend = weekday === 5 || weekday === 6;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 sm:min-h-[180px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    isToday ? "ring-2 ring-primary border-primary bg-primary/5" : "bg-muted/30 border-border"
                  } ${isWeekend ? "bg-blue-500/5 dark:bg-blue-400/5" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">{fmtPrettyDate(date)}</div>
                      <div className="text-xs text-muted-foreground">{date}</div>
                      {isToday && <span className="mt-0.5 inline-block text-xs font-medium text-primary">Today</span>}
                    </div>
                    <WeatherIcon className="h-6 w-6 shrink-0 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Temp</span>
                      <span className="font-medium tabular-nums">
                        {typeof r?.tempMin === "number" && typeof r?.tempMax === "number"
                          ? `${r.tempMin.toFixed(0)}–${r.tempMax.toFixed(0)}${DISPLAY_UNITS.temp}`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Wind / Gust</span>
                      <span className="font-medium tabular-nums">
                        {typeof r?.windSpeedMax === "number" && typeof r?.windGustsMax === "number"
                          ? `${Math.round(r.windSpeedMax)} / ${Math.round(r.windGustsMax)} ${DISPLAY_UNITS.wind}`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Precip</span>
                      <span className="font-medium tabular-nums">
                        {typeof r?.precipProbMax === "number" ? `${Math.round(r.precipProbMax)}%` : "—"}
                        {typeof r?.precipSum === "number" ? ` · ${r.precipSum.toFixed(1)} ${DISPLAY_UNITS.precip}` : ""}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {hiddenCount > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            Show {hiddenCount} more days
            <ChevronDown className="h-4 w-4" />
          </button>
        ) : expanded && calendarCells.filter((c) => c !== null).length > 5 ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            Show less
            <ChevronUp className="h-4 w-4" />
          </button>
        ) : null}

        <p className="mt-4 text-xs text-muted-foreground">
          Data from Open-Meteo. Click a day for details. Fri/Sat = weekend.
        </p>
      </div>

      {/* Selected day detail drawer */}
      <Sheet open={!!selectedDate} onOpenChange={(open) => !open && closeDetail()}>
        <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md px-4">
          {selectedDate && (() => {
            const r = dateToRow.get(selectedDate);
            const weatherInfo = getWeatherInfo(r?.weatherCode);
            const DetailIcon = weatherInfo.icon;
            const HOURLY_INITIAL = 6;
            const visibleHourly = hourlyDetailExpanded ? hourlyRows : hourlyRows.slice(0, HOURLY_INITIAL);
            const moreHourlyCount = hourlyRows.length - HOURLY_INITIAL;
            return (
              <>
                <SheetHeader className="border-b pb-4">
                  <SheetTitle className="flex items-center gap-2 text-left">
                    {fmtPrettyDate(selectedDate)}
                    {selectedDate === today && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Today</span>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-5 py-4">
                  {/* Hero summary */}
                  <div className="flex items-center gap-4 rounded-xl border bg-linear-to-br from-muted/50 to-muted/20 p-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-background/80 shadow-sm">
                      <DetailIcon className="h-8 w-8 text-muted-foreground" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{weatherInfo.label}</p>
                      <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-foreground">
                        {typeof r?.tempMin === "number" && typeof r?.tempMax === "number"
                          ? `${r.tempMin.toFixed(0)} – ${r.tempMax.toFixed(0)} ${DISPLAY_UNITS.temp}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Temp & wind */}
                  <div className="rounded-xl border bg-card p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      Temp &amp; wind
                    </h4>
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Min – Max</dt>
                        <dd className="tabular-nums font-medium">
                          {typeof r?.tempMin === "number" && typeof r?.tempMax === "number"
                            ? `${r.tempMin.toFixed(0)} – ${r.tempMax.toFixed(0)} ${DISPLAY_UNITS.temp}`
                            : "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Wind max / Gust max</dt>
                        <dd className="tabular-nums font-medium">
                          {typeof r?.windSpeedMax === "number" && typeof r?.windGustsMax === "number"
                            ? `${Math.round(r.windSpeedMax)} / ${Math.round(r.windGustsMax)} ${DISPLAY_UNITS.wind}`
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Sun & daylight */}
                  <div className="rounded-xl border bg-card p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      Sun &amp; daylight
                    </h4>
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="flex items-center gap-1.5 text-muted-foreground">
                          <Sunrise className="h-3.5 w-3.5" /> Sunrise
                        </dt>
                        <dd className="tabular-nums font-medium">{r?.sunrise ? fmtTimeOnly(r.sunrise) : "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="flex items-center gap-1.5 text-muted-foreground">
                          <Sunset className="h-3.5 w-3.5" /> Sunset
                        </dt>
                        <dd className="tabular-nums font-medium">{r?.sunset ? fmtTimeOnly(r.sunset) : "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Daylight</dt>
                        <dd className="tabular-nums font-medium">
                          {typeof r?.daylightDurationSeconds === "number"
                            ? formatDaylightDuration(r.daylightDurationSeconds)
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Precipitation */}
                  <div className="rounded-xl border bg-card p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      Precipitation
                    </h4>
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Precip % max</dt>
                        <dd className="tabular-nums font-medium">
                          {typeof r?.precipProbMax === "number" ? `${Math.round(r.precipProbMax)}%` : "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Precip sum</dt>
                        <dd className="tabular-nums font-medium">
                          {typeof r?.precipSum === "number" ? `${r.precipSum.toFixed(1)} ${DISPLAY_UNITS.precip}` : "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Hourly — expandable */}
                  <div className="rounded-xl border bg-card p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Hourly
                    </h4>
                    {hourlyLoading ? (
                      <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                      </p>
                    ) : hourlyRows.length === 0 ? (
                      <p className="py-2 text-sm text-muted-foreground">No hourly data</p>
                    ) : (
                      <>
                        <ul className="space-y-0.5">
                          {visibleHourly.map((hr) => (
                            <li
                              key={hr.time}
                              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                            >
                              <span className="w-14 shrink-0 tabular-nums text-muted-foreground">
                                {fmtTimeOnly(hr.time)}
                              </span>
                              <span className="min-w-0 flex-1 tabular-nums font-medium">
                                {typeof hr.temperature_2m === "number" ? `${hr.temperature_2m.toFixed(0)}${DISPLAY_UNITS.temp}` : "—"}
                                {typeof hr.apparent_temperature === "number" && hr.apparent_temperature !== hr.temperature_2m && (
                                  <span className="ml-1 text-muted-foreground">(feels {hr.apparent_temperature.toFixed(0)}{DISPLAY_UNITS.temp})</span>
                                )}
                              </span>
                              <span className="shrink-0 tabular-nums text-muted-foreground">
                                {typeof hr.precipitation_probability === "number" ? `${Math.round(hr.precipitation_probability)}%` : "—"}
                                {typeof hr.precipitation === "number" && hr.precipitation > 0 && (
                                  <span> · {hr.precipitation.toFixed(1)} mm</span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {moreHourlyCount > 0 && !hourlyDetailExpanded && (
                          <button
                            type="button"
                            onClick={() => setHourlyDetailExpanded(true)}
                            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                          >
                            Show {moreHourlyCount} more hours
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {hourlyDetailExpanded && hourlyRows.length > HOURLY_INITIAL && (
                          <button
                            type="button"
                            onClick={() => setHourlyDetailExpanded(false)}
                            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                          >
                            Show less
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      
    </div>
  );
}
