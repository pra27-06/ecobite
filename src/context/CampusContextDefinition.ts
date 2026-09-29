import { createContext } from 'react';

export interface CampusContextType {
  isVerified: boolean;
  campusId: string | null;
  campusName: string | null;
  campusShortName: string | null;
  city: string | null;
  verifyCampus: (id?: string) => void;
  revokeCampus: () => void;
}

export const CampusContext = createContext<CampusContextType | undefined>(undefined);
