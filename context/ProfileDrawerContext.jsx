// context/ProfileDrawerContext.jsx
"use client";
import { createContext, useContext, useState } from "react";

const ProfileDrawerContext = createContext();

export const useProfileDrawer = () => useContext(ProfileDrawerContext);

export function ProfileDrawerProvider({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <ProfileDrawerContext.Provider
      value={{ isDrawerOpen, openDrawer, closeDrawer }}
    >
      {children}
    </ProfileDrawerContext.Provider>
  );
}
