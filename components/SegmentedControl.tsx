import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedIndex,
  onChange,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selectedIndex,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [selectedIndex, slideAnim]);

  const width = 100 / options.length;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.indicator,
          {
            width: `${width}%` as unknown as number,
            left: slideAnim.interpolate({
              inputRange: options.map((_, i) => i),
              outputRange: options.map((_, i) => `${i * width}%`),
            }),
          },
        ]}
      />
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt}
          style={styles.tab}
          onPress={() => onChange(i)}
          activeOpacity={0.7}
          testID={`segment-${i}`}
        >
          <Text style={[styles.label, i === selectedIndex && styles.labelActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
    height: 40,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: Colors.red,
    borderRadius: 9,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: Colors.text,
    fontWeight: '700',
  },
});
