import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, View } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import AuthScreen from '../../src/screens/AuthScreen';
import MyRentalsScreen from '../../src/screens/MyRentalsScreen';
import SearchScreen from '../../src/screens/SearchScreen';

const Tab = createBottomTabNavigator();

export default function Index() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

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

  if (signedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!signedIn) return <AuthScreen />;

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => (
          <Button title="Log out" onPress={() => supabase.auth.signOut()} />
        ),
      }}
    >
      <Tab.Screen
        name="MyRentals"
        component={MyRentalsScreen}
        options={{
          title: 'My Rentals',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}