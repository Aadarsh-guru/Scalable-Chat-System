import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useData } from '../../contexts/DataProvider';
import axios from 'axios';
import { Conversation } from '../../types';
import { useAuth } from '../../contexts/AuthProvider';

interface GroupChatInfoModelProps {
    conversation: Conversation | undefined;
    isOpen: boolean;
    onClose: () => void;
    goBack: () => void;
};

const GroupChatInfoModel: React.FC<GroupChatInfoModelProps> = ({
    conversation, isOpen, onClose, goBack
}) => {

    const { auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const { setConversations } = useData();

    const handleDeleteClick = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(`/api/v1/conversations/delete/${conversation?.id}`);
            const { success } = response.data;
            if (success) {
                setConversations((prevConversations) => prevConversations.filter((prevConversation) => prevConversation.id !== conversation?.id));
                onClose();
                goBack();
            };
        } catch (error: any) {
            return Alert.alert(error.response.data.message || error.message || 'Something went wrong.')
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveClick = async () => {
        setLoading(true);
        try {
            const response = await axios.patch(`/api/v1/conversations/leave-group`, {
                conversationId: conversation?.id,
            });
            const { success } = response.data;
            if (success) {
                setConversations((prevConversations) => prevConversations.filter((prevConversation) => prevConversation.id !== conversation?.id));
                onClose();
                goBack();
            };
        } catch (error: any) {
            return Alert.alert(error.response.data.message || error.message || 'Something went wrong.')
        } finally {
            setLoading(false);
        }
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
                    width: 250,
                }}>
                    <Text
                        style={{
                            marginBottom: 15,
                            textAlign: 'center',
                            fontWeight: '500',
                            color: 'grey'
                        }}
                    >
                        {
                            conversation?.groupAdminId === auth?.user?.id ?
                                'Are You Sure you want to delete this group ?.'
                                :
                                'Are You Sure you want to leave this group ? .                            '
                        }
                    </Text>
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
                                backgroundColor: loading ? '#c72641' : '#F43F5E',
                                borderRadius: 10,
                            }}
                            onPress={() => conversation?.groupAdminId === auth?.user?.id ? handleDeleteClick() : handleLeaveClick()}>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '500',
                                    color: '#fff',
                                    textAlign: 'center',
                                }}>
                                {
                                    loading ?

                                        <ActivityIndicator color={'#fff'} />
                                        :
                                        conversation?.groupAdminId === auth?.user?.id ? 'Delete group' : 'Leave group'
                                }
                            </Text>
                        </TouchableOpacity>
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

export default GroupChatInfoModel;