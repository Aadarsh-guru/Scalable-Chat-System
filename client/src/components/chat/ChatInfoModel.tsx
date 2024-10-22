import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useData } from '../../contexts/DataProvider';
import axios from 'axios';

interface ChatInfoModelProps {
    conversationId: string;
    isOpen: boolean;
    onClose: () => void;
    goBack: () => void;
};

const ChatInfoModel: React.FC<ChatInfoModelProps> = ({
    conversationId, isOpen, onClose, goBack
}) => {

    const [loading, setLoading] = useState(false);
    const { setConversations } = useData();

    const handleLogoutClick = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(`/api/v1/conversations/delete/${conversationId}`);
            const { success } = response.data;
            if (success) {
                setConversations(prev => prev.filter(conversation => conversation.id !== conversationId));
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
                        Are You Sure you want to delete this conversation? This will also delete all the messages from both persons side.
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
                            onPress={() => handleLogoutClick()}>
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
                                        'Delete conversation'
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

export default ChatInfoModel;