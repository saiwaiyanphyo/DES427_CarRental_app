import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login'|'signup'>('login');

  async function submit() {
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        Alert.alert('Signed up', 'Check your email if confirmation is enabled.');
      }
    } catch (e:any) {
      Alert.alert('Auth error', e.message ?? 'Failed');
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Car Rental</Text>
      <TextInput placeholder="Email" autoCapitalize="none" style={s.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry style={s.input} value={password} onChangeText={setPassword} />
      <Button title={mode === 'login' ? 'Login' : 'Sign up'} onPress={submit} />
      <View style={{ height: 10 }} />
      <Button title={mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Login'}
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
});