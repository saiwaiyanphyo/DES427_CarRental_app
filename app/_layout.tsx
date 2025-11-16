import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import AuthScreen from '../src/screens/AuthScreen';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerRoot() {
  const osScheme = useColorScheme();
  const [preference, setPreference] = useState<'light' | 'dark' | 'system'>('light');
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    // Load theme preference
    (async () => {
      try {
        const v = await SecureStore.getItemAsync('themePreference');
        if (v === 'light' || v === 'dark') {
          setPreference(v as any);
        } else {
          // Default to light if system or invalid value
          setPreference('light');
        }
      } catch (e) {
        setPreference('light');
      }
    })();

    // Check auth state
    supabase.auth.getSession().then(({ data }: any) => {
      if (mounted) setSignedIn(!!data?.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_e: any, sess: any) => {
      setSignedIn(!!sess);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const setPreferenceAndPersist = (p: 'light' | 'dark' | 'system') => {
    setPreference(p);
    SecureStore.setItemAsync('themePreference', p).catch(() => {});
  };

  const cycle = () => {
    const next = preference === 'light' ? 'dark' : 'light';
    setPreferenceAndPersist(next);
  };

  const colorScheme = preference === 'system' ? osScheme : preference;

  // Show loading screen while checking auth
  if (signedIn === null) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
          <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  // Show auth screen if not signed in
  if (!signedIn) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthScreen />
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>

      <View style={styles.toggleContainer} pointerEvents="box-none">
        <TouchableOpacity 
          onPress={cycle} 
          style={[
            styles.toggle,
            { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)' }
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, { color: colorScheme === 'dark' ? '#ECEDEE' : '#11181C' }]}>
            {preference === 'light' ? '☀️ Light' : '🌙 Dark'}
          </Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <InnerRoot />;
}

const styles = StyleSheet.create({
  toggleContainer: {
    position: 'absolute',
    left: 12,
    bottom: 100,
    zIndex: 999,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
