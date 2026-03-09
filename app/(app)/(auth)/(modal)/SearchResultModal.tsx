import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { fonts } from '@/src/theme/fonts';
import { themeColors } from '@/src/theme/colors';
import { size } from '@/src/theme/fontStyle';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import useSearchStore from '@/store/use-searchStore';

const SearchResultModal = () => {
  const router = useRouter();
  const { query, results, isLoading, error } = useSearchStore();

  const RenderItem: React.FC<{ item: any }> = ({ item }) => {
    const table: string = item.table.split('_').join(' ');
    const firstLetter = table.charAt(0).toUpperCase();
    const tableCapitalized = firstLetter + table.slice(1);

    const navigateToDetails = (routeName: string, id: string) => {
      if (routeName === 'illness_and_conditions' || routeName === 'conditions') {
        router.push({ pathname: "/(app)/(auth)/(modal)/DiseaseDetails", params: { id } });
      } else if (routeName === 'symptoms') {
        router.push({ pathname: "/(app)/(auth)/(modal)/SymptomDetails", params: { id } });
      } else if (routeName === 'facilities') {
        router.push({ pathname: "/(app)/(auth)/Facility/[id]", params: { id } });
      }
    };

    return (
      <View style={styles.resultItem}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>{tableCapitalized}</Text>
          <TouchableOpacity onPress={() => navigateToDetails(item.table, item.id)}>
            <FontAwesome5Icon name="chevron-right" size={16} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.resultBody}>
          <Text style={styles.resultText}>{item.name || item.title || query}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome5Icon name="times" size={24} color={themeColors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: 'red' }}>Error: {error.message || 'Something went wrong'}</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text>No results found for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={({ item }) => <RenderItem item={item} />}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.gray,
  },
  headerTitle: {
    fontSize: size.lg,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.black,
  },
  listContent: {
    padding: 20,
  },
  resultItem: {
    borderRadius: 10,
    backgroundColor: 'white',
    overflow: 'hidden',
    borderColor: themeColors.primary,
    borderWidth: 1,
    marginBottom: 15,
  },
  resultHeader: {
    padding: 10,
    backgroundColor: themeColors.lightGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    fontFamily: fonts.OpenSansBold,
    fontSize: size.md,
    color: themeColors.primary,
  },
  resultBody: {
    padding: 15,
  },
  resultText: {
    fontFamily: fonts.OpenSansRegular,
    fontSize: size.md,
    color: themeColors.black,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchResultModal;
