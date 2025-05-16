import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {FlatList} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from 'src/store';
import {fonts} from '../theme/fonts';
import {themeColors} from '../theme/colors';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../constants/screens';

const SearchScreen = () => {
  const navigation = useNavigation();

  const {query, results, isLoading, error} = useSelector(
    (state: RootState) => state.searchAll,
  );

  console.log(
    'searchAll',
    JSON.stringify({query, results, isLoading, error}, null, 2),
  );

  const RenderItem: React.FC = ({item}) => {
    const table: string = item.table.split('_').join(' ');
    const firstLetter = table.charAt(0).toUpperCase();
    const tableCapitalized = firstLetter + table.slice(1);

    const navigateToDetails = (routeName: string, id: string) => {
      if (routeName === 'illness_and_conditions') {
        navigation?.navigate('DiseasesDetails', {id: id});
      } else if (routeName === 'symptoms') {
        navigation?.navigate('SymptomsDetails', {id: id});
      } else if (routeName === 'facilities') {
        navigation?.navigate('FacilityDetails', {id: id});
      }
    };

    return (
      <View
        style={{
          borderRadius: 10,
          backgroundColor: 'white',
          overflow: 'hidden',
          borderColor: themeColors.primary,
          borderWidth: 1,
        }}>
        <View
          style={{
            padding: 10,
            backgroundColor: themeColors.primary,
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontFamily: fonts.OpenSansBold,
            }}>
            Results from {tableCapitalized}
          </Text>
        </View>
        {item.results.map((result, index) => {
          let displayFields = [];
          switch (item.table) {
            case 'illness_and_conditions':
              displayFields = ['condition_name', 'diagnosis'];
              break;
            case 'symptoms':
              displayFields = [
                'symptom_name',
                'about',
                'diagnosis',
                'treating',
              ];
              break;
            case 'healthy_living':
              displayFields = ['topic_name', 'about', 'category'];
              break;
            case 'facilities':
              displayFields = ['facility_name', 'type', 'services'];
              break;
            default:
              displayFields = [];
          }
          return (
            <TouchableOpacity
              onPress={() => {
                navigateToDetails(item.table, result.id);
              }}
              style={{
                padding: 10,
                borderBottomColor: 'lightgray',
                borderBottomWidth: index === item.results.length - 1 ? 0 : 1,
              }}
              key={index}>
              {item.table === 'illness_and_conditions' && (
                <View>
                  {result['condition_name'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansBold,
                      }}>
                      {result['condition_name']}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansBold,
                      }}>
                      Unknown Disease
                    </Text>
                  )}
                  {result['diagnosis'] && (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansRegular,
                      }}>
                      {String(result['diagnosis']).substring(0, 100) || null}
                      {result['diagnosis'].length > 100 ? '...' : null}
                    </Text>
                  )}
                </View>
              )}

              {item.table === 'symptoms' && (
                <View>
                  {result['symptom_name'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansBold,
                      }}>
                      {result['symptom_name']}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansBold,
                      }}>
                      Unknown Symptom
                    </Text>
                  )}
                  {result['about'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansRegular,
                      }}>
                      {String(result['about']).substring(0, 100) || null}
                      {result['about'].length > 100 ? '...' : null}
                    </Text>
                  ) : result['diagnosis'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansRegular,
                      }}>
                      {String(result['diagnosis']).substring(0, 100) || null}
                      {result['diagnosis'].length > 100 ? '...' : null}
                    </Text>
                  ) : result['treating'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansRegular,
                      }}>
                      {String(result['treating']).substring(0, 100) || null}
                      {result['treating'].length > 100 ? '...' : null}
                    </Text>
                  ) : null}
                </View>
              )}

              {item.table === 'healthy_living' && (
                <View>
                  {result['topic_name'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansBold,
                      }}>
                      {result['topic_name']}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansBold,
                      }}>
                      Unknown Topic
                    </Text>
                  )}
                  {result['about'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansRegular,
                      }}>
                      {String(result['about']).substring(0, 100) || null}
                      {result['about'].length > 100 ? '...' : null}
                    </Text>
                  ) : result['category'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansRegular,
                      }}>
                      {String(result['category']).substring(0, 100) || null}
                      {result['category'].length > 100 ? '...' : null}
                    </Text>
                  ) : null}
                </View>
              )}
              {item.table === 'facilities' && (
                <View>
                  {result['facility_name'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansBold,
                      }}>
                      {result['facility_name']}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansBold,
                      }}>
                      Unknown Facility
                    </Text>
                  )}
                  {result['type'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansRegular,
                      }}>
                      {String(result['type']).substring(0, 100) || null}
                      {result['type'].length > 100 ? '...' : null}
                    </Text>
                  ) : result['services'] ? (
                    <Text
                      style={{
                        color: themeColors.black,
                        fontSize: 16,
                        fontFamily: fonts.OpenSansRegular,
                      }}>
                      {String(result['services']).substring(0, 100) || null}
                      {result['services'].length > 100 ? '...' : null}
                    </Text>
                  ) : null}
                </View>
              )}

              {/* {displayFields.map((field, index) => {
                if (result[field]) {
                  return (
                    <View
                      key={field}
                      style={{
                        flexDirection: 'row',
                        gap: 5,
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingHorizontal: 5,
                      }}>
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 16,
                          fontFamily:
                            index === 0
                              ? fonts.OpenSansBold
                              : fonts.OpenSansRegular,
                        }}>
                        {String(result[field].substring(0, 100))}
                        {result[field].length > 100 ? '...' : null}
                      </Text>
                      {index === 0 && (
                        <FontAwesome5Icon
                          name="chevron-right"
                          size={14}
                          color={themeColors.primary}
                        />
                      )}
                    </View>
                  );
                }
                return null;
              })} */}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 15,
        paddingBottom: 0,
        gap: 10,
      }}>
      {results?.length !== 0 ? (
        <>
          <Text
            style={{
              fontSize: 20,
              fontFamily: fonts.OpenSansBold,
              color: 'black',
            }}>
            Search Results for '{query}'
          </Text>

          <FlatList
            showsVerticalScrollIndicator={false}
            style={{flex: 1}}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 10,
              gap: 10,
            }}
            data={results}
            renderItem={({item}) => <RenderItem item={item} />}
          />
        </>
      ) : (
        <Text
          style={{
            fontSize: 16,
            fontFamily: fonts.OpenSansBold,
            color: 'black',
            textAlign: 'center',
          }}>
          No results found for '{query}'
        </Text>
      )}
    </View>
  );
};

export default SearchScreen;
