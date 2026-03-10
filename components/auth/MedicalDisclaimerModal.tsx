import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MedicalDisclaimerModalProps {
  visible: boolean;
  onAcknowledge: () => void;
}

export const MedicalDisclaimerModal: React.FC<MedicalDisclaimerModalProps> = ({
  visible,
  onAcknowledge,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={40} color="#059669" />
          </View>

          <Text style={styles.title}>Medical Disclaimer</Text>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.body}>
              The content provided in this application is for educational and
              informational purposes only. It is not intended to be a substitute
              for professional medical advice, diagnosis, or treatment.
            </Text>

            <Text style={styles.body}>
              Always seek the advice of your physician or other qualified health
              provider with any questions you may have regarding a medical
              condition. Never disregard professional medical advice or delay in
              seeking it because of something you have read on this application.
            </Text>

            <Text style={styles.body}>
              If you think you may have a medical emergency, call your doctor or
              emergency services immediately.
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.button}
            onPress={onAcknowledge}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="I Understand & Agree"
          >
            <Text style={styles.buttonText}>I Understand &amp; Agree</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '80%',
  },
  iconContainer: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  scrollView: {
    width: '100%',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  body: {
    marginBottom: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#047857',
    opacity: 0.9,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
