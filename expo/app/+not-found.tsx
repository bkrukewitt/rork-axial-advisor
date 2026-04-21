import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found', headerStyle: { backgroundColor: Colors.background } }} />
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  title: {
    fontSize: 72,
    fontWeight: '900',
    color: Colors.red,
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
  },
  link: {
    marginTop: 8,
  },
  linkText: {
    fontSize: 16,
    color: Colors.red,
    fontWeight: '600',
  },
});
