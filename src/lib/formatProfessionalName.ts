/**
 * Formats a professional's name with the appropriate title (Dr. or Dra.)
 * based on their gender.
 * 
 * @param fullName - The full name of the professional
 * @param gender - The gender ('male', 'female', or 'other'), defaults to 'female'
 * @returns The formatted name with Dr./Dra. prefix
 */
export function formatProfessionalName(
  fullName: string | null | undefined,
  gender: 'male' | 'female' | 'other' | null | undefined = 'female'
): string {
  if (!fullName) return '';
  
  // For 'other' gender, use gender-neutral "Dr." (common in Portuguese)
  const prefix = gender === 'male' ? 'Dr.' : gender === 'other' ? 'Dr.' : 'Dra.';
  return `${prefix} ${fullName}`;
}
