import {ActivityIndicator, Image, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {themeColors} from '../theme/colors';
import {ScrollView} from 'react-native-gesture-handler';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getDiseaseDetailsById} from '../services/diseases';
import {fonts} from '../theme/fonts';
import {size} from '../theme/fontStyle';
import {logActivity} from '../services/activityLogsService';
import {user} from '../store/selectors';
import {useSelector} from 'react-redux';

type DiseaseDetailsProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      id?: string;
    };
  };
};

const DiseaseDetails: React.FC<DiseaseDetailsProps> = ({navigation, route}) => {
  const userData = useSelector(user);
  const {id} = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [diseaseDetails, setDiseaseDetails] = useState<any>();

  useEffect(() => {
    if (id) {
      getDiseaseDetailsById(
        id,
        () => setLoading(true),
        (successData: any) => {
          setDiseaseDetails(successData);
          console.log('Disease details fetched successfully:', successData);
          setLoading(false);
          logActivity(
            {
              user_id: userData?.id || '',
              user_name: `${userData?.first_name || ''} ${
                userData?.last_name || ''
              }`,
              type: 'disease',
              description: `User has browsed disease details`,
              reference: successData?.condition_name || '',
              reference_id: successData?.id || '',
            },
            () => {
              console.log('Logging disease detail visit activity...');
            },
            data => {
              console.log(
                'disease detail visit activity logged successfully:',
                data,
              );
            },
            error => {
              console.error(
                'Error logging disease detail visit activity:',
                error,
              );
            },
          );
        },
        (error: any) => {
          console.log('Error while fetching disease details', error);
          setLoading(false);
        },
      );
    }
  }, [id]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={themeColors.primary} size={'large'} />
        </View>
      ) : !diseaseDetails ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No record found</Text>
        </View>
      ) : (
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            {diseaseDetails?.image_url ? (
              <Image
                source={{uri: diseaseDetails?.image_url}}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>
          <Text style={styles.diseaseName}>
            {diseaseDetails?.condition_name}
          </Text>
          {diseaseDetails?.about && (
            <View>
              <Text style={styles.title}>
                About {diseaseDetails?.condition_name}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.description}>{diseaseDetails?.about}</Text>
            </View>
          )}
          {diseaseDetails?.types?.length > 0 ? (
            <View>
              <Text style={[styles.title]}>
                Types of {diseaseDetails?.condition_name}
              </Text>
              <View style={styles.separator} />
              {diseaseDetails?.types?.map((d: any, i: any) => {
                return (
                  <View key={i.toString()}>
                    <Text style={[styles.title]}>
                      {`${i + 1}) ${d?.type_name}`}
                    </Text>
                    <Text style={styles?.description}>{d?.about_type}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          {diseaseDetails?.causes?.length > 0 ? (
            <View>
              <Text style={[styles.title, {marginBottom: 0}]}>
                Causes of {diseaseDetails?.condition_name}
              </Text>
              <View style={styles.separator} />
              {diseaseDetails?.causes?.map((d: any, i: any) => {
                return (
                  <View key={i.toString()}>
                    <Text style={[styles.title]}>
                      {`${i + 1}) ${d.cause_name}`}
                    </Text>
                    <Text style={styles.description}>
                      {d?.other_possible_causes}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          {diseaseDetails?.diagnosis && (
            <View>
              <Text style={styles.title}>
                Diagnosing {diseaseDetails?.condition_name}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.description}>
                {diseaseDetails?.diagnosis}
              </Text>
            </View>
          )}
          {diseaseDetails?.treating && (
            <View>
              <Text style={styles.title}>
                Treating {diseaseDetails?.condition_name}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.description}>{diseaseDetails?.treating}</Text>
            </View>
          )}
          {diseaseDetails?.complications && (
            <View>
              <Text style={styles.title}>
                Complications of {diseaseDetails?.condition_name}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.description}>
                {diseaseDetails?.complications}
              </Text>
            </View>
          )}
          {diseaseDetails?.symptoms && (
            <View>
              <Text style={styles.title}>
                Symptoms of {diseaseDetails?.condition_name}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.description}>{diseaseDetails?.symptoms}</Text>
            </View>
          )}
          {diseaseDetails?.prevention && (
            <View>
              <Text style={styles.title}>
                Preventing {diseaseDetails?.condition_name}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.description}>
                {diseaseDetails?.prevention}
              </Text>
            </View>
          )}
          {diseaseDetails?.specialist_to_contact && (
            <View>
              <Text style={styles.title}>Specialist to contact</Text>
              <View style={styles.separator} />
              <Text style={styles.description}>
                {diseaseDetails?.specialist_to_contact}
              </Text>
            </View>
          )}
          {diseaseDetails?.contact_your_doctor && (
            <View>
              <Text style={styles.title}>Contact your doctor</Text>
              <View style={styles.separator} />
              <Text style={styles.description}>
                {diseaseDetails?.contact_your_doctor}
              </Text>
            </View>
          )}
          {diseaseDetails?.more_information && (
            <View>
              <Text style={styles.title}>More information</Text>
              <View style={styles.separator} />
              <Text style={styles.description}>
                {diseaseDetails?.more_information}
              </Text>
            </View>
          )}
          {diseaseDetails?.attribution && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginTop: 20,
              }}>
              <Text
                style={[styles.description, {fontFamily: fonts.OpenSansBold}]}>
                Source:{' '}
              </Text>
              <Text style={[styles.description, {color: themeColors.primary}]}>
                {diseaseDetails?.attribution}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default DiseaseDetails;

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
  diseaseName: {
    fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
    fontSize: size.xlg,
    marginBottom: 10,
    alignSelf: 'center',
    marginTop: 5,
  },
  title: {
    fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
    fontSize: size.lg,
    marginTop: 20,
  },
  description: {
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
    fontSize: size.md,
  },
  imageContainer: {
    width: '100%',
    height: 200, // Adjust height as needed
    backgroundColor: '#f0f0f0', // Fallback background color
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Optional: rounded corners
    overflow: 'hidden', // Ensures image respects border radius
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0', // Placeholder color
  },
  separator: {
    height: 2,
    width: '100%',
    backgroundColor: '#ccc', // Grey line color
    marginVertical: 8,
    fontWeight: 'bold',
  },
});
