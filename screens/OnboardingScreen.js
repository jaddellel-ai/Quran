// screens/OnboardingScreen.js
import React, { useRef, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Dimensions,
  TouchableOpacity, ScrollView, Platform, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#2DD4BF',
  primary_light: '#ccfbf1',
  text_primary: '#0e1b1b',
  background: '#F7F7F7',
  image_background: '#FFFFFF',
  gray_200: '#e5e7eb',
  gray_300: '#d1d5db',
  gray_600: '#4b5563',
  gray_700: '#374151',
  gray_800: '#1f2937',
  gray_900: '#111827',
  white: '#ffffff',
};

export default function OnboardingScreen({ onFinish }) {
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = (e) => {
    const pageIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  const goToNextPage = () => {
    const next = currentPage + 1;
    if (next < 3 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: width * next, animated: true });
      setCurrentPage(next);
    }
  };

  const navigateToGoalsScreen = () => {
    // Pass the target tab directly to the onFinish function
    if (onFinish) {
      onFinish('الأهداف');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        <WelcomeScreen onNext={goToNextPage} />
        <FeaturesScreen onNext={goToNextPage} />
        <GoalSettingScreen onFinish={navigateToGoalsScreen} />
      </ScrollView>
    </SafeAreaView>
  );
}

const WelcomeScreen = ({ onNext }) => (
  <View style={styles.page}>
    <View style={styles.content}>
      <View style={welcomeStyles.imageContainer}>
        <Image source={require('../assets/welcome-bg.png')} style={welcomeStyles.image} />
      </View>
      <Text style={welcomeStyles.title}>القرآن في قلبك</Text>
      <Text style={welcomeStyles.quote}>
        "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ"
      </Text>
      <Text style={welcomeStyles.quoteReference}>— سورة القمر، الآية 17</Text>
      <Text style={welcomeStyles.subtitle}>
        ابدأ رحلة الإيمان والسكينة مع القرآن الكريم، ودع آيات الله تنير قلبك وحياتك.
      </Text>
    </View>
    <View style={styles.footer}>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>ابدأ الرحلة</Text>
      </TouchableOpacity>
      <PaginationDots activeIndex={0} />
    </View>
  </View>
);

const FeaturesScreen = ({ onNext }) => (
  <View style={styles.page}>
    <View style={featureStyles.header}>
      <Text style={featureStyles.title}>اكتشف القرآن بطريقة جديدة</Text>
      <Text style={featureStyles.subtitle}>التطبيق الأكثر شمولية وفعالية لمساعدتك على حفظ القرآن الكريم.</Text>
    </View>
    <ScrollView
      style={featureStyles.listContainer}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <FeatureItem icon="style" title="السور كبطاقات" text="استعراض السور كبطاقات لسهولة التصفح والاختيار." />
      <FeatureItem icon="lightbulb" title="نصائح حفظ مخصصة" text="احصل على نصائح حفظ مخصصة تتكيف مع مستواك." />
      <FeatureItem icon="trending-up" title="تتبع التقدم والتحفيز" text="تابع تقدمك واحصل على تحفيز مستمر لإكمال رحلتك." />
    </ScrollView>
    <View style={styles.footer}>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>ابدأ الحفظ</Text>
      </TouchableOpacity>
      <PaginationDots activeIndex={1} />
    </View>
  </View>
);

const FeatureItem = ({ icon, title, text }) => (
  <View style={featureStyles.featureItemContainer}>
    <View style={featureStyles.iconContainer}>
      <MaterialIcons name={icon} size={30} color={colors.primary} />
    </View>
    <View style={featureStyles.textContainer}>
      <Text style={featureStyles.featureTitle}>{title}</Text>
      <Text style={featureStyles.featureText}>{text}</Text>
    </View>
  </View>
);

