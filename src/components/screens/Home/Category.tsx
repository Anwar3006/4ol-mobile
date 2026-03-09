// import React from 'react';
// import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
// import {themeColors} from '../../../theme/colors';
// import {size} from '../../../theme/fontStyle';
// import {CategoryItem, NavigationStackParams} from '../../../interfaces';
// import {categories} from '../../../constants/home';
// import {CategoryComponent} from '../../../constants/hometest';
// import {fonts} from '../../../theme/fonts';
// import {SCREENS} from '../../../constants/screens';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {horizontalScale, verticalScale} from '../../../utils/metrics';
// import {NavigationProp, useNavigation} from '@react-navigation/native';
// import {useWindowDimensions} from 'react-native';

// const Category = () => {
//   const navigation = useNavigation<NavigationProp<CategoryParams>>();
//   const {width, height} = useWindowDimensions();
//   const isTablet = width >= 600; // Typical tablet breakpoint
//   const isSmall = width < 450; // Typical small phone breakpoint
//   // const iconwidth = isTablet ? ;
//   // console.log(width);
//   const conWidth = width - 50; // Adjust container width for small screens
//   const iWidth = isSmall ? 73 : 100;
//   const iHeight = isSmall ? 70 : 100;
//   // const itemsPerRow = isTablet ? 6 : 4;
//   const {categories = []} = CategoryComponent() || {};
//   console.log('categories', categories);
//   // Define responsive breakpoints
//   const getItemsPerRow = (screenWidth: number) => {
//     console.log(screenWidth);
//     console.log(screenWidth);
//     if (screenWidth >= 1600) return 12;
//     if (screenWidth >= 1200) return 9; // Extra large screens
//     if (screenWidth >= 1000) return 8; // Large tablets
//     if (screenWidth >= 800) return 6; // Medium tablets
//     if (screenWidth >= 600) return 5; // Small tablets
//     if (screenWidth >= 400) return 4; // Large phones
//     if (screenWidth >= 300) return 4; // Medium phones
//     return 4; // Phones
//   };

//   const itemsPerRow = getItemsPerRow(width);

//   const itemMargin = horizontalScale(10);
//   // const containerPadding = horizontalScale(20);
//   // const itemWidth =
//   //   (width - containerPadding - (itemsPerRow - 1) * itemMargin) / itemsPerRow;
//   const itemHeight = height * (isTablet ? 0.12 : 0.15);

//   interface CategoryParams {
//     Categories: string | undefined; // Agar 'Categories' screen koi param nahi le rahi
//     // TopRated: { category: string };
//     // Diseases: { category: string };
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headingLabel}>Category</Text>
//         <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
//           <Text style={styles.seeAll}>See all</Text>
//         </TouchableOpacity>
//       </View>

//       {/* <View style={styles.itemsContainer }>
//         {categories.slice(0, 4).map(
//           (item: CategoryItem) => (
//             console.log('item-----', item),
//             (
//               <TouchableOpacity
//                 style={{
//                   width: horizontalScale(77),
//                   // height: verticalScale(5),
//                 }}
//                 key={item.id}
//                 onPress={() => {
//                   navigation.navigate(item?.screen, {category: item?.title});
//                 }}>
//                 <View style={styles.item}>
//                   {item?.icon}
//                   <Text style={styles.title}>{item.title}</Text>
//                 </View>
//               </TouchableOpacity>
//             )
//           ),
//         )}
//       </View> */}

//       <View
//         style={[
//           styles.itemsContainer,
//           {
//             // paddingHorizontal: containerPadding / 2,
//             width: conWidth,
//           },
//         ]}>
//         {categories.slice(0, itemsPerRow).map(
//           (item, index) => (
//             console.log('item-----', item),
//             (
//               <TouchableOpacity
//                 key={item.id}
//                 style={{
//                   width: iWidth,
//                   height: iHeight,
//                   // marginHorizontal: itemMargin / 1,
//                   marginBottom: verticalScale(15),
//                 }}
//                 onPress={() =>
//                   navigation.navigate(item?.screen, {category: item?.title})
//                 }>
//                 <View style={[styles.item, {height: '100%', width: '100%'}]}>
//                   {item?.icon}
//                   <Text style={styles.title}>{item.title}</Text>
//                 </View>
//               </TouchableOpacity>
//             )
//           ),
//         )}
//       </View>
//     </View>
//   );
// };

