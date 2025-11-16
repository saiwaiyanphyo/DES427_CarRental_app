import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, Image, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { AppColors } from '../../constants/theme';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function MyRentalsScreen() {
  const osScheme = useColorScheme();
  const [preference, setPreference] = useState<'light' | 'dark' | 'system'>('system');
  const [list, setList] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load theme preference with immediate fallback
  useEffect(() => {
    loadThemePreference();
    
    // Check for theme changes every 500ms for immediate updates
    const themeCheckInterval = setInterval(() => {
      loadThemePreference();
    }, 500);

    return () => clearInterval(themeCheckInterval);
  }, []);

  // Refresh theme when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadThemePreference();
      load();
    }, [])
  );

  async function loadThemePreference() {
    try {
      const v = await SecureStore.getItemAsync('themePreference');
      if (v === 'light' || v === 'dark' || v === 'system') {
        if (v !== preference) {
          setPreference(v as any);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const colorScheme = preference === 'system' ? (osScheme ?? 'light') : preference;
  const colors = colorScheme === 'dark' ? AppColors.dark : AppColors.light;

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('bookings')
      .select(`id, booking_date, renter_name, expected_return_date, car:car_id (make, model, color, image_url)`) 
      .eq('user_id', user.id)
      .order('booking_date', { ascending: true });
    if (error) Alert.alert('Error', error.message);
    else setList(data ?? []);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Text style={[s.title, { color: '#007AFF' }]}>My Rentals</Text>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        contentContainerStyle={list.length === 0 ? s.centerEmpty : undefined}
        renderItem={({ item }) => (
          <RentalRow item={item} colors={colors} />
        )}
        ListEmptyComponent={<Text style={[s.empty, { color: colors.textSecondary }]}>You haven't rented any cars yet.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}const PLACEHOLDER = 'https://placehold.co/160x120?text=Car';

function formatDate(d: string) {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function RentalRow({ item, colors }: any) {
  const [failed, setFailed] = useState(false);
  const src = !failed && item.car?.image_url ? { uri: item.car.image_url } : { uri: PLACEHOLDER };
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image source={src} onError={() => setFailed(true)} style={s.image} />
      <View style={{ flex: 1 }}>
        <Text style={[s.carTitle, { color: colors.text }]}>{item.car.make} {item.car.model}</Text>
        <Text style={[s.subtle, { color: colors.textSecondary }]}>{item.car.color}</Text>
        <View style={s.row}>
          <Text style={[s.metaLabel, { color: colors.textSecondary }]}>Date:</Text>
          <Text style={[s.metaValue, { color: colors.text }]}>{formatDate(item.booking_date)}</Text>
        </View>
        <View style={s.row}>
          <Text style={[s.metaLabel, { color: colors.textSecondary }]}>Return:</Text>
          <Text style={[s.metaValue, { color: colors.text }]}>{formatDate(item.expected_return_date)}</Text>
        </View>
        <View style={s.row}>
          <Text style={[s.metaLabel, { color: colors.textSecondary }]}>Renter:</Text>
          <Text style={[s.metaValue, { color: colors.text }]}>{item.renter_name}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  centerEmpty: { flexGrow: 1, justifyContent: 'center' },
  empty: { textAlign: 'center' },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  image: { width: 96, height: 72, borderRadius: 8 },
  carTitle: { fontWeight: '700', fontSize: 16 },
  subtle: { marginBottom: 6 },
  row: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  metaLabel: { width: 64 },
  metaValue: { fontWeight: '500' },
});