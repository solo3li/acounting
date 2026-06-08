import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getTokenAsync } from '../utils/AuthHelper';
import { API_URL } from '../utils/config';
import { useStore } from '../store/useStore';

export default function AccountDetailsScreen({ route, navigation }: any) {
  const { account } = route.params;
  const { fetchAccounts } = useStore();
  
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [metrics, setMetrics] = useState({
    todayDeposits: 0,
    todayWithdrawals: 0,
    totalVolume: 0,
  });

  useEffect(() => {
    fetchAccountMetrics();
  }, []);

  const fetchAccountMetrics = async () => {
    try {
      setLoading(true);
      const token = await getTokenAsync();
      const response = await axios.get(`${API_URL}/transactions?accountId=${account.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const transactions = response.data;
      
      // Calculate metrics
      let todayDep = 0;
      let todayWith = 0;
      let totalVol = 0;
      
      const today = new Date().toISOString().split('T')[0];
      
      transactions.forEach((tx: any) => {
        const txDate = tx.date.split('T')[0];
        
        // Total volume (absolute sum of all activities)
        totalVol += Math.abs(tx.amount);
        
        if (txDate === today) {
          if (tx.type === 'Deposit') {
            todayDep += tx.amount;
          } else if (tx.type === 'Withdraw') {
            todayWith += tx.amount;
          }
        }
      });
      
      setMetrics({
        todayDeposits: todayDep,
        todayWithdrawals: todayWith,
        totalVolume: totalVol,
      });
      
    } catch (e) {
      console.error('Failed to fetch transactions', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا الحساب؟ سيتم حذف جميع المعاملات المرتبطة به نهائياً ولا يمكن التراجع عن هذه العملية.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف نهائياً', 
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const token = await getTokenAsync();
              await axios.delete(`${API_URL}/accounts/${account.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              // Refresh accounts in the store and go back
              await fetchAccounts();
              navigation.goBack();
            } catch (e) {
              console.error('Failed to delete account', e);
              Alert.alert('خطأ', 'فشل في حذف الحساب. يرجى المحاولة لاحقاً.');
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#334155']} style={styles.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل المحفظة</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Info Card */}
        <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="wallet" size={32} color="#38bdf8" />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <Text style={styles.cardTitle}>{account.name}</Text>
              <Text style={styles.cardType}>{account.type}</Text>
            </View>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>الرصيد الحالي</Text>
            <Text style={styles.cardBalance}>${account.currentBalance.toFixed(2)}</Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>إحصائيات العمليات</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 30 }} />
        ) : (
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Ionicons name="arrow-down-circle" size={28} color="#4ade80" />
              <Text style={styles.metricValue}>${metrics.todayDeposits.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>إيداعات اليوم</Text>
            </View>

            <View style={styles.metricCard}>
              <Ionicons name="arrow-up-circle" size={28} color="#f87171" />
              <Text style={styles.metricValue}>${metrics.todayWithdrawals.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>سحوبات اليوم</Text>
            </View>

            <View style={[styles.metricCard, { width: '100%', marginTop: 15 }]}>
              <Ionicons name="stats-chart" size={28} color="#c084fc" />
              <Text style={styles.metricValue}>${metrics.totalVolume.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>إجمالي حجم العمليات (تاريخياً)</Text>
            </View>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>منطقة الخطر</Text>
          <Text style={styles.dangerDesc}>حذف الحساب سيؤدي إلى مسح جميع السجلات والعمليات المرتبطة به نهائياً.</Text>
          
          <TouchableOpacity 
            style={[styles.deleteBtn, deleting && { opacity: 0.7 }]} 
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.deleteBtnText}>إلغاء الحساب</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#f8fafc' },
  backBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 100 },
  card: { padding: 25, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 30 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cardIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(56,189,248,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTitle: { color: '#f8fafc', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  cardType: { color: '#94a3b8', fontSize: 15 },
  balanceContainer: { alignItems: 'flex-start', marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 15 },
  balanceLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 5 },
  cardBalance: { color: '#38bdf8', fontSize: 32, fontWeight: '900' },
  sectionTitle: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metricCard: { width: '47%', backgroundColor: 'rgba(15,23,42,0.6)', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  metricValue: { color: '#f8fafc', fontSize: 22, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  metricLabel: { color: '#94a3b8', fontSize: 13, textAlign: 'center' },
  dangerZone: { marginTop: 40, backgroundColor: 'rgba(239,68,68,0.05)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  dangerTitle: { color: '#f87171', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  dangerDesc: { color: '#fca5a5', fontSize: 13, marginBottom: 20, lineHeight: 20 },
  deleteBtn: { flexDirection: 'row', backgroundColor: '#ef4444', padding: 15, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
