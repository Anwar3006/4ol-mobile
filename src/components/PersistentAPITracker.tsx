import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {themeColors} from '../theme/colors';
import persistentApiTracker from '../services/persistentApiTracker';

interface PersistentAPITrackerProps {
  visible: boolean;
  onClose: () => void;
}

const PersistentAPITracker: React.FC<PersistentAPITrackerProps> = ({
  visible,
  onClose,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isServiceEnabled, setIsServiceEnabled] = useState(true);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const [statsData, limitsData, recordsData] = await Promise.all([
        persistentApiTracker.getStats(),
        persistentApiTracker.getLimits(),
        persistentApiTracker.getAPIRecords(20),
      ]);

      setStats(statsData);
      setLimits(limitsData);
      setRecords(recordsData);
      setIsServiceEnabled(persistentApiTracker.isServiceActive());
    } catch (error) {
      console.error('Error loading tracker data:', error);
    }
  };

  const handleResetStats = () => {
    Alert.alert(
      'Reset API Stats',
      'Are you sure you want to reset all API tracking statistics?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await persistentApiTracker.resetStats();
            loadData();
          },
        },
      ],
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all API tracking data and reset the device ID. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await persistentApiTracker.clearAllData();
            loadData();
          },
        },
      ],
    );
  };

  const handleToggleService = () => {
    if (isServiceEnabled) {
      persistentApiTracker.disableService();
    } else {
      persistentApiTracker.enableService();
    }
    setIsServiceEnabled(!isServiceEnabled);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getStatusColor = (current: number, limit: number) => {
    const percentage = getUsagePercentage(current, limit);
    if (percentage >= 90) return '#ff4444';
    if (percentage >= 70) return '#ffaa00';
    return '#44ff44';
  };

  if (!stats || !limits) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text>Loading...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayCalls = stats.callsByDate[today] || 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Persistent API Tracker</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="times" size={20} color={themeColors.black} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Service Status */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Service Status</Text>
                <TouchableOpacity
                  onPress={handleToggleService}
                  style={[
                    styles.toggleButton,
                    {backgroundColor: isServiceEnabled ? '#44ff44' : '#ff4444'},
                  ]}>
                  <Text style={styles.toggleText}>
                    {isServiceEnabled ? 'ENABLED' : 'DISABLED'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.deviceId}>Device ID: {stats.deviceId}</Text>
            </View>

            {/* Daily Usage */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Usage</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getUsagePercentage(
                          todayCalls,
                          limits.dailyLimit,
                        )}%`,
                        backgroundColor: getStatusColor(
                          todayCalls,
                          limits.dailyLimit,
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {todayCalls} / {limits.dailyLimit} calls
                </Text>
              </View>
            </View>

            {/* Monthly Usage */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Monthly Usage</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getUsagePercentage(
                          stats.totalCalls,
                          limits.monthlyLimit,
                        )}%`,
                        backgroundColor: getStatusColor(
                          stats.totalCalls,
                          limits.monthlyLimit,
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {stats.totalCalls} / {limits.monthlyLimit} calls
                </Text>
              </View>
            </View>

            {/* Function Usage */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Function Usage</Text>
              {Object.entries(stats.callsByFunction).map(([func, count]) => {
                const limit = limits.perFunctionLimit[func] || '∞';
                return (
                  <View key={func} style={styles.functionRow}>
                    <Text style={styles.functionName}>{func}</Text>
                    <Text style={styles.functionCount}>
                      {count} / {limit}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Recent API Calls */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent API Calls</Text>
              {records.slice(0, 10).map((record, index) => (
                <View key={index} style={styles.recordRow}>
                  <Text style={styles.recordFunction}>
                    {record.functionName}
                  </Text>
                  <Text style={styles.recordEndpoint}>{record.endpoint}</Text>
                  <Text style={styles.recordTime}>
                    {formatDate(record.timestamp)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleResetStats}
                style={[styles.actionButton, styles.resetButton]}>
                <Text style={styles.actionButtonText}>Reset Stats</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearAllData}
                style={[styles.actionButton, styles.clearButton]}>
                <Text style={styles.actionButtonText}>Clear All Data</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.black,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.black,
  },
  deviceId: {
    fontSize: 12,
    color: themeColors.gray,
    fontFamily: 'monospace',
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  functionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  functionName: {
    flex: 1,
    fontSize: 14,
  },
  functionCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: themeColors.primary,
  },
  recordRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordFunction: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recordEndpoint: {
    fontSize: 12,
    color: themeColors.gray,
  },
  recordTime: {
    fontSize: 10,
    color: themeColors.gray,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#ffaa00',
  },
  clearButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default PersistentAPITracker;
