import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  PixelRatio,
  Image,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';

import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import {user} from '../store/selectors';
import {getDiseaseDetailsById} from '../services/diseases';

// Consistent font scaling for iOS and Android
const getFontSize = (size: number) => {
  const scale = PixelRatio.getFontScale();
  return Math.round(size / scale);
};

const FONT_SIZES = {
  title: getFontSize(28),
  sectionTitle: getFontSize(20),
  subTitle: getFontSize(18),
  body: getFontSize(15),
  small: getFontSize(13),
  badge: getFontSize(11),
};

const DiseaseDetails = ({route}: any) => {
  const {width} = useWindowDimensions();
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
          setLoading(false);
        },
        () => setLoading(false),
      );
    }
  }, [id]);

  // HTML rendering styles
  const tagsStyles = {
    body: {
      color: '#334155',
      fontSize: FONT_SIZES.body,
      lineHeight: FONT_SIZES.body * 1.6,
      fontFamily: fonts.OpenSansRegular,
    },
    b: {fontFamily: fonts.OpenSansBold, color: '#0f172a'},
    strong: {fontFamily: fonts.OpenSansBold, color: '#0f172a'},
    p: {marginBottom: 8},
    li: {marginBottom: 6},
  };

  // Section Header Component
  const SectionHeader = ({title, icon, color = themeColors.primary}: any) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.iconBox, {backgroundColor: `${color}15`}]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // Content Card Component
  const ContentCard = ({children, style = {}}: any) => (
    <View style={[styles.card, style]}>{children}</View>
  );

  // Render HTML content or plain text
  const renderContent = (content: string) => {
    if (!content) return null;

    // Check if content contains HTML tags
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);

    if (hasHtmlTags) {
      return (
        <RenderHTML
          contentWidth={width - 80}
          source={{html: content.replace(/\n/g, ' ')}}
          tagsStyles={tagsStyles as any}
        />
      );
    } else {
      // Render as plain text
      return <Text style={styles.bodyText}>{content.replace(/\n/g, ' ')}</Text>;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={themeColors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        {diseaseDetails?.image_url && (
          <Image
            style={styles.heroImage}
            source={{uri: diseaseDetails.image_url}}
            resizeMode="cover"
          />
        )}

        {/* Content Container */}
        <View style={styles.contentWrapper}>
          {/* Title */}
          <Text style={styles.diseaseTitle}>
            {diseaseDetails?.condition_name}
          </Text>

          {/* Verified Badge */}
          <View style={styles.infoBadge}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={12}
              color="#64748B"
              style={{marginRight: 4}}
            />
            <Text style={styles.infoBadgeText}>Verified Clinical Data</Text>
          </View>

          {/* About Section */}
          {diseaseDetails?.about && (
            <ContentCard>
              <SectionHeader
                title="About"
                icon="information-outline"
                color={themeColors.primary}
              />
              {renderContent(diseaseDetails.about)}
            </ContentCard>
          )}

          {/* Types Section (Array) */}
          {diseaseDetails?.types && diseaseDetails.types.length > 0 && (
            <ContentCard>
              <SectionHeader
                title="Types & Classifications"
                icon="format-list-bulleted"
                color={themeColors.primary}
              />
              {diseaseDetails.types.map((type: any, index: number) => (
                <View key={index} style={styles.typeContainer}>
                  {type.type_name && (
                    <Text style={styles.typeName}>{type.type_name}</Text>
                  )}
                  {type.about_type && renderContent(type.about_type)}
                </View>
              ))}
            </ContentCard>
          )}

          {/* Symptoms Section */}
          {diseaseDetails?.symptoms && (
            <ContentCard>
              <SectionHeader
                title="Symptoms"
                icon="alert-circle-outline"
                color="#ef4444"
              />
              {renderContent(diseaseDetails.symptoms)}
            </ContentCard>
          )}

          {/* Causes Section */}
          {diseaseDetails?.causes && diseaseDetails.causes.length > 0 && (
            <ContentCard>
              <SectionHeader
                title="Causes"
                icon="help-circle-outline"
                color="#f59e0b"
              />
              {diseaseDetails.causes.map((cause: any, index: number) => (
                <View key={index} style={styles.causeItem}>
                  {renderContent(cause)}
                </View>
              ))}
            </ContentCard>
          )}

          {/* Diagnosis Section */}
          {diseaseDetails?.diagnosis && (
            <ContentCard>
              <SectionHeader
                title="Diagnosis"
                icon="stethoscope"
                color="#06b6d4"
              />
              {renderContent(diseaseDetails.diagnosis)}
            </ContentCard>
          )}

          {/* Treatment Section */}
          {diseaseDetails?.treating && (
            <ContentCard style={styles.treatmentCard}>
              <SectionHeader
                title="Treatment"
                icon="medical-bag"
                color="#10b981"
              />
              {renderContent(diseaseDetails.treating)}
            </ContentCard>
          )}

          {/* Prevention Section */}
          {diseaseDetails?.prevention && (
            <ContentCard>
              <SectionHeader
                title="Prevention"
                icon="shield-check-outline"
                color="#84cc16"
              />
              {renderContent(diseaseDetails.prevention)}
            </ContentCard>
          )}

          {/* Complications Section */}
          {diseaseDetails?.complications && (
            <ContentCard style={styles.warningCard}>
              <SectionHeader
                title="Complications"
                icon="alert-octagon-outline"
                color="#dc2626"
              />
              {renderContent(diseaseDetails.complications)}
            </ContentCard>
          )}

          {/* When to Contact Doctor */}
          {diseaseDetails?.contact_your_doctor && (
            <ContentCard style={styles.urgentCard}>
              <View style={styles.urgentHeader}>
                <MaterialCommunityIcons
                  name="phone-alert"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.urgentTitle}>
                  When to Contact Your Doctor
                </Text>
              </View>
              <Text style={styles.urgentText}>
                {diseaseDetails.contact_your_doctor}
              </Text>
            </ContentCard>
          )}

          {/* Specialist Contact Card */}
          {diseaseDetails?.specialist_to_contact && (
            <ContentCard style={styles.specialistCard}>
              <View style={styles.specialistHeader}>
                <MaterialCommunityIcons name="doctor" size={26} color="#fff" />
                <Text style={styles.specialistTitle}>Consult a Specialist</Text>
              </View>
              <Text style={styles.specialistText}>
                {diseaseDetails.specialist_to_contact}
              </Text>
            </ContentCard>
          )}

          {/* More Information Section */}
          {diseaseDetails?.more_information && (
            <ContentCard>
              <SectionHeader
                title="Additional Information"
                icon="information"
                color={themeColors.primary}
              />
              {renderContent(diseaseDetails.more_information)}
            </ContentCard>
          )}

          {/* Attribution Footer */}
          {diseaseDetails?.attribution && (
            <View style={styles.attributionContainer}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={16}
                color="#94A3B8"
              />
              <Text style={styles.attributionText}>
                Source:{' '}
                <Text style={styles.attributionSource}>
                  {diseaseDetails.attribution}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#E2E8F0',
  },
  contentWrapper: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  diseaseTitle: {
    fontSize: FONT_SIZES.title,
    fontFamily: fonts.OpenSansBold,
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  infoBadgeText: {
    fontSize: FONT_SIZES.badge,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sectionTitle,
    fontFamily: fonts.OpenSansBold,
    color: '#1E293B',
    flex: 1,
  },
  bodyText: {
    fontSize: FONT_SIZES.body,
    lineHeight: FONT_SIZES.body * 1.6,
    color: '#334155',
    fontFamily: fonts.OpenSansRegular,
  },
  typeContainer: {
    marginBottom: 16,
  },
  typeName: {
    fontSize: FONT_SIZES.subTitle,
    fontFamily: fonts.OpenSansBold,
    color: '#1E293B',
    marginBottom: 8,
  },
  causeItem: {
    marginBottom: 12,
  },
  treatmentCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  warningCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  urgentCard: {
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgentTitle: {
    color: '#fff',
    fontSize: FONT_SIZES.sectionTitle,
    fontFamily: fonts.OpenSansBold,
    marginLeft: 12,
    flex: 1,
  },
  urgentText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: FONT_SIZES.body,
    lineHeight: FONT_SIZES.body * 1.6,
    fontFamily: fonts.OpenSansRegular,
  },
  specialistCard: {
    backgroundColor: themeColors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  specialistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  specialistTitle: {
    color: '#fff',
    fontSize: FONT_SIZES.sectionTitle,
    fontFamily: fonts.OpenSansBold,
    marginLeft: 12,
    flex: 1,
  },
  specialistText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: FONT_SIZES.body,
    lineHeight: FONT_SIZES.body * 1.6,
    fontFamily: fonts.OpenSansRegular,
  },
  attributionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  attributionText: {
    fontSize: FONT_SIZES.small,
    color: '#94A3B8',
    fontFamily: fonts.OpenSansRegular,
    marginLeft: 6,
  },
  attributionSource: {
    color: themeColors.primary,
    fontFamily: fonts.OpenSansSemiBold,
  },
});

export default DiseaseDetails;
