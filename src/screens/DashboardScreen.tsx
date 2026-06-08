import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import axios from 'axios';
import { API_URL } from '../utils/config';
import { getTokenAsync, deleteTokenAsync } from '../utils/AuthHelper';
import { useStore } from '../store/useStore';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation, setToken }: any) {
  const { accounts, fetchAccounts, loading } = useStore();
  const [exportLoading, setExportLoading] = React.useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchTransactions = async () => {
    const token = await getTokenAsync();
    const res = await axios.get(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  };

  const exportPDF = async () => {
    setExportLoading(true);
    try {
      const data = await fetchTransactions();
      const rows = data.map((t: any) => `
        <tr>
          <td>${new Date(t.date).toLocaleDateString()}</td>
          <td style="color:${t.type === 'Deposit' ? 'green' : 'red'}">${t.type}</td>
          <td>$${t.amount.toFixed(2)}</td>
          <td>${t.notes || ''}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #333;">Transactions Report</h1>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Type</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Amount</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Notes</th>
              </tr>
              ${rows}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'web') {
        window.open(uri);
      } else {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
    setExportLoading(false);
  };

  const exportExcel = async () => {
    setExportLoading(true);
    try {
      const data = await fetchTransactions();
      const ws = XLSX.utils.json_to_sheet(data.map((t: any) => ({
        Date: new Date(t.date).toLocaleDateString(),
        Type: t.type,
        Amount: t.amount,
        Notes: t.notes
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const uri = FileSystem.cacheDirectory + 'transactions.xlsx';
      
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + wbout;
        link.download = 'transactions.xlsx';
        link.click();
      } else {
        await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
        await Sharing.shareAsync(uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Export Transactions'
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to generate Excel file');
    }
    setExportLoading(false);
  };

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
        <Text style={styles.sectionTitle}>Reports & Exports</Text>
        
        {exportLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loadingText}>Generating Report...</Text>
          </View>
        ) : (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionBtn} onPress={exportPDF}>
              <LinearGradient colors={['rgba(244,63,94,0.1)', 'rgba(225,29,72,0.05)']} style={[styles.actionBtnGradient, { borderColor: 'rgba(244,63,94,0.3)', borderWidth: 1 }]}>
                <Ionicons name="document-text" size={28} color="#fb7185" />
                <Text style={[styles.actionText, { color: '#fb7185' }]}>Export PDF</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={exportExcel}>
              <LinearGradient colors={['rgba(16,185,129,0.1)', 'rgba(5,150,105,0.05)']} style={[styles.actionBtnGradient, { borderColor: 'rgba(16,185,129,0.3)', borderWidth: 1 }]}>
                <Ionicons name="grid" size={28} color="#34d399" />
                <Text style={[styles.actionText, { color: '#34d399' }]}>Export Excel</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
  actionBtnGradient: { padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 110 },
  actionText: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  actionBtnFull: { borderRadius: 20, overflow: 'hidden', marginTop: 5 },
  actionBtnGradientFull: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'center' },
  actionTextFull: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  loadingText: { color: '#38bdf8', marginTop: 15, fontWeight: '600' }
});
