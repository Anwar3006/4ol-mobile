import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {CategoryItem} from '../../interfaces';
import {themeColors} from '../../theme/colors';
import {categories} from '../../constants/home';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SCREENS} from '../../constants/screens';

type CategoriesProps = {
  navigation: NativeStackNavigationProp<any>;
};

const Categories: React.FC<CategoriesProps> = ({navigation}) => {
  const renderItem = ({item}: {item: CategoryItem}) => (
    <TouchableOpacity
      key={item.id}
      style={styles.item}
      onPress={() => {
        navigation.navigate(item?.screen, {category: item.title});
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
        <View style={styles.iconContainer}>{item?.icon}</View>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <View>
        <Icon name={'arrow-right'} size={15} color={themeColors.primary} />
      </View>
    </TouchableOpacity>
  );

  const sortedCategories = [...categories].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Categories</Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={sortedCategories}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: themeColors.lightGray,
  },
  header: {
    fontSize: size.md,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: themeColors.white,
    marginBottom: 20,
    borderRadius: 10,
  },
  iconContainer: {
    marginRight: 10,
    width: 40,
  },
  title: {
    fontSize: size.md,
    color: themeColors.black,
    fontFamily: fonts.OpenSansMedium,
    flex: 1,
  },
});
