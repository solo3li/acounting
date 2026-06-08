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
  const { accounts, transactions, fetchAccounts, fetchTransactions, loading } = useStore();
  const [exportLoading, setExportLoading] = React.useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const exportPDF = async () => {
    setExportLoading(true);
    try {
      if (!transactions || transactions.length === 0) {
        Alert.alert('Info', 'No transactions to export.');
        setExportLoading(false);
        return;
      }

      const accountRows = accounts.map((a: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 12px;">${a.id}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${a.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${a.type}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">$${(a.initialBalance || 0).toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold;">$${a.currentBalance.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 12px;">${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</td>
        </tr>
      `).join('');

      const totalBalance = accounts.reduce((sum: number, a: any) => sum + a.currentBalance, 0);

      const rows = transactions.map((t: any) => {
        const accName = accounts.find((a: any) => a.id === t.accountId)?.name || 'Unknown';
        const toAccName = t.toAccountId ? (accounts.find((a: any) => a.id === t.toAccountId)?.name || 'Unknown') : '-';
        return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 12px;">${t.id}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${new Date(t.date).toLocaleDateString()} ${new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; color:${t.type === 'Deposit' ? 'green' : t.type === 'Withdraw' ? 'red' : 'blue'}">${t.type}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${accName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${toAccName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 12px;">${t.webManagementId || '-'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold;">$${t.amount.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 12px;">${t.notes || ''}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 12px;">${t.receiptImage ? 'Yes' : 'No'}</td>
        </tr>
        `;
      }).join('');

      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #333;">Cashflow Report</h1>
            <p style="color: #666;">Generated on ${new Date().toLocaleDateString()}</p>
            
            <h2 style="color: #444; margin-top: 30px; border-bottom: 2px solid #ddd; padding-bottom: 5px;">Accounts Summary</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-size: 14px;">ID</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-size: 14px;">Account Name</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-size: 14px;">Type</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-size: 14px;">Init Balance</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-size: 14px;">Curr Balance</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-size: 14px;">Created</th>
              </tr>
              ${accountRows}
              <tr style="background-color: #e2e8f0;">
                <td colspan="4" style="padding: 12px; text-align: right; font-weight: bold;">Total Balance:</td>
                <td colspan="2" style="padding: 12px; font-weight: bold; color: #0f172a;">$${totalBalance.toFixed(2)}</td>
              </tr>
            </table>

            <h2 style="color: #444; margin-top: 40px; border-bottom: 2px solid #ddd; padding-bottom: 5px;">Transactions History</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">ID</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Date & Time</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Type</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">From Account</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">To Account</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Web Mgmt ID</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Amount</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Notes</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Receipt</th>
              </tr>
              ${rows}
            </table>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
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
      if (!transactions || transactions.length === 0) {
        Alert.alert('Info', 'No transactions to export.');
        setExportLoading(false);
        return;
      }

      const wsAccounts = XLSX.utils.json_to_sheet(accounts.map((a: any) => ({
        "ID": a.id,
        "Account Name": a.name,
        "Account Type": a.type,
        "Initial Balance": a.initialBalance || 0,
        "Current Balance": a.currentBalance,
        "Created At": a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''
      })));

      const wsTransactions = XLSX.utils.json_to_sheet(transactions.map((t: any) => ({
        "ID": t.id,
        "Date": new Date(t.date).toLocaleDateString(),
        "Time": new Date(t.date).toLocaleTimeString(),
        "Type": t.type,
        "From Account": accounts.find((a: any) => a.id === t.accountId)?.name || 'Unknown',
        "To Account": t.toAccountId ? (accounts.find((a: any) => a.id === t.toAccountId)?.name || 'Unknown') : '-',
        "Web Mgmt ID": t.webManagementId || '-',
        "Amount": t.amount,
        "Notes": t.notes || '',
        "Has Receipt": t.receiptImage ? 'Yes' : 'No'
      })));
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsAccounts, "Accounts Summary");
      XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions");
      
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const uri = FileSystem.cacheDirectory + 'cashflow_report.xlsx';
      
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + wbout;
        link.download = 'cashflow_report.xlsx';
        link.click();
      } else {
        await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
        await Sharing.shareAsync(uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Export Cashflow Report'
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
          <Text style={styles.greetingSub}>صباح الخير،</Text>
          <Text style={styles.greeting}>مستخدم 👋</Text>
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
          <Text style={styles.balanceLabel}>إجمالي الرصيد</Text>
          <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('الحسابات')}>
            <LinearGradient colors={['#38bdf8', '#0284c7']} style={styles.actionBtnGradient}>
              <Ionicons name="wallet-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>الحسابات</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('المعاملات')}>
            <LinearGradient colors={['#a78bfa', '#7c3aed']} style={styles.actionBtnGradient}>
              <Ionicons name="swap-horizontal-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>المعاملات</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>التقارير والتصدير</Text>
        
        {exportLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loadingText}>جاري إنشاء التقرير...</Text>
          </View>
        ) : (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionBtn} onPress={exportPDF}>
              <LinearGradient colors={['rgba(244,63,94,0.1)', 'rgba(225,29,72,0.05)']} style={[styles.actionBtnGradient, { borderColor: 'rgba(244,63,94,0.3)', borderWidth: 1 }]}>
                <Ionicons name="document-text" size={28} color="#fb7185" />
                <Text style={[styles.actionText, { color: '#fb7185' }]}>تصدير PDF</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={exportExcel}>
              <LinearGradient colors={['rgba(16,185,129,0.1)', 'rgba(5,150,105,0.05)']} style={[styles.actionBtnGradient, { borderColor: 'rgba(16,185,129,0.3)', borderWidth: 1 }]}>
                <Ionicons name="grid" size={28} color="#34d399" />
                <Text style={[styles.actionText, { color: '#34d399' }]}>تصدير Excel</Text>
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
