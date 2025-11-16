import { useColorScheme } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  error: string;
  success: string;
  shadow: string;
  modalBackdrop: string;
  inputBackground: string;
  buttonPrimary: string;
  buttonText: string;
}

export interface UseThemeReturn {
  colors: ThemeColors;
  isDark: boolean;
}

export function useTheme(): UseThemeReturn {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const colors = isDark ? AppColors.dark : AppColors.light;
  
  return {
    colors,
    isDark,
  };
}
