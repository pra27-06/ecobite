import React, { useState, useEffect } from 'react';
import { CampusContext } from './CampusContextDefinition';

export { type CampusContextType } from './CampusContextDefinition';

const STORAGE_KEY = 'ecobite_verified_campus';

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const campusId = isVerified ? 'mait' : null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isVerified));
  }, [isVerified]);

  const verifyCampus = () => {
    setIsVerified(true);
  };

  const revokeCampus = () => {
    setIsVerified(false);
  };

  return (
    <CampusContext.Provider
      value={{
        isVerified,
        campusId,
        campusName: isVerified ? 'Maharaja Agrasen Institute of Technology' : null,
        campusShortName: isVerified ? 'MAIT' : null,
        city: isVerified ? 'Delhi' : null,
        verifyCampus,
        revokeCampus,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};
