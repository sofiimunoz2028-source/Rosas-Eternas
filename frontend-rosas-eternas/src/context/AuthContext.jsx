import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('re_token');
    if (!token) {
      setCargando(false);
      return;
    }
    api('/auth/me')
      .then((data) => setUsuario(data.usuario))
      .catch(() => {
        localStorage.removeItem('re_token');
        setUsuario(null);
      })
      .finally(() => setCargando(false));
  }, []);

  const value = useMemo(() => ({
    usuario,
    cargando,
    esAdmin: usuario?.rol === 'administrador',
    async login(email, password) {
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      localStorage.setItem('re_token', data.token);
      setUsuario(data.usuario);
      return data.usuario;
    },
    async registro(payload) {
      const data = await api('/auth/registro', { method: 'POST', body: payload });
      localStorage.setItem('re_token', data.token);
      setUsuario(data.usuario);
      return data.usuario;
    },
    logout() {
      localStorage.removeItem('re_token');
      setUsuario(null);
    },
  }), [usuario, cargando]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
