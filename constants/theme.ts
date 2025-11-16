/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const AppColors = {
  light: {
    background: '#f5f5f5',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#222222',
    textSecondary: '#666666',
    border: '#e0e0e0',
    primary: '#007AFF',
    error: '#FF3B30',
    success: '#34C759',
    shadow: '#000000',
    modalBackdrop: 'rgba(0, 0, 0, 0.4)',
    inputBackground: '#fafafa',
    buttonPrimary: '#007AFF',
    buttonText: '#ffffff',
  },
  dark: {
    background: '#000000',
    surface: '#1c1c1e',
    card: '#2c2c2e',
    text: '#ffffff',
    textSecondary: '#98989d',
    border: '#38383a',
    primary: '#0a84ff',
    error: '#ff453a',
    success: '#32d74b',
    shadow: '#000000',
    modalBackdrop: 'rgba(0, 0, 0, 0.6)',
    inputBackground: '#1c1c1e',
    buttonPrimary: '#0a84ff',
    buttonText: '#ffffff',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