// export default Category;

// const styles = StyleSheet.create({
//   container: {
//     margin: 0,
//   },
//   header: {
//     display: 'flex',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headingLabel: {
//     fontSize: size.md,
//     color: themeColors.darkGray,
//     fontFamily: fonts.OpenSansBold,
//     textTransform: 'uppercase',
//     marginBottom: 8,
//   },
//   seeAll: {
//     fontSize: size.s,
//     color: themeColors.primary,
//     fontFamily: fonts.OpenSansBold,
//     textTransform: 'uppercase',
//     marginBottom: 5,
//   },
//   // itemsContainer: {
//   //   marginVertical: 10,
//   //   marginBottom: 0,
//   //   flexDirection: 'row',
//   //   // flexWrap: 'wrap',
//   //   justifyContent: 'space-between',
//   // },
//   // item: {
//   //   justifyContent: 'center',
//   //   alignItems: 'center',
//   //   backgroundColor: themeColors.white,
//   //   marginBottom: 15,
//   //   padding: 5,
//   //   borderRadius: 10,
//   //   width: '100%',
//   //   height: verticalScale(95),
//   // },
//   // title: {
//   //   marginTop: 5,
//   //   color: themeColors.black,
//   //   fontSize: size.s,
//   //   fontFamily: fonts.OpenSansMedium,
//   //   // fontWeight: '600',
//   //   textAlign: 'center',
//   //   // height:30

//   itemsContainer: {
//     flexDirection: 'row',
//     width: '100%',
//     flexWrap: 'nowrap',
//     justifyContent: 'space-between', // Changed from space-between
//     // // margin: 'auto',
//   },
//   item: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: themeColors.white,
//     padding: 5,
//     borderRadius: 10,
//   },
//   title: {
//     // fontSize: isTablet ? moderateScale(12) : moderateScale(10),
//     marginTop: 5,
//     fontSize: 13,
//     textAlign: 'center',
//   },
// });
//
//
//
//
//

// import React, {useEffect, useMemo, useState} from 'react';
// import {
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
//   Dimensions,
// } from 'react-native';
// import {themeColors} from '../../../theme/colors';
// import {size} from '../../../theme/fontStyle';
// import {CategoryItem} from '../../../interfaces';
// import {CategoryComponent} from '../../../constants/hometest';
// import {fonts} from '../../../theme/fonts';
// import {horizontalScale, verticalScale} from '../../../utils/metrics';
// import {NavigationProp, useNavigation} from '@react-navigation/native';

// interface CategoryParams {
//   Categories: string | undefined;
// }

// const Category = () => {
//   const navigation = useNavigation<NavigationProp<CategoryParams>>();
//   const window = useWindowDimensions();

//   // State to ensure re-render on fold/unfold
//   const [dimensions, setDimensions] = useState({
//     width: window.width,
//     height: window.height,
//   });

//   useEffect(() => {
//     const subscription = Dimensions.addEventListener('change', ({window}) => {
//       setDimensions({width: window.width, height: window.height});
//     });
//     return () => subscription?.remove();
//   }, []);

//   const getItemsPerRow = (screenWidth: number) => {
//     if (screenWidth >= 1600) return 12;
//     if (screenWidth >= 1200) return 9;
//     if (screenWidth >= 1000) return 8;
//     if (screenWidth >= 800) return 6;
//     if (screenWidth >= 600) return 5;
//     if (screenWidth >= 400) return 4;
//     return 4;
//   };

//   const {itemsPerRow, iWidth, iHeight, conWidth} = useMemo(() => {
//     const isTablet = dimensions.width >= 600;
//     const isSmall = dimensions.width < 450;

//     return {
//       itemsPerRow: getItemsPerRow(dimensions.width),
//       iWidth: isSmall ? 73 : 100,
//       iHeight: isSmall ? 70 : 100,
//       conWidth: dimensions.width - 50,
//     };
//   }, [dimensions.width]);

