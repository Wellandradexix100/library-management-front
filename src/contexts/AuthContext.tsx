import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

export type Role = 'ADMIN' | 'USER' | 'BIBLIOTECARIO';

interface UserPayload {
  id: number;
  email: string;
  funcao: Role;
  role?: Role;
  exp: number;
}

interface AuthContextData {
  user: UserPayload | null;
  signIn: (token: string) => void;
  signOut: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@LibraryEscolar:token');
    
    if (token) {
      try {
        const decoded = jwtDecode<UserPayload>(token);

        if (decoded.exp * 1000 < Date.now()) {
          signOut();
        } else {
          setUser({ ...decoded, role: decoded.funcao });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        signOut();
      }
    }
    setLoading(false);
  }, []);

  const signIn = (token: string) => {
    localStorage.setItem('@LibraryEscolar:token', token);
    const decoded = jwtDecode<UserPayload>(token);
    setUser({ ...decoded, role: decoded.funcao });
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const signOut = () => {
    localStorage.removeItem('@LibraryEscolar:token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
