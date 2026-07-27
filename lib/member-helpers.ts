/**
 * Client-safe helper functions for member deduplication and grouping.
 * These helpers don't depend on database or server-only modules.
 */

/**
 * Generate unique key for a person, prioritizing email over name.
 * This ensures 1 person = 1 identity across multiple generation records.
 */
export function getPersonKey(member: { email?: string | null; name: string }): string {
  return member.email?.trim().toLowerCase() || member.name.trim().toLowerCase();
}

/**
 * Group member records by person (email-first, then name fallback).
 * Returns deduplicated list where 1 person = 1 entry with generation history.
 * 
 * Useful for displaying member cards without duplicates when someone
 * has served in multiple generations.
 */
export function groupMembersByPerson<T extends { 
  id: number;
  name: string; 
  email?: string | null;
  [key: string]: any;
}>(members: T[]): (T & { history: T[] })[] {
  const grouped = new Map<string, T & { history: T[] }>();
  
  for (const member of members) {
    const key = getPersonKey(member);
    
    if (!grouped.has(key)) {
      // First record for this person - use it as primary
      grouped.set(key, { ...member, history: [member] });
    } else {
      // Additional record - add to history
      const existing = grouped.get(key)!;
      existing.history.push(member);
    }
  }
  
  return Array.from(grouped.values());
}
