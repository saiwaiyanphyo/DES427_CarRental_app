import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useEffect } from 'react';
import { Alert, Button, FlatList, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { AppColors } from '../../constants/theme';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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
  const osScheme = useColorScheme();
  const [preference, setPreference] = useState<'light' | 'dark' | 'system'>('system');
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [renterName, setRenterName] = useState('');
  const [sortByBrand, setSortByBrand] = useState(false);

  // Load theme preference with immediate fallback
  useEffect(() => {
    loadThemePreference();
    
    // Check for theme changes every 200ms for immediate updates
    const themeCheckInterval = setInterval(() => {
      loadThemePreference();
    }, 200);

    return () => clearInterval(themeCheckInterval);
  }, []);

  async function loadThemePreference() {
    try {
      const v = await SecureStore.getItemAsync('themePreference');
      if (v === 'light' || v === 'dark' || v === 'system') {
        if (v !== preference) {
          setPreference(v);
        }
      }
      setThemeLoaded(true);
    } catch (e) {
      setPreference('light'); // Default to light on error
      setThemeLoaded(true);
    }
  }

  const colorScheme = preference === 'system' ? (osScheme || 'light') : preference;
  const colors = colorScheme === 'dark' ? AppColors.dark : AppColors.light;
  const safeDate = isNaN(date.getTime()) ? new Date() : date;
  const dateISO = (isNaN(date.getTime()) ? new Date() : date).toISOString().slice(0,10);

  const formatDate = (d: Date) => {
    if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  async function onSearch() {
    try {
      const data = await fetchAvailableCars(dateISO);
      const result = sortByBrand ? [...data].sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model)) : data;
      setCars(result);
    } catch (e: any) { Alert.alert('Error', e.message ?? 'Search failed'); }
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

  // Wait for theme to load to prevent flash
  if (!themeLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Empty view while loading theme */}
      </View>
    );
  }

  // Debug: Force colors to ensure they're applied
  const containerStyle = {
    ...styles.container,
    backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5'
  };

  return (
    <View style={containerStyle}>
      <Text style={[styles.label, { color: colors.text }]}>Select a date</Text>
      <TouchableOpacity style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
        <Ionicons name="calendar-outline" size={22} color={colors.primary} style={styles.calendarIcon} />
        <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(safeDate)}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
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
      <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.primary }]} onPress={onSearch} activeOpacity={0.8}>
        <Ionicons name="search" size={20} color={colors.buttonText} style={styles.searchIcon} />
        <Text style={[styles.searchButtonText, { color: colors.buttonText }]}>Search available cars</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity onPress={() => { const next = !sortByBrand; setSortByBrand(next); setCars(prev => next ? [...prev].sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model)) : prev); }} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: sortByBrand ? colors.primary : colors.border, backgroundColor: sortByBrand ? (colors.primary + '20') : colors.surface }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Sort by brand</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={cars}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <CarRow car={item} onBook={() => openConfirm(item)} colors={colors} />
        )}
        ListEmptyComponent={<Text style={{ marginTop: 12, color: colors.textSecondary, textAlign: 'center', marginHorizontal: 16 }}>No cars yet. Pick a date and search.</Text>}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.modalBackdrop }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm booking</Text>
            {selectedCar ? (
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{selectedCar.make} {selectedCar.model} • {selectedCar.color}•{formatDate(safeDate)}</Text>
            ) : null}
            <TextInput
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
              value={renterName}
              onChangeText={setRenterName}
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
              autoCapitalize="words"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setConfirmVisible(false)} style={[styles.actionBtn, { backgroundColor: colors.border }]}> 
                <Text style={[styles.actionText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmBooking} style={[styles.actionBtn, { backgroundColor: colors.primary }]}> 
                <Text style={[styles.actionText, { color: colors.buttonText }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const PLACEHOLDER = 'https://placehold.co/160x120?text=Car';

function CarRow({ car, onBook, colors }: { car: Car; onBook: () => void; colors: any }) {
  const [failed, setFailed] = useState(false);
  const src = !failed && car.image_url ? { uri: car.image_url } : { uri: PLACEHOLDER };
  return (
    <View style={[
      carCardStyles.container,
      { 
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow
      }
    ]}>
      <Image 
        source={src} 
        onError={() => setFailed(true)} 
        style={carCardStyles.image} 
      />
      <View style={carCardStyles.content}>
        <View style={carCardStyles.header}>
          <Text style={[carCardStyles.title, { color: colors.text }]}>
            {car.make} {car.model}
          </Text>
          <View style={[carCardStyles.colorBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[carCardStyles.colorText, { color: colors.primary }]}>
              {car.color}
            </Text>
          </View>
        </View>
        <View style={carCardStyles.footer}>
          <TouchableOpacity 
            onPress={onBook}
            style={[carCardStyles.bookButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[carCardStyles.bookButtonText, { color: colors.buttonText }]}>
              Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const carCardStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  colorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  colorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bookButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
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
    fontWeight: '500',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSubtitle: { marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionText: { fontWeight: '700' },
});