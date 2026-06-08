import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { getTokenAsync } from '../utils/AuthHelper';
import { API_URL } from '../utils/config';
import { useStore } from '../store/useStore';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionsScreen({ navigation }: any) {
  const { transactions, accounts, fetchTransactions, fetchAccounts, loading } = useStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterAccountId, setFilterAccountId] = useState<number | undefined>(undefined);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Deposit');
  const [accountId, setAccountId] = useState<number | undefined>(undefined);
  const [toAccountId, setToAccountId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions(filterAccountId, filterType);
  }, [filterAccountId, filterType]);

  useEffect(() => {
    if (accounts.length > 0) {
      if (accountId === undefined) setAccountId(accounts[0].id);
      if (toAccountId === undefined && accounts.length > 1) setToAccountId(accounts[1].id);
    }
  }, [accounts]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReceiptImage(result.assets[0].base64 || null);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to grant camera access to take a photo");
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReceiptImage(result.assets[0].base64 || null);
    }
  };

  const handleAddTx = async () => {
    if (!amount || !accountId) {
      Alert.alert('Error', 'Amount and Account are required');
      return;
    }
    if (type === 'Transfer' && (!toAccountId || accountId === toAccountId)) {
      Alert.alert('Error', 'Please select a valid destination account for the transfer');
      return;
    }

    try {
      const token = await getTokenAsync();
      await axios.post(`${API_URL}/transactions`, {
        amount: parseFloat(amount),
        type,
        accountId,
        toAccountId: type === 'Transfer' ? toAccountId : null,
        notes,
        receiptImage: receiptImage || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalVisible(false);
      setAmount('');
      setNotes('');
      setReceiptImage(null);
      fetchTransactions(filterAccountId, filterType);
      fetchAccounts(); 
    } catch (e) {
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#334155']} style={styles.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterBtn, filterAccountId === undefined && styles.filterBtnActive]}
            onPress={() => setFilterAccountId(undefined)}>
            <Text style={[styles.filterText, filterAccountId === undefined && styles.filterTextActive]}>All Accounts</Text>
          </TouchableOpacity>
          {accounts.map(acc => (
            <TouchableOpacity 
              key={acc.id} 
              style={[styles.filterBtn, filterAccountId === acc.id && styles.filterBtnActive]}
              onPress={() => setFilterAccountId(acc.id)}>
              <Text style={[styles.filterText, filterAccountId === acc.id && styles.filterTextActive]}>{acc.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.typeFilters}>
          {['', 'Deposit', 'Withdraw', 'Transfer'].map((t, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.typeFilterBtn, filterType === t && styles.typeFilterBtnActive]}
              onPress={() => setFilterType(t)}>
              <Text style={[styles.filterText, filterType === t && styles.filterTextActive]}>{t || 'All Types'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        onRefresh={() => fetchTransactions(filterAccountId, filterType)}
        renderItem={({ item }) => {
          const accName = accounts.find(a => a.id === item.accountId)?.name || 'Unknown Account';
          const toAccName = accounts.find(a => a.id === item.toAccountId)?.name;
          
          let iconName: any = "arrow-up-outline";
          let iconColor = "#f87171";
          let iconBg = "rgba(248,113,113,0.1)";
          let amountPrefix = "-";

          if (item.type === 'Deposit') {
            iconName = "arrow-down-outline";
            iconColor = "#4ade80";
            iconBg = "rgba(74,222,128,0.1)";
            amountPrefix = "+";
          } else if (item.type === 'Transfer') {
            iconName = "swap-horizontal-outline";
            iconColor = "#a78bfa";
            iconBg = "rgba(167,139,250,0.1)";
            amountPrefix = "";
          }

          return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('TransactionDetails', { transaction: item })}>
              <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']} style={styles.card}>
                <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
                  <Ionicons name={iconName} size={20} color={iconColor} />
                </View>
                <View style={styles.cardMiddle}>
                  <Text style={styles.cardType}>{item.type}</Text>
                  <Text style={styles.cardSub}>
                    {item.type === 'Transfer' ? `${accName} → ${toAccName}` : accName} • {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.cardAmount, { color: iconColor }]}>
                    {amountPrefix}${(item.amount || 0).toFixed(2)}
                  </Text>
                  {item.notes ? <Text style={styles.cardSubRight}>{item.notes}</Text> : null}
                  {item.receiptImage ? (
                    <Ionicons name="image-outline" size={16} color="#38bdf8" style={{ marginTop: 4 }} />
                  ) : null}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>New Transaction</Text>
              
              <View style={styles.typeSelector}>
                {['Deposit', 'Withdraw', 'Transfer'].map(t => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.typeSelectBtn, type === t && styles.typeSelectBtnActive]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.typeSelectText, type === t && styles.typeSelectTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{type === 'Transfer' ? 'From Account:' : 'Select Account:'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15, maxHeight: 50, minHeight: 50 }}>
                {accounts.map(acc => (
                  <TouchableOpacity 
                    key={acc.id} 
                    style={[styles.accBtn, accountId === acc.id && styles.accBtnActive]}
                    onPress={() => setAccountId(acc.id)}>
                    <Text style={[styles.accText, accountId === acc.id && styles.accTextActive]}>{acc.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {type === 'Transfer' && (
                <>
                  <Text style={styles.label}>To Account:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15, maxHeight: 50, minHeight: 50 }}>
                    {accounts.map(acc => (
                      <TouchableOpacity 
                        key={acc.id} 
                        style={[styles.accBtn, toAccountId === acc.id && styles.accBtnActive, accountId === acc.id && { opacity: 0.5 }]}
                        onPress={() => setToAccountId(acc.id)}
                        disabled={accountId === acc.id}>
                        <Text style={[styles.accText, toAccountId === acc.id && styles.accTextActive]}>{acc.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="cash-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Amount" placeholderTextColor="#64748b" keyboardType="numeric" value={amount} onChangeText={setAmount} />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="document-text-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Notes (optional)" placeholderTextColor="#64748b" value={notes} onChangeText={setNotes} />
              </View>

              {type === 'Withdraw' && (
                <View style={styles.imagePickerContainer}>
                  <Text style={styles.label}>Receipt / Image (optional):</Text>
                  <View style={styles.imageBtnRow}>
                    <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
                      <Ionicons name="image-outline" size={24} color="#38bdf8" />
                      <Text style={styles.imgBtnText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imgBtn} onPress={takePhoto}>
                      <Ionicons name="camera-outline" size={24} color="#38bdf8" />
                      <Text style={styles.imgBtnText}>Camera</Text>
                    </TouchableOpacity>
                  </View>
                  {receiptImage && (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: `data:image/jpeg;base64,${receiptImage}` }} style={styles.previewImg} />
                      <TouchableOpacity style={styles.removeImgBtn} onPress={() => setReceiptImage(null)}>
                        <Ionicons name="close-circle" size={24} color="#f87171" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddTx}>
                <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.saveBtnGradient}>
                  <Text style={styles.btnText}>Add Transaction</Text>
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
  addBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#8b5cf6', justifyContent: 'center', alignItems: 'center', shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  filtersContainer: { paddingHorizontal: 20, marginBottom: 10 },
  filterScroll: { marginBottom: 15 },
  filterBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterBtnActive: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  filterText: { color: '#cbd5e1', fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#0f172a', fontWeight: 'bold' },
  typeFilters: { flexDirection: 'row', justifyContent: 'space-between' },
  typeFilterBtn: { flex: 1, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, marginHorizontal: 3, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  typeFilterBtnActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  list: { padding: 20, paddingBottom: 120 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18, marginBottom: 12, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)'
  },
  iconWrapper: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardMiddle: { flex: 1 },
  cardType: { color: '#f8fafc', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSub: { color: '#94a3b8', fontSize: 12 },
  cardRight: { alignItems: 'flex-end' },
  cardAmount: { fontSize: 18, fontWeight: '900' },
  cardSubRight: { color: '#64748b', fontSize: 12, marginTop: 4 },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { maxHeight: '85%', padding: 30, backgroundColor: '#1e293b', borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#475569', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: '#f8fafc', fontSize: 24, fontWeight: '800', marginBottom: 25, textAlign: 'center' },
  label: { color: '#cbd5e1', fontWeight: '600', marginBottom: 10, marginLeft: 5 },
  typeSelector: { flexDirection: 'row', marginBottom: 20 },
  typeSelectBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)', marginHorizontal: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  typeSelectBtnActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  typeSelectText: { color: '#94a3b8', fontWeight: '600', fontSize: 13 },
  typeSelectTextActive: { color: '#fff', fontWeight: 'bold' },
  accBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 16, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  accBtnActive: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  accText: { color: '#94a3b8', fontWeight: '600' },
  accTextActive: { color: '#0f172a', fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 16, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#f8fafc', paddingVertical: 18, fontSize: 16 },
  saveBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden' },
  saveBtnGradient: { padding: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cancelBtn: { padding: 18, alignItems: 'center', marginTop: 5 },
  cancelText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' },
  imagePickerContainer: { marginBottom: 15 },
  imageBtnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  imgBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(56,189,248,0.1)', padding: 12, borderRadius: 12, marginHorizontal: 4, borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)' },
  imgBtnText: { color: '#38bdf8', fontWeight: 'bold', marginLeft: 8 },
  previewContainer: { marginTop: 15, position: 'relative', alignSelf: 'center' },
  previewImg: { width: 100, height: 100, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  removeImgBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: '#1e293b', borderRadius: 12 }
});
