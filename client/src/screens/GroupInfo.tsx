import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthProvider';
import { useData } from '../contexts/DataProvider';
import axios from 'axios';
import UpdateGroupModel from '../components/group-chat/UpdateGroupModel';
import AddPeopleModel from '../components/group-chat/AddPeopleModel';
import { AccountImage, GroupImage } from '../constants';


interface GroupInfoScreenProps {
    route: {
        params: {
            conversationId: string;
        };
    };
};


const GroupInfo: React.FC<GroupInfoScreenProps> = ({
    route
}) => {

    const { setOptions, navigate } = useNavigation();
    const { auth } = useAuth();
    const { conversations, setConversations } = useData();
    const { conversationId } = route.params;
    const [loading, setLoading] = useState(false);
    const [openEditInfoModel, setOpenEditInfoModel] = useState(false);
    const [openAddPeopleModel, setOpenAddPeopleModel] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const conversation = conversations.find(con => con.id === conversationId);

    useEffect(() => {
        setOptions({
            // @ts-expect-error
            headerTitle: truncateText(conversation?.groupName, 20),
            headerRight: () => auth?.user?.id === conversation?.groupAdminId && (
                <View style={{ flexDirection: 'row' }} >
                    <TouchableOpacity
                        style={{ marginRight: 20 }}
                        onPress={() => setOpenAddPeopleModel(true)}
                    >
                        <Ionicons name='add' size={28} color={'green'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ marginRight: 20 }}
                        onPress={() => setOpenEditInfoModel(true)}
                    >
                        <Ionicons name='create-outline' size={28} color={'#F43F5E'} />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigate, conversation, auth]);

    const handleRemoveUser = async (id: string) => {
        try {
            setLoading(true);
            setUserId(id);
            const response = await axios.patch(`/api/v1/conversations/group/remove-user`, {
                conversationId: conversation?.id,
                userId: id
            });
            const { success } = response.data;
            if (success) {
                setConversations(prevConversations => {
                    const updatedConversations = prevConversations.map(con => {
                        if (con.id === conversation?.id) {
                            return {
                                ...con,
                                users: con.users.filter(user => user.id !== id)
                            };
                        }
                        return con;
                    });
                    return updatedConversations;
                });
            }
        } catch (error: any) {
            console.log(error);
            return Alert.alert(error.response.data.message || error.message || 'something went wrong.');
        } finally {
            setLoading(false);
            setUserId(null);
        };
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text?.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };


    return (
        <View style={styles.container} >
            <View style={[styles.gropInfoContainer, !conversation?.groupAbout && { justifyContent: 'center' }]}>
                <Image
                    source={conversation?.groupProfile ? {
                        uri: conversation.groupProfile
                    } :
                        { uri: GroupImage }
                    }
                    style={styles.groupImage}
                />
                {conversation?.groupAbout && (
                    <Text style={styles.groupAbout} >
                        {truncateText(conversation?.groupAbout, 100)}
                    </Text>
                )}
            </View>
            <ScrollView style={styles.scrollContainer} >
                {
                    conversation?.users?.map(user => (
                        <TouchableOpacity
                            disabled={user?.id === auth?.user?.id}
                            // @ts-expect-error
                            onPress={() => navigate('Search-Profile', { user })}
                            key={user?.id}
                            style={styles.userCard}
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
                            {auth?.user?.id === conversation.groupAdminId && (
                                <TouchableOpacity
                                    disabled={loading}
                                    style={[styles.addFriendIcon, user?.id === conversation?.groupAdminId && { display: 'none' }]}
                                    onPress={() => handleRemoveUser(user?.id)}
                                >
                                    {
                                        (loading && userId === user?.id) ? <ActivityIndicator size={'small'} color={'#F43F5E'} />
                                            :
                                            <Ionicons name='remove-circle-outline' size={32} color={'#F43F5E'} />
                                    }
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    ))
                }
            </ScrollView>
            <UpdateGroupModel
                conversation={conversation}
                isOpen={openEditInfoModel}
                onClose={() => setOpenEditInfoModel(false)}
            />
            <AddPeopleModel
                conversationId={conversation?.id}
                isOpen={openAddPeopleModel}
                onClose={() => setOpenAddPeopleModel(false)}
            />
        </View>
    );
};

export default GroupInfo;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    gropInfoContainer: {
        width: '90%',
        paddingHorizontal: 5,
        paddingVertical: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
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
    groupImage: {
        height: 100,
        width: 100,
        borderRadius: 99
    },
    groupAbout: {
        width: '70%',
        height: 'auto',
        textAlign: 'auto',
        fontSize: 18,
        fontWeight: '300'
    },
});