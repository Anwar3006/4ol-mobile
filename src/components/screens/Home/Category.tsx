import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {CategoryItem, NavigationStackParams} from '../../../interfaces';
import {categories} from '../../../constants/home';
import {fonts} from '../../../theme/fonts';
import {SCREENS} from '../../../constants/screens';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {horizontalScale} from '../../../utils/metrics';
import {NavigationProp, useNavigation} from '@react-navigation/native';

const Category = () => {
  const navigation = useNavigation<NavigationProp<CategoryParams>>();

  interface CategoryParams {
    Categories: string | undefined; // Agar 'Categories' screen koi param nahi le rahi
    // TopRated: { category: string };
    // Diseases: { category: string };
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headingLabel}>Category</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemsContainer}>
        {categories.slice(0, 4).map(
          (item: CategoryItem) => (
            console.log('item-----', item),
            (
              <TouchableOpacity
                style={{width: horizontalScale(77)}}
                key={item.id}
                onPress={() => {
                  navigation.navigate(item?.screen, {category: item?.title});
                }}>
                <View style={styles.item}>
                  {item?.icon}
                  <Text style={styles.title}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            )
          ),
        )}
      </View>
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {},
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingLabel: {
    fontSize: size.md,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
  },
  seeAll: {
    fontSize: size.s,
    color: themeColors.primary,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
  },
  itemsContainer: {
    marginVertical: 10,
    marginBottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.white,
    marginBottom: 15,
    padding: 5,
    borderRadius: 10,
    width: '100%',
    height: 95,
  },
  title: {
    marginTop: 5,
    color: themeColors.black,
    fontSize: size.s,
    fontFamily: fonts.OpenSansMedium,
    textAlign: 'center',
    // height:30
  },
});
