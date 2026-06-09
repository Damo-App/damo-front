import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonShadow } from '../../constants/styles';
import { instance, API_BASE_URL } from '../../api/axiosInstance';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const UserListScreen = () => {
    const navigation = useNavigation();
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();
    const usersPerPage = 5;

    // 화면에 포커스될 때마다 데이터 새로고침
    useFocusEffect(
        React.useCallback(() => {
            queryClient.invalidateQueries(['users']);
        }, [])
    );

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['users', currentPage],
        queryFn: async () => {
            try {
                const response = await instance.get(`/members?page=${currentPage}&size=${usersPerPage}`);
                return response.data;
            } catch (error) {
                if (error.response?.status === 401) {
                    navigation.navigate('Login');
                    throw new Error('로그인이 필요합니다.');
                }
                throw error;
            }
        },
        keepPreviousData: true,
        staleTime: 0 // 항상 최신 데이터를 가져오도록 설정
    });

    // 관리자와 탈퇴한 회원 필터링
    const filteredUsers = React.useMemo(() => {
        console.log('data?.data', data?.data);
        if (!data?.data) return [];
        const filtered = data.data.filter(user => 
            // user.email !== 'h4@gmail.com' && 
            user.memberStatus !== 'MEMBER_QUIT'
        );
        return filtered;
    }, [data?.data]);

    if (isLoading) return <Text>Loading...</Text>;
    if (isError) {
        console.log('Error details:', error);
        return <Text>Error loading users: {error.message}</Text>;
    }

    const renderUserItem = ({ item }) => {
        // 이미 filteredUsers에서 필터링되었으므로 추가 검사 불필요
        return (
            <View style={[styles.userCard]}>
                <View style={styles.userInfo}>
                    <Image 
                        source={{uri: `${API_BASE_URL}${item.image}`}} 
                        style={styles.userImage} 
                    />
                    <View style={styles.nicknameContainer}>
                        <Text style={styles.dotText}>●</Text>
                        <Text style={styles.nicknameLabel}>닉네임 : </Text>
                        <Text style={styles.nicknameText}>{item.name}</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={[styles.detailButton, commonShadow.mainShadow]}         
                    onPress={() => navigation.navigate('회원 관리', { memberId: item.memberId })}
                >
                    <Text style={styles.detailButtonText}>상세조회</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderPagination = () => {
        const totalPages = data?.pageInfo?.totalPages || 1;
        const pageNumbers = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <View style={styles.paginationContainer}>
                <TouchableOpacity 
                    style={styles.paginationArrow}
                    onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <Text style={currentPage === 1 ? styles.paginationArrowDisabled : styles.paginationArrow}>{'<'}</Text>
                </TouchableOpacity>
                {pageNumbers.map((page) => (
                    <TouchableOpacity
                        key={page}
                        style={[
                            styles.paginationButton,
                            page === currentPage && styles.paginationButtonActive,
                        ]}
                        onPress={() => setCurrentPage(page)}
                    >
                        <Text
                            style={[
                                styles.paginationText,
                                page === currentPage && styles.paginationTextActive,
                            ]}
                        >
                            {page}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity 
                    style={styles.paginationArrow}
                    onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    <Text style={currentPage === totalPages ? styles.paginationArrowDisabled : styles.paginationArrow}>{'>'}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <FlatList
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.memberId.toString()}
                    contentContainerStyle={styles.listContainer}
                />
            </View>
            <View style={styles.paginationWrapper}>
                {renderPagination()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F3FF',
        paddingTop: 10,
    },
    contentContainer: {
        flex: 1,
    },
    listContainer: {
        paddingBottom: 10,
    },
    paginationWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F7F3FF',
        paddingVertical: 8,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: WHITE_COLOR,
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 25,
        marginVertical: 10,
        borderWidth: 0.8,
        borderColor: BLACK_COLOR,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        width: 45,
        height: 45,
        borderRadius: 25,
        marginRight: 15,
    },
    nicknameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dotText: {
        color: '#4CAF50',
        marginRight: 8,
        fontSize: 8,
    },
    nicknameLabel: {
        fontSize: 16,
        color: BLACK_COLOR,
    },
    nicknameText: {
        fontSize: 16,
        color: BLACK_COLOR,
        fontWeight: '500',
    },
    detailButton: {
        backgroundColor: '#FFD700',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginBottom: 2,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: BLACK_COLOR,
    },
    detailButtonText: {
        fontSize: 14,
        color: BLACK_COLOR,
        fontWeight: '500',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    paginationButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        borderRadius: 15,
    },
    paginationButtonActive: {
        backgroundColor: '#FFD700',
        borderWidth: 1,
        borderColor: BLACK_COLOR,
    },
    paginationText: {
        fontSize: 12,
        color: BLACK_COLOR,
    },
    paginationTextActive: {
        fontWeight: 'bold',
    },
    paginationArrow: {
        padding: 10,
        color: BLACK_COLOR,
    },
    paginationArrowDisabled: {
        padding: 10,
        color: '#CCCCCC',
    },
});

export default UserListScreen; 