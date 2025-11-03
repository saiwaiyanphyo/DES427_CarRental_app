import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, Image, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function MyRentalsScreen() {
  const [list, setList] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  return (
    <View style={s.container}>
      <Text style={s.title}>My Rentals</Text>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        contentContainerStyle={list.length === 0 ? s.centerEmpty : undefined}
        renderItem={({ item }) => (
          <RentalRow item={item} />
        )}
        ListEmptyComponent={<Text style={s.empty}>You haven't rented any cars yet.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const PLACEHOLDER = 'https://placehold.co/160x120?text=Car';

function formatDate(d: string) {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function RentalRow({ item }: any) {
  const [failed, setFailed] = useState(false);
  const src = !failed && item.car?.image_url ? { uri: item.car.image_url } : { uri: PLACEHOLDER };
  return (
    <View style={s.card}>
      <Image source={src} onError={() => setFailed(true)} style={s.image} />
      <View style={{ flex: 1 }}>
        <Text style={s.carTitle}>{item.car.make} {item.car.model}</Text>
        <Text style={s.subtle}>{item.car.color}</Text>
        <View style={s.row}>
          <Text style={s.metaLabel}>Date:</Text>
          <Text style={s.metaValue}>{formatDate(item.booking_date)}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.metaLabel}>Return:</Text>
          <Text style={s.metaValue}>{formatDate(item.expected_return_date)}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.metaLabel}>Renter:</Text>
          <Text style={s.metaValue}>{item.renter_name}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#222' },
  centerEmpty: { flexGrow: 1, justifyContent: 'center' },
  empty: { textAlign: 'center', color: '#666' },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaeaea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  image: { width: 96, height: 72, borderRadius: 8 },
  carTitle: { fontWeight: '700', fontSize: 16, color: '#222' },
  subtle: { color: '#777', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  metaLabel: { color: '#666', width: 64 },
  metaValue: { color: '#222', fontWeight: '500' },
});