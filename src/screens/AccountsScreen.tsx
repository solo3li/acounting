import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { getTokenAsync } from '../utils/AuthHelper';
import { API_URL } from '../utils/config';
import { useStore } from '../store/useStore';
import { Ionicons } from '@expo/vector-icons';

export default function AccountsScreen() {
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
      <LinearGradient colors={['#0f172a', '#1e293b', '#334155']} style={styles.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallets</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchAccounts}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']} style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="wallet" size={28} color="#38bdf8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardType}>{item.type}</Text>
            </View>
            <Text style={styles.cardBalance}>${item.currentBalance.toFixed(2)}</Text>
          </LinearGradient>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>New Account</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="pricetag-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Account Name" placeholderTextColor="#64748b" value={name} onChangeText={setName} />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="grid-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Account Type (e.g. Instapay)" placeholderTextColor="#64748b" value={type} onChangeText={setType} />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="cash-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Initial Balance" placeholderTextColor="#64748b" keyboardType="numeric" value={initialBalance} onChangeText={setInitialBalance} />
              </View>
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddAccount}>
                <LinearGradient colors={['#38bdf8', '#0284c7']} style={styles.saveBtnGradient}>
                  <Text style={styles.btnText}>Create Wallet</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#f8fafc' },
  addBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#38bdf8', justifyContent: 'center', alignItems: 'center', shadowColor: '#38bdf8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  list: { padding: 20, paddingBottom: 120 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, marginBottom: 15, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(56,189,248,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardType: { color: '#94a3b8', fontSize: 13 },
  cardBalance: { color: '#38bdf8', fontSize: 22, fontWeight: '900' },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { maxHeight: '85%', padding: 30, backgroundColor: '#1e293b', borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#475569', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: '#f8fafc', fontSize: 24, fontWeight: '800', marginBottom: 25, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 16, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#f8fafc', paddingVertical: 18, fontSize: 16 },
  saveBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden' },
  saveBtnGradient: { padding: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cancelBtn: { padding: 18, alignItems: 'center', marginTop: 5 },
  cancelText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' }
});
