import { useContext } from 'react';
import { CampusContext, type CampusContextType } from '../context/CampusContextDefinition';

export const useCampus = (): CampusContextType => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};

export type { CampusContextType };
