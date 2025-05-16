import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {themeColors} from '../theme/colors';
import {size} from '../theme/fontStyle';
import {fonts} from '../theme/fonts';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {searchDiseasesORSymptoms} from '../services/search';
import {SCREENS} from '../constants/screens';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

type SearchResultsProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      searchText?: string;
      type?: string;
    };
  };
};

const SearchResults: React.FC<SearchResultsProps> = ({navigation, route}) => {
  const {searchText, type} = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>();
  const loadResults = async () => {
    searchDiseasesORSymptoms(
      searchText as string,
      type as string,
      () => setLoading(true),
      (successData: any) => {
        setResults(successData);
        setLoading(false);
      },
      (error: any) => {
        console.log('Error while searching', error);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    if (searchText && type) {
      loadResults();
    }
    console.log('RESULTS:', JSON.stringify(results, null, 2));
  }, [searchText, type]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.listTypeText}>
          Search results for {`"${searchText}"`}
        </Text>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={themeColors.primary} size={'large'} />
        </View>
      ) : results?.length == 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No record found</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{gap: 10}}
          data={results}
          keyExtractor={item => item?.id?.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() =>
                navigation?.navigate(
                  type == 'diseases' ? 'DiseasesDetails' : 'SymptomsDetails',
                  {id: item?.id},
                )
              }>
              <View style={styles.diseaseContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: themeColors.primary,
                    padding: 10,
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.itemText}>
                    {item?.condition_name ||
                      item?.symptom_name ||
                      `Unknown ${type == 'diseases' ? 'Disease' : 'Symptom'}`}
                  </Text>
                  <FontAwesome5Icon
                    name="chevron-right"
                    size={12}
                    color="white"
                  />
                </View>
                <View
                  style={{
                    gap: 5,
                    padding:
                      item.diagnosis ||
                      item.about ||
                      item.treating ||
                      item.complications ||
                      item.symptoms ||
                      item.prevention
                        ? 10
                        : 0,
                  }}>
                  {item?.diagnosis ? (
                    <Text style={{color: themeColors.black}}>
                      {item.diagnosis.length > 100
                        ? `${item.diagnosis.substring(0, 100)}...`
                        : item.diagnosis}
                    </Text>
                  ) : item?.about ? (
                    <Text style={{color: themeColors.black}}>
                      {item.about.length > 100
                        ? `${item.about.substring(0, 100)}...`
                        : item.about}
                    </Text>
                  ) : item?.treating ? (
                    <Text style={{color: themeColors.black}}>
                      {item.treating.length > 100
                        ? `${item.treating.substring(0, 100)}...`
                        : item.treating}
                    </Text>
                  ) : item?.complications ? (
                    <Text style={{color: themeColors.black}}>
                      {item.complications.length > 100
                        ? `${item.complications.substring(0, 100)}...`
                        : item.complications}
                    </Text>
                  ) : item?.symptoms ? (
                    <Text style={{color: themeColors.black}}>
                      {item.symptoms.length > 100
                        ? `${item.symptoms.substring(0, 100)}...`
                        : item.symptoms}
                    </Text>
                  ) : item?.prevention ? (
                    <Text style={{color: themeColors.black}}>
                      {item.prevention.length > 100
                        ? `${item.prevention.substring(0, 100)}...`
                        : item.prevention}
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

export default SearchResults;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  listTypeText: {
    fontFamily: fonts.OpenSansBold,
    fontSize: size.md,
    color: themeColors.darkGray,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: size.lg,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: themeColors.darkGray,
    paddingVertical: 10,
  },
  itemText: {
    color: themeColors.white,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
  },
  diseaseContainer: {
    borderColor: themeColors.primary,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
