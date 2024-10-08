// SessionContext.tsx
"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

// Define the shape of your session data
interface CustomSession {
  user?: {
    id: number;
    username: string;
    email: string;
    profilePic: string;
  };
}

// Create a context with default value as null
const SessionContext = createContext<CustomSession | null>(null);

interface SessionProviderProps {
  children: ReactNode;
}

// Create a Provider component
export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [session, setSession] = useState<CustomSession | null>(null);
  const searchParams = useSearchParams(); // Extract session info from URL params

  useEffect(() => {
    const userParam = searchParams.get('user'); 
console.log(userParam);
    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        setSession({ user });
        
if(user.id){
  console.log('UserID:' ,user.id)
  localStorage.setItem('userId',user.id.toString());
}

      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [searchParams]);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};

// Hook to use session in any component
export const useSession = () => {
  return useContext(SessionContext);
};