//   const {categories = []} = CategoryComponent() || {};

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headingLabel}>Category</Text>
//         <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
//           <Text style={styles.seeAll}>See all</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={[styles.itemsContainer, {width: conWidth}]}>
//         {categories.slice(0, itemsPerRow).map((item: CategoryItem) => (
//           <TouchableOpacity
//             key={item.id}
//             style={{
//               width: iWidth,
//               height: iHeight,
//               marginBottom: verticalScale(15),
//             }}
//             onPress={() =>
//               navigation.navigate(item?.screen, {category: item?.title})
//             }>
//             <View style={[styles.item, {height: '100%', width: '100%'}]}>
//               {item?.icon}
//               <Text style={styles.title}>{item.title}</Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// };

// export default Category;

// const styles = StyleSheet.create({
//   container: {
//     margin: 0,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headingLabel: {
//     fontSize: size.md,
//     color: themeColors.darkGray,
//     fontFamily: fonts.OpenSansBold,
//     textTransform: 'uppercase',
//     marginBottom: 8,
//   },
//   seeAll: {
//     fontSize: size.s,
//     color: themeColors.primary,
//     fontFamily: fonts.OpenSansBold,
//     textTransform: 'uppercase',
//     marginBottom: 5,
//   },
//   itemsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'nowrap',
//     justifyContent: 'space-between',
//   },
//   item: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: themeColors.white,
//     padding: 5,
//     borderRadius: 10,
//   },
//   title: {
//     marginTop: 5,
//     fontSize: 13,
//     textAlign: 'center',
//   },
// });
//
//
//
//
//
//

import React, {useState, useCallback, useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {CategoryItem} from '../../../interfaces';
import {CategoryComponent} from '../../../constants/hometest';
import {fonts} from '../../../theme/fonts';
import {verticalScale} from '../../../utils/metrics';
import {NavigationProp, useNavigation} from '@react-navigation/native';

interface CategoryParams {
  Categories: string | undefined;
}

const Category = () => {
  const navigation = useNavigation<NavigationProp<CategoryParams>>();

  // This state will ALWAYS reflect the true width of the container
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [iWidth, setIWidth] = useState<number>(0);
  const [iHeight, setIHeight] = useState<number>(0);
  const handleLayout = useCallback((event: any) => {
    const {width} = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  

  // Function to decide how many icons per row
  const getItemsPerRow = (screenWidth: number) => {
    if (screenWidth >= 1600) return 12;
    if (screenWidth >= 1200) return 9;
    if (screenWidth >= 1000) return 8;
    if (screenWidth >= 800) return 6;
    if (screenWidth >= 600) return 5;
    if (screenWidth >= 400) return 4;
    return 4;
  };

  const itemsPerRow = getItemsPerRow(containerWidth);
  useEffect(() => {
    const isSmall = containerWidth < 450;
    if (containerWidth <= 380) {
      setIWidth(75);
      setIHeight(75);
    } else {
      setIWidth(isSmall ? 88 : 120);
      setIHeight(isSmall ? 80 : 90);
    }
  }, [containerWidth]);

  const {categories = []} = CategoryComponent() || {};

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.header}>
        <Text style={styles.headingLabel}>Category</Text>

        {/* Hidden for now - Uncomment later */}
        {/* <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity> */}
      </View>

      {containerWidth > 0 && (
        <View style={[styles.itemsContainer, {width: containerWidth}]}>
          {categories.slice(0, itemsPerRow).map((item: CategoryItem) => (
            <TouchableOpacity
              key={item.id}
              style={{
                width: iWidth,
                height: iHeight,
                marginBottom: verticalScale(15),
              }}
              onPress={() =>
                navigation.navigate(item?.screen, {category: item?.title})
              }>
              <View style={[styles.item, {height: '100%', width: '100%'}]}>
                {item?.icon}
                <Text style={styles.title}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    margin: 0,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingLabel: {
    fontSize: size.md,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  seeAll: {
    fontSize: size.s,
    color: themeColors.primary,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.white,
    padding: 5,
    borderRadius: 10,
  },
  title: {
    marginTop: 5,
    fontSize: 13,
    textAlign: 'center',
  },
});
