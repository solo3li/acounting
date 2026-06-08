import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { getTokenAsync } from '../utils/AuthHelper';
import { API_URL } from '../utils/config';
import { useStore } from '../store/useStore';

export default function AccountsScreen({ navigation }: any) {
  const { accounts, fetchAccounts, loading } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Bank Account');
  const [initialBalance, setInitialBalance] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async () => {
    if (!name || !type || !initialBalance) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    try {
      const token = await getTokenAsync();
      await axios.post(`${API_URL}/accounts`, {
        name, type, initialBalance: parseFloat(initialBalance) || 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalVisible(false);
      setName('');
      setInitialBalance('');
      fetchAccounts();
    } catch (e) {
      Alert.alert('Error', 'Failed to create account');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.headerBtn}>Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Accounts</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}><Text style={styles.headerBtn}>Add</Text></TouchableOpacity>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchAccounts}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardType}>{item.type}</Text>
            </View>
            <Text style={styles.cardBalance}>${item.currentBalance.toFixed(2)}</Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Account</Text>
            <TextInput style={styles.input} placeholder="Account Name" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Account Type (e.g. Instapay)" placeholderTextColor="#aaa" value={type} onChangeText={setType} />
            <TextInput style={styles.input} placeholder="Initial Balance" placeholderTextColor="#aaa" keyboardType="numeric" value={initialBalance} onChangeText={setInitialBalance} />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#333' }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#e94560' }]} onPress={handleAddAccount}>
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
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardType: { color: '#aaa', fontSize: 14, marginTop: 5 },
  cardBalance: { color: '#4facfe', fontSize: 20, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { padding: 20, backgroundColor: '#1a1a2e', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
