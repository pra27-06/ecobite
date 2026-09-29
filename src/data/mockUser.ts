/**
 * EcoBite AI - Mock Student Profile
 */

export interface MockUserProfile {
  name: string;
  role: string;
  department: string;
  defaultCampus: string;
  email: string;
  joinedDate: string;
  avatarInitials: string;
}

export const MOCK_USER: MockUserProfile = {
  name: 'Prachi',
  role: 'B.Tech Student',
  department: 'Computer Science & Engineering',
  defaultCampus: 'Maharaja Agrasen Institute of Technology (MAIT)',
  email: 'prachi@student.mait.ac.in',
  joinedDate: 'September 2026',
  avatarInitials: 'P',
};
