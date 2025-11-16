import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { AppColors } from '../../constants/theme';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const osScheme = useColorScheme();
  const [preference, setPreference] = useState<'light' | 'dark' | 'system'>('light');

  // Always use light theme for login screen
  const colors = AppColors.light;

  const validatePassword = (password: string) => {
    if (mode === 'login') return true;
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasNumber) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    
    if (!hasSpecialChar) {
      setPasswordError('Password must contain at least one special character');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  async function submit() {
    if (!validatePassword(password)) {
      return;
    }
    
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  const styles = createStyles(colors);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="car-sport" size={60} color={colors.primary} />
          </View>
          <Text style={styles.title}>Car Rental</Text>
          <Text style={styles.subtitle}>Your journey starts here</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput 
              placeholder="Email address" 
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none" 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput 
              placeholder="Password" 
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              style={styles.input} 
              value={password} 
              onChangeText={(text) => {
                setPassword(text);
                if (mode === 'signup' && passwordError) {
                  validatePassword(text);
                }
              }}
              autoComplete="password"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          {mode === 'signup' && (
            <View>
              {passwordError ? (
                <Text style={styles.passwordError}>
                  {passwordError}
                </Text>
              ) : (
                <Text style={styles.passwordHint}>
                  Password must be at least 6 characters with one number and one special character (!@#$%^&*)
                </Text>
              )}
            </View>
          )}

          {/* Primary Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.buttonDisabled]} 
            onPress={submit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={styles.primaryButtonText}>Loading...</Text>
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Secondary Button */}
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setPasswordError('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: typeof AppColors.light) {
  return StyleSheet.create({
    container: { 
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    title: { 
      fontSize: 32, 
      fontWeight: '700', 
      marginBottom: 8,
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '400',
    },
    formContainer: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      marginBottom: 16,
      paddingHorizontal: 16,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: { 
      flex: 1,
      paddingVertical: 16,
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    eyeIcon: {
      padding: 4,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    passwordHint: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '400',
      marginBottom: 16,
      marginTop: -8,
      paddingHorizontal: 4,
    },
    passwordError: {
      color: '#FF6B6B',
      fontSize: 12,
      fontWeight: '400',
      marginBottom: 16,
      marginTop: -8,
      paddingHorizontal: 4,
    },
  });
}