import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { getTokenAsync, deleteTokenAsync } from '../utils/AuthHelper';
import { API_URL } from '../utils/config';

export default function DashboardScreen({ navigation, setToken }: any) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getTokenAsync();
      const res = await axios.get(`${API_URL}/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const totalBalance = res.data.reduce((acc: number, accItem: any) => acc + accItem.currentBalance, 0);
      setBalance(totalBalance);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setToken(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
      
      <ScrollView 
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#fff" />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.glassCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Accounts')}>
            <Text style={styles.actionText}>Manage Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.actionText}>Transactions</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.actionBtn, { marginTop: 10 }]} onPress={() => navigation.navigate('Reports')}>
          <Text style={styles.actionText}>View Reports</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scrollContent: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  logoutBtn: { padding: 10, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 8 },
  logoutText: { color: '#e94560', fontWeight: 'bold' },
  glassCard: {
    padding: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: { fontSize: 16, color: '#e0e0e0', marginBottom: 10 },
  balanceAmount: { fontSize: 40, fontWeight: 'bold', color: '#4facfe' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
