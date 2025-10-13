
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('e-reussite-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('e-reussite-users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userWithoutPassword = { email: foundUser.email, name: foundUser.name };
      setUser(userWithoutPassword);
      localStorage.setItem('e-reussite-user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    return { success: false, error: 'Email ou mot de passe incorrect' };
  };

  const signup = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('e-reussite-users') || '[]');
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Cet email est déjà utilisé' };
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('e-reussite-users', JSON.stringify(users));
    
    const userWithoutPassword = { email, name };
    setUser(userWithoutPassword);
    localStorage.setItem('e-reussite-user', JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('e-reussite-user');
  };

  return { user, login, signup, logout };
};
  