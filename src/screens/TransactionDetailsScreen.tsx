import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';

export default function TransactionDetailsScreen({ route, navigation }: any) {
  const { transaction } = route.params;
  const { accounts } = useStore();

  const accName = accounts.find((a: any) => a.id === transaction.accountId)?.name || 'Unknown Account';
  const toAccName = transaction.toAccountId ? (accounts.find((a: any) => a.id === transaction.toAccountId)?.name || 'Unknown Account') : '-';

  let iconName: any = "arrow-up-outline";
  let iconColor = "#f87171";
  let iconBg = "rgba(248,113,113,0.15)";
  let amountPrefix = "-";

  if (transaction.type === 'Deposit') {
    iconName = "arrow-down-outline";
    iconColor = "#4ade80";
    iconBg = "rgba(74,222,128,0.15)";
    amountPrefix = "+";
  } else if (transaction.type === 'Transfer') {
    iconName = "swap-horizontal-outline";
    iconColor = "#a78bfa";
    iconBg = "rgba(167,139,250,0.15)";
    amountPrefix = "";
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#334155']} style={styles.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.amountContainer}>
          <View style={[styles.mainIconWrapper, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={40} color={iconColor} />
          </View>
          <Text style={styles.typeLabel}>{transaction.type}</Text>
          <Text style={[styles.amountValue, { color: iconColor }]}>
            {amountPrefix}${transaction.amount.toFixed(2)}
          </Text>
          <Text style={styles.dateLabel}>
            {new Date(transaction.date).toLocaleDateString()} {new Date(transaction.date).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Transaction ID</Text>
            <Text style={styles.rowValue}>#{transaction.id}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{transaction.type === 'Transfer' ? 'From Account' : 'Account'}</Text>
            <Text style={styles.rowValue}>{accName}</Text>
          </View>
          {transaction.type === 'Transfer' && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.rowLabel}>To Account</Text>
                <Text style={styles.rowValue}>{toAccName}</Text>
              </View>
            </>
          )}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Web Mgmt ID</Text>
            <Text style={styles.rowValue}>{transaction.webManagementId || '-'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Notes</Text>
            <Text style={styles.rowValue}>{transaction.notes || 'No notes provided'}</Text>
          </View>
        </View>

        {transaction.receiptImage && (
          <View style={styles.receiptContainer}>
            <Text style={styles.receiptTitle}>Attached Receipt</Text>
            <Image 
              source={{ uri: `data:image/jpeg;base64,${transaction.receiptImage}` }}
              style={styles.receiptImage} 
              resizeMode="contain" 
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  backBtn: { 
    width: 40, height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    alignItems: 'center', justifyContent: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f8fafc' },
  content: { padding: 20, paddingBottom: 60 },
  amountContainer: { alignItems: 'center', marginBottom: 30 },
  mainIconWrapper: { 
    width: 80, height: 80, 
    borderRadius: 40, 
    alignItems: 'center', justifyContent: 'center', 
    marginBottom: 15 
  },
  typeLabel: { fontSize: 16, color: '#94a3b8', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 },
  amountValue: { fontSize: 48, fontWeight: '900', marginBottom: 10, letterSpacing: -1 },
  dateLabel: { fontSize: 16, color: '#cbd5e1' },
  card: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 24, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowLabel: { fontSize: 16, color: '#94a3b8' },
  rowValue: { fontSize: 16, color: '#f8fafc', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  receiptContainer: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 24, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)'
  },
  receiptTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 15 },
  receiptImage: { width: '100%', height: 300, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.2)' }
});
