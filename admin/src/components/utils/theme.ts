import { useEffect, useState } from 'react';

/*
Strapi - translationstudio extension
Copyright (C) 2025 I-D Media GmbH, idmedia.com

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, see https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
*/
export const isDarkMode = (): boolean => {
  // brwoser?
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const strapiTheme = localStorage.getItem('STRAPI_THEME');

    if (strapiTheme === 'dark') {
      return true;
    } else if (strapiTheme === 'light') {
      return false;
    }
  } catch (error) {
    console.warn('Could not access localStorage for theme detection:', error);
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true;
  }

  return false;
};

export const getThemeColors = () => {
  const isDark = isDarkMode();

  return {
    // background
    primaryBackground: isDark ? '#212134' : '#ffffff',
    secondaryBackground: isDark ? '#32324d' : '#f6f6f9',
    cardBackground: isDark ? '#212134' : '#ffffff',

    // text
    primaryText: isDark ? '#ffffff' : '#32324d',
    secondaryText: isDark ? '#a5a5ba' : '#666687',
    mutedText: isDark ? '#8e8ea9' : '#8e8ea9',

    // border
    border: isDark ? '#4a4a6a' : '#dcdce4',

    success: '#5cb85c',
    warning: '#f0ad4e',
    danger: '#d9534f',
    info: '#5bc0de',
  };
};

export const useThemeMode = (): boolean => {
  const [isDark, setIsDark] = useState(isDarkMode());

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'STRAPI_THEME') {
        setIsDark(isDarkMode());
      }
    };

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const strapiTheme = localStorage.getItem('STRAPI_THEME');
      if (!strapiTheme || strapiTheme === 'system') {
        setIsDark(e.matches);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  return isDark;
};
