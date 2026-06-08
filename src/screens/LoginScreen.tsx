import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { setTokenAsync } from '../utils/AuthHelper';
import { API_URL } from '../utils/config';
import axios from 'axios';

export default function LoginScreen({ setToken }: { setToken: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (isRegister) {
        await axios.post(`${API_URL}/auth/register`, { email, password, phone: '' });
        Alert.alert("نجاح", "تم التسجيل بنجاح. يرجى تسجيل الدخول.");
        setIsRegister(false);
      } else {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = res.data.token;
        await setTokenAsync(token);
        setToken(token);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل المصادقة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
      
      <View style={styles.glassCard}>
        <Text style={styles.title}>تدفق الأموال</Text>
        <Text style={styles.subtitle}>{isRegister ? 'إنشاء حساب جديد' : 'مرحباً بعودتك'}</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="البريد الإلكتروني" 
          placeholderTextColor="#a0a0a0" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          textAlign="right"
        />
        <TextInput 
          style={styles.input} 
          placeholder="كلمة المرور" 
          placeholderTextColor="#a0a0a0" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry 
          textAlign="right"
        />
        
        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isRegister ? 'تسجيل' : 'تسجيل الدخول'}</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
          <Text style={styles.switchText}>
            {isRegister ? 'لديك حساب بالفعل؟ تسجيل الدخول' : "ليس لديك حساب؟ إنشاء حساب"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  glassCard: {
    width: '85%',
    padding: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#e0e0e0', textAlign: 'center', marginBottom: 30 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  button: {
    backgroundColor: '#e94560',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  switchText: { color: '#4facfe', textAlign: 'center', marginTop: 20, fontSize: 14 }
});
