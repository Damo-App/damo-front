import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import GroupBox from '../../components/GroupBox';
import { CommonRadio } from '../../components/CommonRadio';
import { commonShadow, commonStyles } from '../../constants/styles';
import { useCategories } from '../../hooks/useCategories'; // Custom hook import
import { instance } from '../../api/axiosInstance'; // Axios instance import
import CommonCheckBox from '../../components/CommonCheckBox';
import { SafeAreaView } from 'react-native-safe-area-context';
import { label } from 'framer-motion/client';
import { G_DARK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';

const MyGroupsScreen = ({ memberId, token }) => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [groups, setGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [checked, setChecked] = useState(false);
  const [isLeader, setIsLeader] = useState([]);

  // Fetch categories using custom hook
  const { categories, isLoading: isLoadingCategories } = useCategories(memberId, token);

  // Fetch groups based on category
  const fetchGroups = async (categoryId) => {
    setIsLoadingGroups(true);
    try {
      const response = await instance.get(`/mypage/groups`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: 1,
          size: 10,
          categoryId: categoryId === '전체' ? null : categoryId,
        },
      });

      console.log('Fetched groups:', response.data.data);
      setGroups(response.data.data || []); // Set groups data
    } catch (error) {
      console.error('Error fetching groups:', error.response?.data || error.message);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  

  const isLeaderGroup = () => {
    const leader = groups.filter(groupData => groupData.role === 'GROUP_LEADER');
    setIsLeader(leader);
  }

  console.log('isLeader', isLeader)
  // Fetch groups when selectedCategory changes
  useEffect(() => {
    fetchGroups(selectedCategory);
  }, [selectedCategory]);

  return (
    <SafeAreaView style={{flex: 1}} edges={['left', 'right', 'bottom']}>
      <View style={[styles.container]}>
        {/* Loading indicator */}
        {isLoadingCategories || isLoadingGroups ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <View style={commonStyles.paddingX}>
            {/* Radio buttons */}
            <CommonRadio
              value={selectedCategory}
              onChange={(value) => {setSelectedCategory(value); setChecked(false);}}
              options={[
                { label: '전체', value: '전체' },
                ...(Array.isArray(categories) ? categories.map((category) => ({
                  label: category.categoryName,
                  value: category.categoryId,
                })) : []), // Safely handle undefined or non-array categories
              ]}
            />
            <View style={{alignItems: 'flex-end'}}>
              <CommonCheckBox 
                label='모임장인 모임만 보기'
                value={checked}
                onValueChange={(value) => {
                  setChecked(value);
                  if(value) {
                    isLeaderGroup();
                  }
                }}
              />
            </View>
            </View>

            {/* Group list */}
            {checked ? (
              isLeader.length > 0  ? (
              <FlatList
                style={[styles.flatList, commonStyles.paddingX]}
                data={checked ? isLeader : groups}
                keyExtractor={(item) => item.groupId.toString()}
                renderItem={({ item }) => (
                  <GroupBox
                    image={item.image}
                    title={item.groupName}
                    text={item.introduction}
                    isLeader={item.role === 'GROUP_LEADER'}
                    currentCount={item.memberCount}
                    maxCount={item.maxMemberCount}
                    onPress={() => console.log(`Group ${item.groupId} clicked!`)}
                  />
                )}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View style={{ height: 20}} />}
              />
              ) : (<View style={styles.emptyTextBox}>
                      <Text style={styles.emptyText}>모임장인 모임이 없습니다.</Text>
                   </View>)
            ) : (
              groups.length > 0 ? (
              <FlatList
                style={[styles.flatList, commonStyles.paddingX]}
                data={checked ? isLeader : groups}
                keyExtractor={(item) => item.groupId.toString()}
                renderItem={({ item }) => (
                  <GroupBox
                  style={commonShadow.mainShadow}
                    image={item.image}
                    title={item.groupName}
                    text={item.introduction}
                    isLeader={item.role === 'GROUP_LEADER'}
                    currentCount={item.memberCount}
                    maxCount={item.maxMemberCount}
                    onPress={() => {
                      navigation.navigate('GroupDetail', {groupId :item.groupId});
                    }}
                  />
                )}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View style={{ height: 20}} />}
              />
            ) : (
              <View style={styles.emptyTextBox}>
                <Text style={styles.emptyText}>해당 카테고리에 모임이 없습니다.</Text>
              </View>
            ))}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...commonStyles.container,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  flatList: {
    flex: 1,
    width: '100%',
  },
  emptyTextBox:{
    marginHorizontal: 16,
    marginTop:5,
    height:'auto',
    paddingVertical:50,
    borderWidth:1,
    borderColor:G_DARK_COLOR,
    borderRadius:12,
    backgroundColor:WHITE_COLOR
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: G_DARK_COLOR,
    textAlign: 'center',
  },
});

export default MyGroupsScreen;
