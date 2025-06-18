import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography, elevation } from '../styles/theme';

export default function LoginScreen() {
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo@secureguardian.com');
  const [password, setPassword] = useState('demo123');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all required fields');
      setShowError(true);
      return;
    }

    if (!isLogin && !fullName) {
      setError('Full name is required for registration');
      setShowError(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, fullName);
      }

      if (!result.success) {
        setError(result.error);
        setShowError(true);
      }
    } catch (error) {
      setError('An unexpected error occurred');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowError(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="shield-check" size={80} color={colors.primary} />
          <Text style={styles.title}>SecureGuardian</Text>
          <Text style={styles.subtitle}>
            Advanced Personal Security Platform
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            
            {!isLogin && (
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />
            )}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            <Button
              mode="text"
              onPress={toggleMode}
              disabled={loading}
              style={styles.toggleButton}
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"
              }
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Demo Credentials</Text>
          <Text style={styles.demoText}>Email: demo@secureguardian.com</Text>
          <Text style={styles.demoText}>Password: demo123</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Icon name="wifi-strength-4" size={24} color={colors.primary} />
            <Text style={styles.featureText}>WiFi Threat Detection</Text>
          </View>
          
          <View style={styles.feature}>
            <Icon name="shield-alert" size={24} color={colors.secondary} />
            <Text style={styles.featureText}>Real-time Monitoring</Text>
          </View>
          
          <View style={styles.feature}>
            <Icon name="phone-alert" size={24} color={colors.accent} />
            <Text style={styles.featureText}>Emergency Response</Text>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={4000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.primary,
    marginTop: spacing.md,
    fontWeight: 'bold',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  card: {
    marginBottom: spacing.lg,
    ...elevation.level3,
  },
  cardTitle: {
    ...typography.titleLarge,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
  toggleButton: {
    marginTop: spacing.xs,
  },
  demoInfo: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  demoTitle: {
    ...typography.titleSmall,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  demoText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});
