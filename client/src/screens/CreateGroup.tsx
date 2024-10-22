import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthProvider';
import { useData } from '../contexts/DataProvider';
import axios from 'axios';
import { AccountImage } from '../constants';

const CreateGroup = () => {

    const { setOptions, goBack } = useNavigation();
    const { auth } = useAuth();
    const { conversations, setConversations } = useData();
    const [groupName, setGroupName] = useState('');
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setOptions({
            headerTitle: 'Create group',
            headerRight: () => (
                <TouchableOpacity
                    disabled={loading}
                    style={[styles.headerLeftStyle, (!groupName || users?.length < 2) && { backgroundColor: 'grey' }]}
                    onPress={() => handleCreateGroup()}
                >
                    {
                        loading ?
                            <ActivityIndicator size={'small'} color={'#fff'} />
                            :
                            <Text style={styles.createButtonText} >Create</Text>
                    }
                </TouchableOpacity>
            ),
        });
    }, [groupName, users, loading]);

    const handleAddOrRemoveUser = (id: string) => {
        if (users.includes(id)) {
            setUsers(users.filter((userId) => userId !== id));
        } else {
            setUsers([...users, id]);
        };
    };

    const handleCreateGroup = async () => {
        if (!groupName) {
            return Alert.alert('Group name is required.');
        }
        if (users?.length < 2) {
            return Alert.alert('Add at least 2 users to create a group.');
        };
        try {
            setLoading(true);
            const response = await axios.post(`/api/v1/conversations/create-group`, {
                groupName, users
            });
            const { success, conversation } = response.data;
            if (success) {
                setConversations([conversation, ...conversations]);
                goBack();
            }
        } catch (error: any) {
            console.log(error);
            return Alert.alert(error.response.data.message || error.message || 'something went wrong.');
        } finally {
            setLoading(false);
        };
    };

    return (
        <View style={styles.container} >
            <TextInput
                style={styles.input}
                placeholder="Enter group name"
                value={groupName}
                onChangeText={(text) => setGroupName(text)}
            />
            <ScrollView style={styles.scrollContainer} >
                {auth?.user?.friends.map((friend) => (
                    <View key={friend?.id} style={styles.userCard}>
                        <Image
                            style={styles.image}
                            source={
                                friend?.profile ? {
                                    uri: friend?.profile
                                }
                                    :
                                    { uri: AccountImage }
                            }
                        />
                        <View style={styles.infoContainer}>
                            <Text style={styles.username} numberOfLines={1} >{friend?.username}</Text>
                            <Text style={styles.fullName} numberOfLines={1} >{friend?.fullName}</Text>
                        </View >
                        <TouchableOpacity style={styles.addFriendIcon} onPress={() => handleAddOrRemoveUser(friend?.friendId)} >
                            {
                                users.includes(friend?.friendId) ?
                                    <Ionicons name='remove-circle-outline' size={32} color={'#F43F5E'} />
                                    :
                                    <Ionicons name='add-circle-outline' size={32} color={'green'} />
                            }
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default CreateGroup;

const styles = StyleSheet.create({
    headerLeftStyle: {
        marginTop: 4,
        marginRight: 20,
        backgroundColor: 'green',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        marginVertical: 10,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
        width: '90%',
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    userCard: {
        borderRadius: 15,
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        padding: 8,
        borderWidth: 1.5,
        borderColor: '#f2f2f2',
        marginBottom: 10,
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
    },
});