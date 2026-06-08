import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { getTokenAsync } from '../utils/AuthHelper';
import { API_URL } from '../utils/config';

export default function TransactionsScreen({ navigation }: any) {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Deposit');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      const token = await getTokenAsync();
      const [txRes, accRes] = await Promise.all([
        axios.get(`${API_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/accounts`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTransactions(txRes.data);
      setAccounts(accRes.data);
      if (accRes.data.length > 0) setAccountId(accRes.data[0].id.toString());
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTx = async () => {
    if (!amount || !accountId) return;
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_URL}/transactions`, {
        amount: parseFloat(amount),
        type,
        accountId: parseInt(accountId),
        notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalVisible(false);
      setAmount('');
      setNotes('');
      fetchData();
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

      <FlatList
        data={transactions}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={[styles.cardType, { color: item.type === 'Deposit' ? '#4ade80' : '#f87171' }]}>{item.type}</Text>
              <Text style={styles.cardSub}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardAmount}>
                {item.type === 'Deposit' ? '+' : '-'}${item.amount.toFixed(2)}
              </Text>
              {item.notes ? <Text style={styles.cardSub}>{item.notes}</Text> : null}
            </View>
          </View>
        )}
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
  list: { padding: 20 },
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
  typeBtn: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: '#333', marginHorizontal: 5, borderRadius: 10 },
  typeBtnActive: { backgroundColor: '#4facfe' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
