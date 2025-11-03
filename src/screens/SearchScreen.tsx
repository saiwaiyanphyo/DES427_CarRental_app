import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Button, FlatList, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

function isDec2025(_d: Date) { return true; }

type Car = { id: string; make: string; model: string; color: string; image_url?: string | null };

async function fetchAvailableCars(dayISO: string) {
  const { data, error } = await supabase.rpc('available_cars', { day: dayISO });
  if (error) throw error;
  return data as Car[];
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function bookCar(opts: { carId: string; dayISO: string; renterName: string; userId: string }) {
  const { error } = await supabase.from('bookings').insert({
    user_id: opts.userId,
    car_id: opts.carId,
    booking_date: opts.dayISO,
    renter_name: opts.renterName,
  });
  if (error?.code === '23505') throw new Error('That car is already booked on this date.');
  if (error) throw error;
}

export default function SearchScreen() {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [renterName, setRenterName] = useState('');
  const safeDate = isNaN(date.getTime()) ? new Date() : date;
  const dateISO = (isNaN(date.getTime()) ? new Date() : date).toISOString().slice(0,10);

  const formatDate = (d: Date) => {
    if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  async function onSearch() {
    try { setCars(await fetchAvailableCars(dateISO)); }
    catch (e: any) { Alert.alert('Error', e.message ?? 'Search failed'); }
  }

  function openConfirm(car: Car) {
    setSelectedCar(car);
    setConfirmVisible(true);
    // Pre-fill with email if available
    getUser().then((u) => setRenterName(u?.email ?? renterName));
  }

  async function confirmBooking() {
    const user = await getUser(); if (!user) return;
    const name = renterName.trim() || user.email || 'Guest';
    try {
      await bookCar({ carId: selectedCar!.id, dayISO: dateISO, renterName: name, userId: user.id });
      setConfirmVisible(false);
      Alert.alert('Booked', `Car booked for ${dateISO}`);
      onSearch();
    } catch (e:any) { Alert.alert('Failed', e.message ?? 'Could not book'); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select a date</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
        <Ionicons name="calendar-outline" size={22} color="#007AFF" style={styles.calendarIcon} />
        <Text style={styles.dateText}>{formatDate(safeDate)}</Text>
        <Ionicons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={safeDate}
          mode="date"
          onChange={(e: any, d) => {
            setShowPicker(false);
            if (d && !isNaN(d.getTime())) setDate(d);
          }}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      )}
      <TouchableOpacity style={styles.searchButton} onPress={onSearch} activeOpacity={0.8}>
        <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
        <Text style={styles.searchButtonText}>Search available cars</Text>
      </TouchableOpacity>
      <FlatList
        data={cars}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <CarRow car={item} onBook={() => openConfirm(item)} />
        )}
        ListEmptyComponent={<Text style={{ marginTop: 12 }}>No cars yet. Pick a date and search.</Text>}
      />

      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm booking</Text>
            {selectedCar ? (
              <Text style={styles.modalSubtitle}>{selectedCar.make} {selectedCar.model} • {selectedCar.color}•{formatDate(safeDate)}</Text>
            ) : null}
            <TextInput
              placeholder="Your name"
              value={renterName}
              onChangeText={setRenterName}
              style={styles.input}
              autoCapitalize="words"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setConfirmVisible(false)} style={[styles.actionBtn, { backgroundColor: '#eee' }]}> 
                <Text style={[styles.actionText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmBooking} style={styles.actionBtn}> 
                <Text style={styles.actionText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const PLACEHOLDER = 'https://placehold.co/160x120?text=Car';

function CarRow({ car, onBook }: { car: Car; onBook: () => void }) {
  const [failed, setFailed] = useState(false);
  const src = !failed && car.image_url ? { uri: car.image_url } : { uri: PLACEHOLDER };
  return (
    <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', gap: 12 }}>
      <Image source={src} onError={() => setFailed(true)} style={{ width: 80, height: 60, borderRadius: 6 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600' }}>{car.make} {car.model}</Text>
        <Text style={{ color: '#555', marginBottom: 6 }}>{car.color}</Text>
        <Button title="Book" onPress={onBook} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarIcon: {
    marginRight: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  modalSubtitle: { color: '#555', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 6,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  actionBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionText: { color: '#fff', fontWeight: '700' },
});