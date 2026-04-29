import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';

const BANNER_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/v7kx356jyopryqevteicx.png';

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
        activeOpacity={0.92}
        style={styles.bannerWrapper}
        testID="header-logo"
      >
        <Image source={{ uri: BANNER_URI }} style={styles.bannerImage} resizeMode="cover" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  bannerWrapper: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 90,
    borderRadius: 14,
  },
});
