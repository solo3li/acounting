import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import { API_URL } from '../utils/config';
import { getTokenAsync } from '../utils/AuthHelper';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen() {
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    const token = await getTokenAsync();
    const res = await axios.get(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  };

  const exportPDF = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const exportExcel = async () => {
    setLoading(true);
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
        // Simple download trigger for web
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
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#334155']} style={styles.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports & Exports</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.desc}>
          Download your complete transaction history to analyze your finances or share with your accountant.
        </Text>

        <TouchableOpacity style={styles.card} onPress={exportPDF} disabled={loading}>
          <LinearGradient colors={['rgba(244,63,94,0.1)', 'rgba(225,29,72,0.05)']} style={styles.cardGradient}>
            <View style={styles.iconContainerPDF}>
              <Ionicons name="document-text" size={32} color="#fb7185" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Export as PDF</Text>
              <Text style={styles.cardSub}>Best for printing and sharing</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={exportExcel} disabled={loading}>
          <LinearGradient colors={['rgba(16,185,129,0.1)', 'rgba(5,150,105,0.05)']} style={styles.cardGradient}>
            <View style={styles.iconContainerExcel}>
              <Ionicons name="grid" size={32} color="#34d399" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Export as Excel</Text>
              <Text style={styles.cardSub}>Best for custom analysis</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </LinearGradient>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loadingText}>Generating Report...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { padding: 25, paddingTop: 60, paddingBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#f8fafc' },
  content: { padding: 20 },
  desc: { color: '#94a3b8', fontSize: 16, lineHeight: 24, marginBottom: 30 },
  card: { marginBottom: 20, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  iconContainerPDF: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(244,63,94,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  iconContainerExcel: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  cardTextContainer: { flex: 1 },
  cardTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardSub: { color: '#94a3b8', fontSize: 14 },
  loadingContainer: { alignItems: 'center', marginTop: 40 },
  loadingText: { color: '#38bdf8', marginTop: 15, fontWeight: '600' }
});
