import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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
      transparent={true}
      visible={visible}
      onRequestClose={() => {}} // Block back button closing
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={40} color="#059669" />
          </View>
          
          <Text style={styles.modalTitle}>Medical Disclaimer</Text>
          
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.modalText}>
              The content provided in this application is for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
            </Text>
            
            <Text style={styles.modalText}>
              Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this application.
            </Text>

            <Text style={styles.modalText}>
              If you think you may have a medical emergency, call your doctor or emergency services immediately.
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.button}
            onPress={onAcknowledge}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>I Understand & Agree</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  iconContainer: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  modalTitle: {
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
    paddingBottom: 20,
  },
  modalText: {
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
