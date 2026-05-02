import { createContext, useContext, useMemo, useState } from "react";

import { clearSession, getStoredToken, getStoredUser, loginRequest, storeSession } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());

  async function login(username, password) {
    const data = await loginRequest(username, password);
    storeSession(data.access_token, data.user);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      token,
      user,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
