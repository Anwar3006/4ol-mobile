import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import {size} from '../theme/fontStyle';
import apiCallTracker from '../utils/apiCallTracker';
import DistanceCache from '../utils/distanceCache';
import ModalCache from '../utils/modalCache';

interface APICallSummaryProps {
  visible: boolean;
  onClose: () => void;
}

const APICallSummary: React.FC<APICallSummaryProps> = ({visible, onClose}) => {
  const [summary, setSummary] = useState(apiCallTracker.getSummary());
  const [cacheStats, setCacheStats] = useState({
    totalCached: 0,
    expiredEntries: 0,
    validEntries: 0,
  });

  const [modalCacheStats, setModalCacheStats] = useState({
    totalCached: 0,
    expiredEntries: 0,
    validEntries: 0,
  });

  useEffect(() => {
    if (visible) {
      setSummary(apiCallTracker.getSummary());
      // Get cache statistics
      Promise.all([
        DistanceCache.getCacheStats(),
        ModalCache.getCacheStats(),
      ]).then(([distanceStats, modalStats]) => {
        setCacheStats(distanceStats);
        setModalCacheStats(modalStats);
      });
    }
  }, [visible]);

  const handleReset = () => {
    apiCallTracker.reset();
    setSummary(apiCallTracker.getSummary());
  };

  const handleClearCache = async () => {
    await Promise.all([
      DistanceCache.clearAllCachedDistances(),
      ModalCache.clearAllCachedModalData(),
    ]);
    const [distanceStats, modalStats] = await Promise.all([
      DistanceCache.getCacheStats(),
      ModalCache.getCacheStats(),
    ]);
    setCacheStats(distanceStats);
    setModalCacheStats(modalStats);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>API Call Summary</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Total Google API Calls: {summary.totalAPICalls}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance Cache Statistics:</Text>
            <View style={styles.functionRow}>
              <Text style={styles.functionName}>Total Cached Facilities</Text>
              <Text style={styles.functionCount}>{cacheStats.totalCached}</Text>
            </View>
            <View style={styles.functionRow}>
              <Text style={styles.functionName}>Valid Entries</Text>
              <Text style={styles.functionCount}>
                {cacheStats.validEntries}
              </Text>
            </View>
            <View style={styles.functionRow}>
              <Text style={styles.functionName}>Expired Entries</Text>
              <Text style={styles.functionCount}>
                {cacheStats.expiredEntries}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modal Cache Statistics:</Text>
            <View style={styles.functionRow}>
              <Text style={styles.functionName}>Total Cached Modals</Text>
              <Text style={styles.functionCount}>
                {modalCacheStats.totalCached}
              </Text>
            </View>
            <View style={styles.functionRow}>
              <Text style={styles.functionName}>Valid Entries</Text>
              <Text style={styles.functionCount}>
                {modalCacheStats.validEntries}
              </Text>
            </View>
            <View style={styles.functionRow}>
              <Text style={styles.functionName}>Expired Entries</Text>
              <Text style={styles.functionCount}>
                {modalCacheStats.expiredEntries}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Function Call Counts:</Text>
            {Object.entries(summary.functionCallCounts).map(
              ([functionName, count]) => (
                <View key={functionName} style={styles.functionRow}>
                  <Text style={styles.functionName}>{functionName}</Text>
                  <Text style={styles.functionCount}>{count}</Text>
                </View>
              ),
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent API Calls:</Text>
            {summary.apiCallLogs
              .slice(-10)
              .reverse()
              .map((log, index) => (
                <View key={index} style={styles.apiCallRow}>
                  <Text style={styles.apiCallFunction}>{log.functionName}</Text>
                  <Text style={styles.apiCallEndpoint}>{log.apiEndpoint}</Text>
                  <Text style={styles.apiCallTime}>
                    {log.timestamp.toLocaleTimeString()}
                  </Text>
                </View>
              ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleReset}
              style={[styles.resetButton, {flex: 1, marginRight: 5}]}>
              <Text style={styles.resetText}>Reset Counters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClearCache}
              style={[
                styles.resetButton,
                {flex: 1, marginLeft: 5, backgroundColor: themeColors.darkGray},
              ]}>
              <Text style={styles.resetText}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    backgroundColor: themeColors.white,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.lightGray,
    paddingBottom: 10,
  },
  title: {
    fontSize: size.lg,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.primary,
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: size.md,
    color: themeColors.darkGray,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
    marginBottom: 10,
  },
  functionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.lightGray,
  },
  functionName: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
    flex: 1,
  },
  functionCount: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.primary,
  },
  apiCallRow: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.lightGray,
  },
  apiCallFunction: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
  },
  apiCallEndpoint: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.primary,
  },
  apiCallTime: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: themeColors.lightGray,
    paddingTop: 15,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  resetButton: {
    backgroundColor: themeColors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  resetText: {
    color: themeColors.white,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
  },
});

export default APICallSummary;
