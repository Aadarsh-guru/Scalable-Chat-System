import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../contexts/DataProvider';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthProvider';
import { AccountImage } from '../../constants';

interface AddPeopleModelProps {
    conversationId: string | undefined;
    isOpen: boolean;
    onClose: () => void;
};

const AddPeopleModel: React.FC<AddPeopleModelProps> = ({
    conversationId, isOpen, onClose
}) => {

    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { conversations, setConversations } = useData();
    const conversation = conversations.find(con => con.id === conversationId);
    const { auth } = useAuth();

    const handleAddUser = async (id: string) => {
        try {
            setLoading(true);
            setUserId(id);
            const response = await axios.patch(`/api/v1/conversations/group/add-user`, {
                conversationId: conversation?.id,
                userId: id
            });
            const { success, newConversation } = response.data;
            if (success) {
                setConversations(prevConversations => {
                    const updatedConversations = prevConversations.map(con => {
                        if (con.id === conversation?.id) {
                            return {
                                ...con,
                                users: [...newConversation?.users]
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

    return (
        <Modal transparent visible={isOpen} animationType="fade">
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
                <View style={{
                    backgroundColor: '#f2f2f2',
                    padding: 20,
                    borderRadius: 8,
                    width: '95%',
                }}>
                    <Text
                        style={{
                            marginBottom: 15,
                            textAlign: 'center',
                            fontWeight: '500',
                            color: 'grey'
                        }}
                    >
                        Add more people
                    </Text>
                    <ScrollView style={styles.scrollContainer} >
                        {
                            auth?.user?.friends?.map(user => (
                                <View key={user?.id} style={[styles.userCard, conversation?.users?.some(u => u.id === user?.friendId) && { display: 'none' }]}>
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
                                    <TouchableOpacity
                                        disabled={loading}
                                        style={[styles.addFriendIcon, user?.id === conversation?.groupAdminId && { display: 'none' }]}
                                        onPress={() => handleAddUser(user?.friendId)}
                                    >
                                        {
                                            (loading && userId === user?.friendId) ? <ActivityIndicator size={'small'} color={'green'} />
                                                :
                                                <Ionicons name='add-circle-outline' size={32} color={'green'} />
                                        }
                                    </TouchableOpacity>
                                </View>
                            ))
                        }
                    </ScrollView>
                    <View style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: 15,
                    }}>
                        <TouchableOpacity
                            disabled={loading}
                            style={{
                                width: '100%',
                                paddingVertical: 10,
                                paddingHorizontal: 10,
                                backgroundColor: '#fff',
                                borderWidth: 1,
                                borderColor: 'grey',
                                borderRadius: 10,
                            }}
                            onPress={() => onClose()}>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '500',
                                    color: '#000',
                                    textAlign: 'center'
                                }}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AddPeopleModel;


const styles = StyleSheet.create({
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        width: '100%',
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    scrollContainer: {
        maxHeight: '70%',
        width: '100%',
        paddingVertical: 5,
    },
    userCard: {
        borderRadius: 15,
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        padding: 8,
        borderWidth: 1,
        borderColor: 'grey',
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