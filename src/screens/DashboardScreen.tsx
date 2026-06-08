import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { deleteTokenAsync } from '../utils/AuthHelper';
import { useStore } from '../store/useStore';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation, setToken }: any) {
  const { accounts, fetchAccounts, loading } = useStore();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  const handleLogout = async () => {
    await deleteTokenAsync();
    setToken(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#334155']} style={styles.background} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingSub}>Good morning,</Text>
          <Text style={styles.greeting}>User 👋</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#f87171" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAccounts} tintColor="#38bdf8" />}
      >
        <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']} style={styles.balanceCard}>
          <View style={styles.glassHighlight} />
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Accounts')}>
            <LinearGradient colors={['#38bdf8', '#0284c7']} style={styles.actionBtnGradient}>
              <Ionicons name="wallet-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>Accounts</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Transactions')}>
            <LinearGradient colors={['#a78bfa', '#7c3aed']} style={styles.actionBtnGradient}>
              <Ionicons name="swap-horizontal-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>Transfer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.actionBtnFull} onPress={() => navigation.navigate('Reports')}>
          <LinearGradient colors={['#fb7185', '#e11d48']} style={styles.actionBtnGradientFull}>
            <Ionicons name="pie-chart-outline" size={28} color="#fff" style={{ marginRight: 15 }} />
            <Text style={styles.actionTextFull}>View Detailed Reports</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, paddingTop: 60 },
  greetingSub: { fontSize: 14, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#f8fafc', marginTop: 2 },
  logoutBtn: { padding: 10, backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 12 },
  content: { padding: 20, paddingBottom: 100 },
  balanceCard: {
    padding: 35,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 35,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  glassHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  balanceLabel: { color: '#cbd5e1', fontSize: 16, marginBottom: 10, fontWeight: '500' },
  balanceAmount: { color: '#f8fafc', fontSize: 48, fontWeight: '900', letterSpacing: -1 },
  sectionTitle: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginBottom: 15, paddingLeft: 5 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  actionBtn: { flex: 1, marginHorizontal: 5, borderRadius: 20, overflow: 'hidden' },
  actionBtnGradient: { padding: 25, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 10 },
  actionBtnFull: { marginHorizontal: 5, borderRadius: 20, overflow: 'hidden' },
  actionBtnGradientFull: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionTextFull: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
