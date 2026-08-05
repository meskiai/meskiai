/**
 * lib/caldav.ts
 * Apple Calendar (CalDAV) integration.
 *
 * NOTE: Real CalDAV integration with iCloud requires signing Apple Developer
 * agreements and managing OAuth 2.0 tokens or app-specific passwords via
 * the Apple CalDAV endpoint (https://caldav.icloud.com).
 * This is a stub — the feature is not yet fully implemented.
 */

export async function createAppleCalendarEvent(
  appleId: string,
  appPassword: string,
  event: { title: string; start: string; end: string; description?: string }
): Promise<{ success: boolean; error: string | null }> {
  // TODO: Implement real CalDAV PUT request to iCloud CalDAV endpoint.
  // Until then, return an honest error so the user is not misled.
  console.warn('[CalDAV] createAppleCalendarEvent called but integration is not yet implemented.', { appleId, event });
  return {
    success: false,
    error: 'Integracja z Apple Calendar jest w przygotowaniu i nie jest jeszcze dostępna. Zapisz wydarzenie ręcznie w swoim kalendarzu.'
  };
}
