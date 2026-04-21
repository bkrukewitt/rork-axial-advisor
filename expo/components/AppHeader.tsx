import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';

const LOGO_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/1ftdc5nqjl6xg4zbworqc.png';

interface AppHeaderProps {
  onAdminTrigger: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onAdminTrigger }) => {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoPress = () => {
    tapCount.current += 1;
    console.log('[AppHeader] Logo tap:', tapCount.current);

    if (tapTimer.current) clearTimeout(tapTimer.current);

    if (tapCount.current >= 5) {
      tapCount.current = 0;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onAdminTrigger();
      return;
    }

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleLogoPress}
        activeOpacity={0.85}
        style={styles.logoArea}
        testID="header-logo"
      >
        <Image source={{ uri: LOGO_URI }} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.title}>AXIAL ADVISOR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  logoArea: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 1,
  },
});
