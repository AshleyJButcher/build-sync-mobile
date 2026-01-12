import { View, StyleSheet } from 'react-native';
import { Text } from '../../src/components/Text';
import { useAuth } from '../../src/hooks/useAuth';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, role, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text variant="headingLarge" style={styles.title}>
        Welcome to BuildSync!
      </Text>
      {user && (
        <>
          <Text variant="body" style={styles.text}>
            Email: {user.email}
          </Text>
          {role && (
            <Text variant="body" style={styles.text}>
              Role: {role}
            </Text>
          )}
        </>
      )}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  text: {
    marginBottom: 12,
  },
  logoutButton: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
