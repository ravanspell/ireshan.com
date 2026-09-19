/**
 * Date formatting for rendered copy. Fixed to `en`, not the request locale:
 * a server-rendered value has to match what the client would produce, or React
 * flags a hydration mismatch.
 */

const LONG_DATE = new Intl.DateTimeFormat('en', { dateStyle: 'long' });

const LONG_DATE_TIME = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** e.g. `September 19, 2026` - for published dates, where the time is noise. */
export function formatDate(date: Date): string {
  return LONG_DATE.format(date);
}

/** e.g. `Sep 19, 2026, 2:30 PM` - for edit timestamps, where the time matters. */
export function formatDateTime(date: Date): string {
  return LONG_DATE_TIME.format(date);
}
