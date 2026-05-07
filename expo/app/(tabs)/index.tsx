import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { AppHeader } from '@/components/AppHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SettingsAdvisor } from '@/components/SettingsAdvisor';
import { ExpertChat } from '@/components/ExpertChat';
import { useApp } from '@/store/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { adminUsers, signInWithPasscode, createInitialSuperAdmin } = useApp();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [name, setName] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const isSettingPasscode = adminUsers.length === 0;

  const handleAdminTrigger = useCallback(() => {
    console.log('[Home] Admin trigger');
    setPasscode('');
    setName('');
    setPasscodeError('');
    setShowPasscode(true);
  }, []);

  const handlePasscodeSubmit = useCallback(async () => {
    if (!passcode.trim()) return;
    if (isSettingPasscode) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setPasscodeError('Please enter your name.');
        return;
      }
      try {
        await createInitialSuperAdmin(trimmedName, passcode);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowPasscode(false);
        router.push('/admin');
      } catch (e) {
        console.warn('[Home] createInitialSuperAdmin error:', e);
        setPasscodeError('Could not create super admin.');
      }
      return;
    }
    const found = signInWithPasscode(passcode);
    if (found) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowPasscode(false);
      router.push('/admin');
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPasscodeError('Incorrect passcode. Try again.');
      setPasscode('');
    }
  }, [passcode, name, isSettingPasscode, signInWithPasscode, createInitialSuperAdmin, router]);

  const closePasscode = useCallback(() => {
    setShowPasscode(false);
    setPasscode('');
    setName('');
    setPasscodeError('');
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <AppHeader onAdminTrigger={handleAdminTrigger} />
        <View style={styles.segmentWrap}>
          <SegmentedControl
            options={['Settings Advisor', 'Ask the Expert']}
            selectedIndex={segmentIndex}
            onChange={setSegmentIndex}
          />
        </View>
        <View style={styles.panelContainer}>
          {segmentIndex === 0 ? <SettingsAdvisor /> : <ExpertChat />}
        </View>
      </View>

      <Modal visible={showPasscode} transparent animationType="fade" onRequestClose={closePasscode}>
        <Pressable style={styles.overlay} onPress={closePasscode}>
          <Pressable style={styles.dialog} onPress={() => {}}>
            <View style={styles.dialogBadge}>
              <Text style={styles.dialogBadgeText}>{isSettingPasscode ? 'SUPER ADMIN' : 'ADMIN'}</Text>
            </View>
            <Text style={styles.dialogTitle}>
              {isSettingPasscode ? 'Create Super Admin' : 'Admin Access'}
            </Text>
            <Text style={styles.dialogSub}>
              {isSettingPasscode
                ? 'You are the first admin. Set your name and passcode — you will be able to add more admins later.'
                : 'Enter your admin passcode to continue.'}
            </Text>

            {isSettingPasscode && (
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={v => { setName(v); setPasscodeError(''); }}
                placeholder="Your name"
                placeholderTextColor={Colors.textTertiary}
                autoFocus
                returnKeyType="next"
                testID="admin-name-input"
              />
            )}

            <TextInput
              style={styles.passcodeInput}
              value={passcode}
              onChangeText={v => { setPasscode(v); setPasscodeError(''); }}
              placeholder={isSettingPasscode ? 'Create passcode' : 'Enter passcode'}
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry
              autoFocus={!isSettingPasscode}
              returnKeyType="done"
              onSubmitEditing={handlePasscodeSubmit}
              testID="passcode-input"
            />
            {Boolean(passcodeError) && <Text style={styles.errorText}>{passcodeError}</Text>}
            <View style={styles.dialogActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closePasscode}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !passcode.trim() && styles.confirmDisabled]}
                onPress={handlePasscodeSubmit}
                disabled={!passcode.trim()}
                testID="passcode-submit"
              >
                <Text style={styles.confirmText}>
                  {isSettingPasscode ? 'Create Account' : 'Unlock'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  segmentWrap: { paddingHorizontal: 16, marginBottom: 8 },
  panelContainer: { flex: 1 },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog: { backgroundColor: Colors.surfaceElevated, borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: Colors.border },
  dialogBadge: { alignSelf: 'flex-start', backgroundColor: Colors.redMuted, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 12, borderWidth: 1, borderColor: Colors.redDim },
  dialogBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.red, letterSpacing: 1.2 },
  dialogTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  dialogSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  textInput: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: Colors.text, marginBottom: 10 },
  passcodeInput: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: Colors.text, marginBottom: 10, letterSpacing: 3 },
  errorText: { fontSize: 13, color: Colors.redBright, marginBottom: 10 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.red, alignItems: 'center' },
  confirmDisabled: { opacity: 0.4 },
  confirmText: { fontSize: 15, fontWeight: '700', color: Colors.text },
});
