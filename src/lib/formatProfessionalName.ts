/**
 * Formats a professional's name with the appropriate title (Dr. or Dra.)
 * based on their gender.
 * 
 * @param fullName - The full name of the professional
 * @param gender - The gender ('male' or 'female'), defaults to 'female'
 * @returns The formatted name with Dr./Dra. prefix
 */
export function formatProfessionalName(
  fullName: string | null | undefined,
  gender: 'male' | 'female' | null | undefined = 'female'
): string {
  if (!fullName) return '';
  
  const prefix = gender === 'male' ? 'Dr.' : 'Dra.';
  return `${prefix} ${fullName}`;
}
