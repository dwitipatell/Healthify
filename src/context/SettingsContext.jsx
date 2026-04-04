import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Settings Context
const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

// Default settings
const DEFAULT_SETTINGS = {
  // Theme
  colorMode: 'light',
  darkMode: false,
  accentColor: '#0D9488',
  sidebarStyle: 'dark',
  
  // Typography
  bodyFont: 'DM Sans',
  headingFont: 'Fraunces',
  fontSize: 14,
  lineHeight: 'normal',
  
  // Layout
  density: 'comfortable',
  radius: 12,
  cardShadow: 'subtle',
  
  // Motion
  animations: true,
  reduceMotion: false,
  animSpeed: 'normal',
  skeletons: true,
  
  // Language
  language: 'English',
  region: 'India',
  timeFormat: '12h',
  dateFormat: 'DD/MM/YYYY',
  
  // Accessibility
  highContrast: false,
  colorBlind: false,
  focusRings: true,
  
  // Notifications
  notifBadge: true,
  notifToast: true,
  apptReminders: true,
  noshowAlerts: true,
  
  // Privacy
  analytics: true,
  aiFeatures: true,
  shareData: false,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('healthify_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    setIsLoading(false);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('healthify_settings', JSON.stringify(settings));
      applySettingsToDOM(settings);
    }
  }, [settings, isLoading]);

  // Update individual setting
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Update multiple settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Reset to defaults
  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, updateSettings, reset }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Apply settings to DOM
function applySettingsToDOM(settings) {
  const root = document.documentElement;

  // Apply font settings
  if (settings.bodyFont) {
    root.style.setProperty('--font-body', `'${settings.bodyFont}', sans-serif`);
  }
  if (settings.headingFont) {
    root.style.setProperty('--font-heading', `'${settings.headingFont}', serif`);
  }
  if (settings.fontSize) {
    root.style.setProperty('--font-size-base', `${settings.fontSize}px`);
  }

  // Apply radius
  if (settings.radius) {
    root.style.setProperty('--radius-base', `${settings.radius}px`);
  }

  // Apply density/spacing
  const densityMap = {
    compact: { spacing: '8px', rowHeight: '32px' },
    comfortable: { spacing: '12px', rowHeight: '40px' },
    spacious: { spacing: '16px', rowHeight: '48px' },
  };
  const densitySettings = densityMap[settings.density] || densityMap.comfortable;
  root.style.setProperty('--spacing-base', densitySettings.spacing);
  root.style.setProperty('--row-height', densitySettings.rowHeight);

  // Apply motion settings
  const animDuration = {
    slow: '400ms',
    normal: '300ms',
    fast: '150ms',
  };
  root.style.setProperty('--anim-duration', animDuration[settings.animSpeed] || '300ms');
  
  if (settings.reduceMotion) {
    root.style.setProperty('--anim-duration', '0s');
  }

  // Apply accent color and convert to CSS variables
  if (settings.accentColor) {
    root.style.setProperty('--accent-color', settings.accentColor);
  }

  // Apply dark mode
  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // Apply high contrast
  if (settings.highContrast) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }

  // Apply color-blind mode
  if (settings.colorBlind) {
    document.body.classList.add('colorblind-mode');
  } else {
    document.body.classList.remove('colorblind-mode');
  }

  // Apply focus rings always
  if (settings.focusRings) {
    document.body.classList.add('focusrings-always');
  } else {
    document.body.classList.remove('focusrings-always');
  }

  // Apply reduce motion class
  if (settings.reduceMotion) {
    document.body.classList.add('reduce-motion');
  } else {
    document.body.classList.remove('reduce-motion');
  }
}
