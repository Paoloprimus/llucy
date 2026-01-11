import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a0a1a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo / Title */}
          <View style={styles.header}>
            <Text style={styles.title}>llucy</Text>
            <Text style={styles.subtitle}>Il tuo specchio intelligente</Text>
          </View>

          {/* Tagline */}
          <View style={styles.tagline}>
            <Text style={styles.taglineText}>Io rifletto con te.</Text>
          </View>

          {/* Description */}
          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              Non sono un'app.{'\n'}
              Sono una presenza vocale.
            </Text>
          </View>

          {/* CTA Button */}
          <Link href="/mirror" asChild>
            <Pressable style={styles.button}>
              {({ pressed }) => (
                <LinearGradient
                  colors={['#b8895e', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.buttonGradient,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.buttonText}>Inizia</Text>
                </LinearGradient>
              )}
            </Pressable>
          </Link>

          {/* Footer */}
          <Text style={styles.footer}>
            Beta · Voice only · iOS 15+
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 64,
    fontWeight: '300',
    color: '#faf7f5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#999',
    fontWeight: '300',
  },
  tagline: {
    marginBottom: 32,
  },
  taglineText: {
    fontSize: 28,
    fontStyle: 'italic',
    color: '#faf7f5',
  },
  description: {
    marginBottom: 48,
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    width: '100%',
    marginBottom: 24,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    fontSize: 12,
    color: '#666',
  },
});
