import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import ImageCard from '../../components/animation/ImageCard';
import { BLACK_COLOR } from '../../constants/colors';
import { commonStyles, homeStyles } from '../../constants/styles';

const { width } = Dimensions.get('window');

const images = [
  require('../../../assets/images/loopimg/left/1.png'),
  require('../../../assets/images/loopimg/left/2.png'),
  require('../../../assets/images/loopimg/left/3.png'),
  require('../../../assets/images/loopimg/left/4.png'),
  require('../../../assets/images/loopimg/left/5.png'),
  require('../../../assets/images/loopimg/left/6.png'),
  require('../../../assets/images/loopimg/left/7.png'),
  require('../../../assets/images/loopimg/left/8.png'),
  require('../../../assets/images/loopimg/left/9.png'),
  require('../../../assets/images/loopimg/left/10.png'),
  require('../../../assets/images/loopimg/left/11.png'),
  require('../../../assets/images/loopimg/left/12.png'),
  require('../../../assets/images/loopimg/left/13.png'),
];

function HomeScreen() {
  const offsetLeft = useSharedValue(0);
  const offsetRight = useSharedValue(0);
  const imageWidth = 70; // 각 이미지의 가로 크기
  const totalWidth = images.length * imageWidth; // 한 세트의 총 너비

  useEffect(() => {
    offsetLeft.value = withRepeat(
      withTiming(-totalWidth, {
        duration: 11000, // 10초 동안 이동
        easing: Easing.linear, // 부드러운 연속 이동
      }),
      -1, // 무한 반복
      false // 뒤집기 없음 (순방향 이동만)
    );

    offsetRight.value = withRepeat(
      withTiming(totalWidth, {
        duration: 11000, 
        easing: Easing.linear, 
      }),
      -1, 
      false 
    );
  }, []);

  const animatedStyleLeft = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetLeft.value }],
  }));

  const animatedStyleRight = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetRight.value }],
  }));

  const initialOffset = useMemo(() => ({ transform: [{ translateX: -totalWidth }] }), [totalWidth]);

  return (
    <View style={homeStyles.container}>
      <Animated.View style={[styles.imageContainer1, animatedStyleLeft]}>
        {[...images, ...images].map((item, idx) => (
          <ImageCard image={item} key={idx} />
        ))}
      </Animated.View>

      <View style={styles.logoContainer}>
        <Image source={require('../../../assets/images/landingLogo.png')} style={styles.image} />
      </View>

      <Animated.View style={[styles.imageContainer2, initialOffset, animatedStyleRight]}>
        {[...images, ...images].map((item, idx) => (
          <ImageCard image={item} key={idx} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    // borderStyle:'solid',
    // borderColor:BLACK_COLOR,
    // borderWidth:1,
    paddingVertical: 30,
  },
  imageContainer1: {
    flexDirection: 'row',
    gap: 10,
    width: images.length * 100, // 무한 루프를 위해 한 번에 보여줄 총 이미지 크기
  },
  logoContainer:{
    marginVertical:20,
    width: '100%',
    // maxHeight: 160
  },
  image: {
   
    width: '100%',
    // maxHeight: 160,
    resizeMode: 'contain',
  },
  imageContainer2: {
    marginLeft: -images.length * 100,
    flexDirection: 'row',
    gap: 10,
    width: images.length * 100, // 무한 루프를 위해 한 번에 보여줄 총 이미지 크기
  },
});

export default HomeScreen;