const GoalSettingScreen = ({ onFinish }) => {
  return (
    <View style={styles.page}>
      <View style={[styles.content, { justifyContent: 'center' }]}>
        <View style={goalStyles.iconContainer}>
          <MaterialIcons name="flag" size={48} color={colors.primary} />
        </View>
        <Text style={goalStyles.title}>أهلاً بك في رحلتك لحفظ القرآن</Text>
        <Text style={goalStyles.description}>ابدأ بتحديد هدفك الأول للحفظ والمتابعة.</Text>
        <View style={{ width: '100%', maxWidth: 340 }}>
          <TouchableOpacity style={styles.primaryButton} onPress={onFinish}>
            <Text style={styles.primaryButtonText}>حدد هدفك الأول</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <PaginationDots activeIndex={2} />
      </View>
    </View>
  );
};

const PaginationDots = ({ activeIndex }) => (
  <View style={styles.pagination}>
    {[0, 1, 2].map((_, idx) => (
      <View key={idx} style={[styles.dot, activeIndex === idx ? styles.activeDot : styles.inactiveDot]} />
    ))}
  </View>
);

// Define all styles at the bottom of the file
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    paddingTop: Platform.OS === 'android' ? 25 : 0 
  },
  page: { 
    width, 
    flex: 1, 
    backgroundColor: colors.background 
  },
  content: { 
    flex: 1, 
    alignItems: 'center' 
  },
  footer: { 
    paddingHorizontal: 24, 
    paddingBottom: 32 
  },
  primaryButton: { 
    backgroundColor: colors.primary, 
    borderRadius: 30, 
    paddingVertical: 15, 
    alignItems: 'center', 
    width: '100%' 
  },
  primaryButtonText: { 
    color: colors.white, 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  pagination: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 24 
  },
  dot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginHorizontal: 5 
  },
  activeDot: { 
    backgroundColor: colors.primary 
  },
  inactiveDot: { 
    backgroundColor: colors.gray_300 
  },
});

const welcomeStyles = StyleSheet.create({
  imageContainer: { 
    width: '100%', 
    backgroundColor: colors.image_background, 
    alignItems: 'center', 
    paddingVertical: 40, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  image: { 
    width: '70%', 
    height: 250, 
    resizeMode: 'contain' 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: colors.gray_900, 
    textAlign: 'center', 
    marginTop: 40 
  },
  quote: { 
    fontSize: 18, 
    color: colors.primary, 
    textAlign: 'center', 
    marginTop: 16, 
    fontFamily: 'Amiri_700Bold' 
  },
  quoteReference: { 
    fontSize: 14, 
    color: colors.gray_600, 
    textAlign: 'center', 
    marginTop: 4 
  },
  subtitle: { 
    fontSize: 16, 
    color: colors.gray_600, 
    textAlign: 'center', 
    lineHeight: 24, 
    maxWidth: '85%', 
    marginTop: 16 
  },
});

const featureStyles = StyleSheet.create({
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 32, 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: colors.gray_900, 
    textAlign: 'center' 
  },
  subtitle: { 
    marginTop: 8, 
    fontSize: 16, 
    color: colors.gray_600, 
    textAlign: 'center' 
  },
  listContainer: { 
    flex: 1, 
    width: '100%', 
    marginTop: 32, 
    paddingHorizontal: 24 
  },
  featureItemContainer: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    gap: 16, 
    marginBottom: 24 
  },
  iconContainer: { 
    width: 48, 
    height: 48, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 12, 
    backgroundColor: colors.primary_light 
  },
  textContainer: { 
    flex: 1 
  },
  featureTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: colors.gray_900, 
    textAlign: 'right' 
  },
  featureText: { 
    fontSize: 14, 
    color: colors.gray_600, 
    textAlign: 'right' 
  },
});

const goalStyles = StyleSheet.create({
  iconContainer: { 
    width: 96, 
    height: 96, 
    marginBottom: 32, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 48, 
    backgroundColor: colors.primary_light 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: colors.gray_800, 
    textAlign: 'center', 
    marginBottom: 8 
  },
  description: { 
    fontSize: 16, 
    color: colors.gray_600, 
    textAlign: 'center', 
    maxWidth: 320, 
    marginBottom: 40 
  },
});