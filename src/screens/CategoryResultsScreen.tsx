import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const CategoryResultsScreen = ({route, navigation}: any) => {
  const {category} = route.params;
  const {results} = useSelector((state: RootState) => state.searchAll);

  const categoryData =
    results?.find(item => item.table === category)?.results || [];

  const navigateToDetails = (id: string) => {
    switch (category) {
      case 'illness_and_conditions':
        navigation.navigate('DiseasesDetails', {id});
        break;
      case 'symptoms':
        navigation.navigate('SymptomsDetails', {id});
        break;
      case 'facilities':
        navigation.navigate('FacilityDetails', {id});
        break;
      // Add other cases as needed
    }
  };

  const renderItem = ({item}: any) => {
    const title =
      item.condition_name ||
      item.symptom_name ||
      item.facility_name ||
      item.topic_name ||
      'Unknown';

    const subtitle =
      item.diagnosis || item.about || item.type || item.category || '';

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigateToDetails(item.id)}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: themeColors.primary,
            padding: 15,
            alignItems: 'center',
            borderRadius: 5,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}>
          <Text style={styles.titleText}>{title}</Text>
          <FontAwesome5Icon
            name="chevron-right"
            size={20}
            color={themeColors.white}
          />
        </View>
        {subtitle && (
          <View style={{padding: 10}}>
            <Text style={styles.subtitleText} numberOfLines={2}>
              {subtitle}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {category
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </Text>
      <FlatList
        data={categoryData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
    padding: 15,
  },
  headerText: {
    fontSize: 20,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.black,
    marginBottom: 15,
  },
  listContainer: {
    gap: 10,
  },
  itemContainer: {
    backgroundColor: themeColors.white,

    borderRadius: 10,
    borderWidth: 1,
    borderColor: themeColors.primary,
  },
  titleText: {
    fontSize: 16,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.white,
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
});

export default CategoryResultsScreen;
