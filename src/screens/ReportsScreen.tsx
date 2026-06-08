import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { getTokenAsync } from '../utils/AuthHelper';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import { API_URL } from '../utils/config';

export default function ReportsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);

  const exportPDF = async () => {
    setLoading(true);
    try {
      const token = await getTokenAsync();
      const res = await axios.get(`${API_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
      
      let html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; color: #333; }
              h1 { color: #333; text-align: center; }
            </style>
          </head>
          <body>
            <h1>Cashflow Report</h1>
            <table>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Notes</th>
              </tr>`;

      res.data.forEach((tx: any) => {
        html += `
              <tr>
                <td>${new Date(tx.date).toLocaleDateString()}</td>
                <td>${tx.type}</td>
                <td>$${tx.amount.toFixed(2)}</td>
                <td>${tx.notes || ''}</td>
              </tr>`;
      });

      html += `
            </table>
          </body>
        </html>`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share PDF Report' });
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    setLoading(true);
    try {
      const token = await getTokenAsync();
      const res = await axios.get(`${API_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
      
      const data = res.data.map((tx: any) => ({
        Date: new Date(tx.date).toLocaleDateString(),
        Type: tx.type,
        Amount: tx.amount,
        Notes: tx.notes || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const uri = FileSystem.cacheDirectory + 'CashflowReport.xlsx';
      
      await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(uri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: 'Share Excel Report' });
    } catch (e) {
      Alert.alert('Error', 'Failed to generate Excel file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.headerBtn}>Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.infoText}>Generate your transaction reports.</Text>
        
        <TouchableOpacity style={styles.actionBtn} onPress={exportPDF} disabled={loading}>
          <Text style={styles.actionText}>{loading ? 'Generating...' : 'Export to PDF'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]} onPress={exportExcel} disabled={loading}>
          <Text style={styles.actionText}>{loading ? 'Generating...' : 'Export to Excel'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerBtn: { color: '#4facfe', fontSize: 16 },
  content: { padding: 20, flex: 1, justifyContent: 'center' },
  infoText: { color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 40 },
  actionBtn: {
    backgroundColor: '#e94560',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
