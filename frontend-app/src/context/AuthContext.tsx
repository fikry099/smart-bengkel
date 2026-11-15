import React, { createContext, useContext, useState} from 'react';

interface AuthContextType {
  // Sesi Pengelola (Admin/Kasir)
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  loginAdmin: (token: string, user: any) => void;
  logoutAdmin: () => void;

  // Sesi Pelanggan (Customer PWA)
  customerUser: any;
  customerToken: string | null;
  isCustomerAuthenticated: boolean;
  loginCustomer: (token: string, customer: any) => void;
  logoutCustomer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Sesi Admin/Kasir
  const [user, setUser] = useState<any>(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  // State Sesi Pelanggan
  const [customerUser, setCustomerUser] = useState<any>(() => JSON.parse(localStorage.getItem('customer_user') || 'null'));
  const [customerToken, setCustomerToken] = useState<string | null>(() => localStorage.getItem('customer_token'));

  // Handlers Admin/Kasir
  const loginAdmin = (newToken: string, newUser: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Handlers Pelanggan
  const loginCustomer = (newToken: string, newCustomer: any) => {
    localStorage.setItem('customer_token', newToken);
    localStorage.setItem('customer_user', JSON.stringify(newCustomer));
    setCustomerToken(newToken);
    setCustomerUser(newCustomer);
  };

  const logoutCustomer = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    setCustomerToken(null);
    setCustomerUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loginAdmin,
        logoutAdmin,
        customerUser,
        customerToken,
        isCustomerAuthenticated: !!customerToken,
        loginCustomer,
        logoutCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};