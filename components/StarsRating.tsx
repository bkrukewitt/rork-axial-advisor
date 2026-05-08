import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface StarsRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export const StarsRating: React.FC<StarsRatingProps> = ({
  rating,
  onChange,
  size = 22,
  readonly = false,
}) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= rating;
        if (readonly || !onChange) {
          return (
            <Star
              key={star}
              size={size}
              color={filled ? Colors.starActive : Colors.starInactive}
              fill={filled ? Colors.starActive : 'transparent'}
              style={styles.star}
            />
          );
        }
        return (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star === rating ? 0 : star)}
            style={styles.starBtn}
            testID={`star-${star}`}
          >
            <Star
              size={size}
              color={filled ? Colors.starActive : Colors.starInactive}
              fill={filled ? Colors.starActive : 'transparent'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    marginHorizontal: 1,
  },
  starBtn: {
    padding: 2,
  },
});
