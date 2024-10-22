import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Friend, SearchedUser } from '../types';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useData } from '../contexts/DataProvider';
import { AccountImage } from '../constants';

type ProfileRouteParams = {
    Profile: {
        user: SearchedUser;
    };
};

const SearchProfile: React.FC = () => {

    const { auth, setAuth } = useAuth();
    const { conversations, setConversations } = useData();
    const { user } = useRoute<RouteProp<ProfileRouteParams>>().params;
    const { navigate, setOptions } = useNavigation();
    const [loading, setLoading] = useState(false);
    const [conversationLoading, setConversationLoding] = useState(false);

    useEffect(() => {
        setOptions({
            headerTitle: user.username
        });
    }, [user.username])

    const updateFriends = async (newFriends: Friend[]) => {
        setAuth({
            ...auth,
            user: {
                ...auth.user!,
                friends: newFriends,
            },
        });
        // Update AsyncStorage
        await AsyncStorage.setItem('auth', JSON.stringify({
            ...auth,
            user: {
                ...auth.user!,
                friends: newFriends,
            },
        }));
    };

    const handleAddFriend = async () => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/v1/users/add-friend`, {
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                profile: user.profile || undefined,
                about: user.about,
                friendId: user.id
            });
            const { success, friend } = response.data;
            if (success) {
                await updateFriends([...auth.user!.friends, friend]);
            }
        } catch (error: any) {
            console.log(error);
            return Alert.alert(error.response.data.message || error.message || 'something went wrong.');
        } finally {
            setLoading(false);
        }
    }

    const handleRemoveFriend = async () => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/v1/users/remove-friend`, {
                id: auth?.user?.friends?.filter(f => f.friendId === user.id)[0].id,
            });
            const { success, friend } = response.data;
            if (success) {
                const updatedFriends = auth.user!.friends.filter(
                    (f) => f.id !== friend.id
                );
                await updateFriends(updatedFriends);
            }
        } catch (error: any) {
            console.log(error);
            return Alert.alert(error.response.data.message || error.message || 'something went wrong.');
        } finally {
            setLoading(false);
        }
    }

    const handleCreateConversation = async () => {
        const existingConversation = conversations.find(con => !con.isGroup && con.users.find(u => u.id === user.id));
        if (existingConversation) {
            const otherUser = existingConversation?.users?.find((user) => user.id !== auth?.user?.id);
            // @ts-expect-error
            return navigate('Chat', { conversationId: existingConversation.id, otherUser });
        }
        try {
            setConversationLoding(true);
            const response = await axios.post(`/api/v1/conversations/create`, {
                friendId: user.id,
            });
            const { success, conversation } = response.data;
            if (success) {
                setConversations([conversation, ...conversations]);
                const otherUser = conversation?.users?.find((user: any) => user.id !== auth?.user?.id);
                // @ts-expect-error
                return navigate('Chat', { conversationId: conversation?.id, otherUser });
            }
        } catch (error: any) {
            console.log(error);
            return Alert.alert(error.response.data.message || error.message || 'something went wrong.');
        } finally {
            setConversationLoding(false);
        }
    };

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#fff'
            }}
        >
            <View
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 20
                }}
            >
                {
                    user?.profile ?
                        <Image
                            source={{
                                uri: user?.profile
                            }}
                            style={{
                                height: 150,
                                width: 150,
                                borderRadius: 100,
                                borderWidth: 2,
                                borderColor: 'lightgrey'
                            }}
                        />
                        :
                        <Image
                            source={{ uri: AccountImage }}
                            style={{
                                height: 150,
                                width: 150,
                                borderRadius: 100,
                                borderWidth: 2,
                                borderColor: 'lightgrey'
                            }}
                        />
                }
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '600',
                        color: 'grey',
                        marginTop: 16
                    }}
                >
                    {user?.fullName}
                </Text>
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: 'grey',
                        marginTop: 4,
                        overflow: 'hidden'
                    }}
                >
                    {user?.email}
                </Text>
                <View>
                    {user?.about ?
                        (
                            <Text
                                style={{
                                    marginTop: 20,
                                    fontSize: 14,
                                    fontWeight: '500',
                                    color: 'grey',
                                    overflow: 'hidden'
                                }}
                            >
                                {user?.about}
                            </Text>
                        ) :
                        (
                            <Text
                                style={{
                                    marginTop: 20,
                                    fontSize: 14,
                                    fontWeight: '500',
                                    color: 'grey',
                                    overflow: 'hidden'
                                }}
                            >
                                {user?.fullName} Don't have information in bio.
                            </Text>
                        )
                    }
                </View>
                {
                    auth?.user?.friends?.some(friend => friend.friendId === user.id) ?
                        <TouchableOpacity
                            disabled={loading}
                            onPress={handleRemoveFriend}
                            style={{
                                marginTop: 30,
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 6,
                                paddingHorizontal: 20,
                                borderWidth: 1,
                                borderColor: '#F43F5E',
                                borderRadius: 10
                            }}
                        >
                            {!loading &&
                                <Ionicons
                                    name="checkmark"
                                    size={24}
                                    color="#F43F5E"
                                />
                            }
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: '#F43F5E'
                                }}
                            >
                                {
                                    loading ?
                                        <ActivityIndicator color={'#F43F5E'} />
                                        :
                                        'Unfriend'
                                }
                            </Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity
                            disabled={loading}
                            onPress={handleAddFriend}
                            style={{
                                marginTop: 30,
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 6,
                                paddingHorizontal: 20,
                                borderWidth: 1,
                                borderColor: 'green',
                                borderRadius: 10
                            }}
                        >
                            {!loading &&
                                <Ionicons
                                    name="person-add-outline"
                                    size={24}
                                    color="green"
                                />
                            }
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: 'green'
                                }}
                            >
                                {
                                    loading ?
                                        <ActivityIndicator color={'green'} />
                                        :
                                        'Add Friend'
                                }
                            </Text>
                        </TouchableOpacity>
                }
                <TouchableOpacity
                    disabled={conversationLoading}
                    onPress={() => handleCreateConversation()}
                    style={{
                        marginTop: 15,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 6,
                        paddingHorizontal: 20,
                        borderWidth: 1,
                        borderColor: '#03cafc',
                        borderRadius: 10
                    }}
                >
                    {!conversationLoading && (
                        <Ionicons
                            name="send-outline"
                            size={24}
                            color="#03cafc"
                        />
                    )}
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#03cafc'
                        }}
                    >
                        {
                            conversationLoading ?
                                <ActivityIndicator color={'#03cafc'} />
                                :
                                'Send Message'
                        }
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default SearchProfile;