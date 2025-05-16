import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LocationLayout from '../components/common/LocationLayout';
import {themeColors} from '../theme/colors';
import {size} from '../theme/fontStyle';
import {fonts} from '../theme/fonts';
import {alphabets, commonDiseases} from '../constants/diseases';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SearchBar from '../components/screens/Home/SearchBar';
import {SCREENS} from '../constants/screens';
import {searchDiseasesORSymptoms} from '../services/search';
import {logActivity} from '../services/activityLogsService';
import {user} from '../store/selectors';
import {useSelector} from 'react-redux';

type SymptomsProps = {
  navigation: NativeStackNavigationProp<any>; // Replace `any` with your specific stack params type if available
};

const Symptoms: React.FC<SymptomsProps> = ({navigation}) => {
  const userData = useSelector(user);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<any>();

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    logActivity(
      {
        user_id: userData?.id || '',
        user_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`,
        type: 'symptom',
        description: `User has visited the Symptoms section`,
        reference: '',
        reference_id: '',
      },
      () => {
        console.log('Logging Symptoms Section visit activity...');
      },
      data => {
        console.log(
          'Symptoms Section visit activity logged successfully:',
          data,
        );
      },
      error => {
        console.error('Error logging Symptoms Section visit activity:', error);
      },
    );
  }, []);

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (searchText) {
        searchDiseasesORSymptoms(
          searchText as string,
          'symptoms',
          () => {},
          (successData: any) => {
            setSuggestions(successData);
          },
          (error: any) => {
            console.log('Error while searching', error);
          },
        );
      } else {
        setSuggestions([]);
      }
    }, 500);
    setDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSearch = () => {
    if (!searchText) return;

    setSuggestions([]);
    navigation.navigate('SearchResult', {
      searchText: searchText,
      type: 'symptoms',
    });
  };

  return (
    <LocationLayout>
      <View style={styles.container}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.mainHeading}>
            Find easy-to-understand Information of symptoms - including
            headache, stomach ache and flu.
          </Text>

          <View style={{position: 'relative'}}>
            <SearchBar
              placeholder={'Search for a symptom, e.g. Headches'}
              showBtn
              value={searchText}
              onChangeText={setSearchText}
              handleSearch={handleSearch}
            />

            {suggestions?.length > 0 ? (
              <FlatList
                data={suggestions}
                keyExtractor={item => item?.id?.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSuggestions([]);
                      navigation.navigate('SymptomsDetails', {
                        id: item?.id,
                      });
                    }}>
                    <Text style={styles.suggestionText}>
                      {item?.symptom_name}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionList}
              />
            ) : null}
          </View>

          <Text style={styles.heading}>Browse A to Z list of Symptoms</Text>

          <FlatList
            data={alphabets}
            keyExtractor={item => item}
            numColumns={5} // Show 5 letters per row
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() =>
                  navigation.navigate('SymptomsList', {listType: item})
                }>
                <Text style={styles.text}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.list}
          />
        </ScrollView>
      </View>
    </LocationLayout>
  );
};

export default Symptoms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
    padding: 15,
  },
  mainHeading: {
    fontSize: size.sl,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
  },
  heading: {
    fontSize: size.md,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
  },
  list: {
    paddingVertical: 10,
  },
  item: {
    flex: 1,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    backgroundColor: themeColors.white,
    borderRadius: 5,
  },
  text: {
    fontSize: size.lg,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansMedium,
  },
  suggestionList: {
    position: 'absolute',
    maxHeight: 150,
    width: '100%',
    top: 60,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
  },
  suggestionText: {
    padding: 10,
    borderBottomColor: themeColors.white,
    borderBottomWidth: 1,
    color: themeColors.white,
  },
});
