import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Friend, SearchedUser } from '../../types';
import { useAuth } from '../../contexts/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AccountImage } from '../../constants';

interface SearchCardProps {
    user: SearchedUser
}

const SearchCard: React.FC<SearchCardProps> = ({
    user
}) => {

    const { navigate } = useNavigation();
    const { auth, setAuth } = useAuth();
    const [loading, setLoading] = useState(false);

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

    return (
        <TouchableOpacity
            // @ts-expect-error
            onPress={() => user.id === auth?.user?.id ? navigate('Profile') : navigate('Search-Profile', { user })}
            style={styles.container}
        >
            <Image
                style={styles.image}
                source={
                    user?.profile ? {
                        uri: user?.profile
                    }
                        :
                        { uri: AccountImage }
                }
            />
            <View style={styles.infoContainer}>
                <Text style={styles.username} numberOfLines={1} >{user?.username}</Text>
                <Text style={styles.fullName} numberOfLines={1} >{user?.fullName}</Text>
            </View >
            {
                auth?.user?.id !== user.id && <>
                    {
                        auth?.user?.friends?.some(friend => friend.friendId === user.id) ?
                            <TouchableOpacity disabled={loading} style={styles.addFriendIcon} onPress={() => handleRemoveFriend()} >
                                {
                                    loading ?
                                        <ActivityIndicator color={'#F43F5E'} />
                                        :
                                        <Ionicons name='person-remove-outline' size={28} color={'#F43F5E'} />
                                }
                            </TouchableOpacity>
                            :
                            <TouchableOpacity disabled={loading} style={styles.addFriendIcon} onPress={() => handleAddFriend()} >
                                {
                                    loading ?
                                        <ActivityIndicator color={'green'} />
                                        :
                                        <Ionicons name='person-add-outline' size={28} color={'green'} />
                                }
                            </TouchableOpacity>
                    }
                </>
            }
        </TouchableOpacity>
    );
};

export default SearchCard;

const styles = StyleSheet.create({
    container: {
        marginVertical: 5,
        marginHorizontal: 16,
        borderRadius: 15,
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        padding: 8,
        borderWidth: 1.5,
        borderColor: '#f2f2f2'
    },
    image: {
        height: 50,
        width: 50,
        borderRadius: 99,
    },
    infoContainer: {
        marginLeft: 10,
        display: 'flex',
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 3,
    },
    fullName: {
        fontSize: 20,
        fontWeight: '300',
    },
    addFriendIcon: {
        justifyContent: 'center',
        marginLeft: 'auto',
        marginRight: 5
    }
});