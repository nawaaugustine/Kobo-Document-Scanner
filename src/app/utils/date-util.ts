/**
 * Utility functions for parsing dates and calculating age.
 */
export function calculateAge(dateOfBirth: string): number {
  let birthDate: Date | null = null;

  if (!dateOfBirth || typeof dateOfBirth !== 'string') return 0;

  // Format with delimiters (e.g., "08/01/1979", "08.01.1979", or "01-01-2003")
  if (dateOfBirth.includes('/') || dateOfBirth.includes('.') || dateOfBirth.includes('-')) {
    const normalizedDate = dateOfBirth.replace(/[\/\.\-]/g, '/');
    const parts = normalizedDate.split('/');
    if (parts.length !== 3) return 0;

    const [dayStr, monthStr, yearStr] = parts;
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    if (!day || !month || !year) return 0;

    birthDate = new Date(year, month - 1, day);
  }
  // Format without delimiters (e.g., "790108" where "79" = year, "01" = month, "08" = day)
  else if (/^\d{6}$/.test(dateOfBirth)) {
    const yearPart = dateOfBirth.slice(0, 2);
    const monthPart = dateOfBirth.slice(2, 4);
    const dayPart = dateOfBirth.slice(4, 6);

    const year = Number(yearPart);
    const month = Number(monthPart);
    const day = Number(dayPart);

    const currentYear = new Date().getFullYear();
    const cutoff = currentYear % 100;
    const fullYear = (year > cutoff ? 1900 : 2000) + year;

    birthDate = new Date(fullYear, month - 1, day);
  } else {
    return 0;
  }

  return getAge(birthDate);
}

export function getAge(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
