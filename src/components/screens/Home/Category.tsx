import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {CategoryItem} from '../../../interfaces';
import {categories} from '../../../constants/home';
import {fonts} from '../../../theme/fonts';
import {horizontalScale, verticalScale} from '../../../utils/metrics';
import {NavigationProp, useNavigation} from '@react-navigation/native';

const Category = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headingLabel}>Category</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {categories.slice(0, 4).map((item: CategoryItem) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => {
              navigation.navigate(item?.screen, {category: item?.title});
            }}>
            <View style={styles.iconContainer}>{item?.icon}</View>
            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: horizontalScale(10),
    marginBottom: verticalScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
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
  scrollContent: {
    paddingRight: horizontalScale(7),
  },
  item: {
    width: horizontalScale(95),
    height: verticalScale(102),
    backgroundColor: themeColors.white,
    borderRadius: 10,
    marginRight: horizontalScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
  },
  iconContainer: {
    marginBottom: verticalScale(8),
  },
  title: {
    color: themeColors.black,
    fontSize: size.md,
    fontFamily: fonts.OpenSansMedium,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '100%', // Ensure text doesn't overflow
    paddingHorizontal: horizontalScale(4), // Small padding to prevent edge touching
  },
});
