import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getTokenAsync, deleteTokenAsync } from '../utils/AuthHelper';
import { API_URL } from '../utils/config';

export default function SettingsScreen({ setToken }: any) {
  const [telegramToken, setTelegramToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = await getTokenAsync();
      const res = await axios.get(`${API_URL}/settings/telegram`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTelegramToken(res.data.token || '');
    } catch (e) {
      console.error('Failed to fetch settings', e);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const token = await getTokenAsync();
      await axios.post(`${API_URL}/settings/telegram`, { token: telegramToken }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Telegram Bot Token saved successfully!');
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || 'Failed to save settings.';
      Alert.alert('Error', errorMsg);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await deleteTokenAsync();
    setToken(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#334155']} style={styles.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="logo-closed-captioning" size={20} /> Telegram Bot Integration
          </Text>
          <Text style={styles.cardDesc}>
            Connect your own Telegram Bot to talk to your AI financial assistant! Create a bot using @BotFather on Telegram and paste the token here.
          </Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="key-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Telegram Bot Token..."
              placeholderTextColor="#64748b"
              value={telegramToken}
              onChangeText={setTelegramToken}
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={saveSettings} disabled={loading}>
            <LinearGradient colors={['#38bdf8', '#0284c7']} style={styles.saveBtnGradient}>
              <Text style={styles.btnText}>{loading ? 'Saving...' : 'Save Bot Token'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#f87171" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { padding: 25, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#f8fafc' },
  content: { padding: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 10 },
  cardDesc: { color: '#94a3b8', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 16, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#f8fafc', paddingVertical: 15, fontSize: 14 },
  saveBtn: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  saveBtnGradient: { padding: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, marginTop: 40, backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)' },
  logoutText: { color: '#f87171', fontWeight: 'bold', fontSize: 18 }
});
