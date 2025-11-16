import { Tabs } from 'expo-router';
import React from 'react';
import { Button, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: true,
        tabBarButton: HapticTab,
        headerRight: () => (
          <View style={{ marginRight: 10 }}>
            <Button title="Log out" onPress={() => supabase.auth.signOut()} />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Rentals',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
