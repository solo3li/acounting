import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { deleteTokenAsync } from '../utils/AuthHelper';
import { useStore } from '../store/useStore';

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
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
      
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, User 👋</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAccounts} tintColor="#fff" />}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  logoutBtn: { color: '#e94560', fontSize: 16, marginTop: 5 },
  content: { padding: 20 },
  balanceCard: {
    padding: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceLabel: { color: '#aaa', fontSize: 16, marginBottom: 10 },
  balanceAmount: { color: '#4facfe', fontSize: 40, fontWeight: 'bold' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: {
    flex: 1,
    backgroundColor: '#0f3460',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
