import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { getTokenAsync } from '../utils/AuthHelper';
import { API_URL } from '../utils/config';
import { useStore } from '../store/useStore';

export default function TransactionsScreen({ navigation }: any) {
  const { transactions, accounts, fetchTransactions, fetchAccounts, loading } = useStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterAccountId, setFilterAccountId] = useState<number | undefined>(undefined);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Deposit');
  const [accountId, setAccountId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAccounts();
    fetchTransactions(filterAccountId, filterType);
  }, [filterAccountId, filterType]);

  useEffect(() => {
    if (accounts.length > 0 && accountId === undefined) {
      setAccountId(accounts[0].id);
    }
  }, [accounts]);

  const handleAddTx = async () => {
    if (!amount || !accountId) {
      Alert.alert('Error', 'Amount and Account are required');
      return;
    }
    try {
      const token = await getTokenAsync();
      await axios.post(`${API_URL}/transactions`, {
        amount: parseFloat(amount),
        type,
        accountId,
        notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalVisible(false);
      setAmount('');
      setNotes('');
      fetchTransactions(filterAccountId, filterType);
      fetchAccounts(); // refresh balance
    } catch (e) {
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.headerBtn}>Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}><Text style={styles.headerBtn}>Add</Text></TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterBtn, filterAccountId === undefined && styles.filterBtnActive]}
            onPress={() => setFilterAccountId(undefined)}>
            <Text style={styles.filterText}>All Accounts</Text>
          </TouchableOpacity>
          {accounts.map(acc => (
            <TouchableOpacity 
              key={acc.id} 
              style={[styles.filterBtn, filterAccountId === acc.id && styles.filterBtnActive]}
              onPress={() => setFilterAccountId(acc.id)}>
              <Text style={styles.filterText}>{acc.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.typeFilters}>
          {['', 'Deposit', 'Withdraw'].map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeFilterBtn, filterType === t && styles.typeFilterBtnActive]}
              onPress={() => setFilterType(t)}>
              <Text style={styles.filterText}>{t || 'All Types'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={() => fetchTransactions(filterAccountId, filterType)}
        renderItem={({ item }) => {
          const accName = accounts.find(a => a.id === item.accountId)?.name || 'Unknown Account';
          return (
            <View style={styles.card}>
              <View>
                <Text style={[styles.cardType, { color: item.type === 'Deposit' ? '#4ade80' : '#f87171' }]}>{item.type}</Text>
                <Text style={styles.cardSub}>{accName} • {new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.cardAmount}>
                  {item.type === 'Deposit' ? '+' : '-'}${item.amount.toFixed(2)}
                </Text>
                {item.notes ? <Text style={styles.cardSub}>{item.notes}</Text> : null}
              </View>
            </View>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Transaction</Text>
            
            <View style={styles.typeSelector}>
              {['Deposit', 'Withdraw'].map(t => (
                <TouchableOpacity 
                  key={t} 
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={styles.btnText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {accounts.map(acc => (
                <TouchableOpacity 
                  key={acc.id} 
                  style={[styles.typeBtn, accountId === acc.id && styles.typeBtnActive]}
                  onPress={() => setAccountId(acc.id)}>
                  <Text style={styles.btnText}>{acc.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput style={styles.input} placeholder="Amount" placeholderTextColor="#aaa" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            <TextInput style={styles.input} placeholder="Notes" placeholderTextColor="#aaa" value={notes} onChangeText={setNotes} />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#333' }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#e94560' }]} onPress={handleAddTx}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerBtn: { color: '#4facfe', fontSize: 16 },
  filtersContainer: { paddingHorizontal: 20, marginBottom: 10 },
  filterScroll: { marginBottom: 10 },
  filterBtn: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, marginRight: 10 },
  filterBtnActive: { backgroundColor: '#e94560' },
  typeFilters: { flexDirection: 'row', justifyContent: 'space-between' },
  typeFilterBtn: { flex: 1, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, marginHorizontal: 5, alignItems: 'center' },
  typeFilterBtnActive: { backgroundColor: '#4facfe' },
  filterText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  list: { padding: 20, paddingTop: 0 },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, marginBottom: 15, borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  cardType: { fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: '#aaa', fontSize: 12, marginTop: 5 },
  cardAmount: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { padding: 20, backgroundColor: '#1a1a2e', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  typeSelector: { flexDirection: 'row', marginBottom: 20 },
  typeBtn: { padding: 15, alignItems: 'center', backgroundColor: '#333', marginHorizontal: 5, borderRadius: 10, minWidth: 100 },
  typeBtnActive: { backgroundColor: '#4facfe' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
