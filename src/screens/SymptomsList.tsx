import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import {size} from '../theme/fontStyle';
import {getDiseaseListByType} from '../services/diseases';
import {limit} from '../../config/variables';
import {SCREENS} from '../constants/screens';
import {getSymptomsListByType} from '../services/symptoms';
import {logActivity} from '../services/activityLogsService';
import {user} from '../store/selectors';
import {useSelector} from 'react-redux';

type SymptomsListProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      listType?: string;
    };
  };
};

const SymptomsList: React.FC<SymptomsListProps> = ({navigation, route}) => {
  const userData = useSelector(user);
  const {listType} = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState<any>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadSymptoms = async (listType: string) => {
    if (!hasMore) return;
    getSymptomsListByType(
      listType,
      page * limit,
      () => setLoading(true),
      (successData: any) => {
        setSymptoms((prev: any) => [...prev, ...successData]);
        setHasMore(successData.length === limit);
        setPage(prev => prev + 1);
        setLoading(false);
      },
      (error: any) => {
        console.log('Error while fetching symptoms list', error);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    if (listType) {
      loadSymptoms(listType);
      logActivity(
        {
          user_id: userData?.id || '',
          user_name: `${userData?.first_name || ''} ${
            userData?.last_name || ''
          }`,
          type: 'symptom',
          description: `User has browsed the Symptoms list (Search filter: ${listType})`,
          reference: '',
          reference_id: '',
        },
        () => {
          console.log('Logging Symptoms List browsing activity...');
        },
        data => {
          console.log(
            'Symptoms List browsing activity logged successfully:',
            data,
          );
        },
        error => {
          console.error(
            'Error logging Symptoms List browsing activity:',
            error,
          );
        },
      );
    }
  }, [listType]);

  const renderFooter = () => {
    return hasMore && loading ? (
      <ActivityIndicator size="small" color={themeColors.primary} />
    ) : null;
  };

  const handleLoadMore = () => {
    if (!loading && listType) {
      loadSymptoms(listType);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.listTypeText}>{listType}</Text>
        <View style={styles.horizontalLine}></View>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={themeColors.primary} size={'large'} />
        </View>
      ) : symptoms.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No record found</Text>
        </View>
      ) : (
        <FlatList
          data={symptoms}
          keyExtractor={item => item?.id?.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() =>
                navigation?.navigate('SymptomsDetails', {id: item?.id})
              }>
              <Text style={styles.itemText}>{item?.symptom_name}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

export default SymptomsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
    padding: 15,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  listTypeText: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: 15,
    paddingVertical: 5,
    fontFamily: fonts.OpenSansBold,
    fontSize: size.xlg,
    color: themeColors.white,
  },
  horizontalLine: {
    borderBottomWidth: 2,
    borderColor: themeColors.primary,
    flex: 1,
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: themeColors.darkGray,
    paddingVertical: 10,
  },
  itemText: {
    color: themeColors.darkGray,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
  },
});
