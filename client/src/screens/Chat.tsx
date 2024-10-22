import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import ChatHeader from '../components/chat/ChatHeader';
import InputComponent from '../components/chat/InputComponent';
import MessageComponent from '../components/chat/MessageComponent';
import { useData } from '../contexts/DataProvider';
import ChatInfoModel from '../components/chat/ChatInfoModel';
import { useSocket } from '../contexts/SocketProvider';
import { Conversation } from '../types';

interface ChatScreenProps {
    route: {
        params: {
            conversationId: string;
            otherUser: {
                id: string;
                fullName: string;
                username: string;
                about: string;
                profile: string;
                email: string;
            } | undefined;
        };
    };
};

const Chat: React.FC<ChatScreenProps> = ({ route }) => {

    const { socket } = useSocket();
    const { conversations, setConversations } = useData();
    const { conversationId, otherUser } = route.params;
    const { setOptions, goBack } = useNavigation();

    const [openInfoModel, setOpenInfoModel] = useState<boolean>(false);

    const conversation = conversations?.find((conversation) => conversation.id === conversationId);

    useEffect(() => {
        setOptions({
            headerTitle: () => <ChatHeader conversationId={conversationId} otherUser={otherUser} />,
            headerRight: () => <TouchableOpacity
                onPress={() => setOpenInfoModel(true)}
            >
                <MaterialIcons
                    name="more-vert"
                    size={24} color="black"
                    style={{ marginRight: 15 }}
                />
            </TouchableOpacity>,
        });
    }, [conversationId]);

    useEffect(() => {
        socket?.on('event:remove-conversation', (removedConversation: Conversation) => {
            if (removedConversation.id === conversationId) {
                setConversations(prev => prev?.filter((con) => con.id !== conversationId));
                goBack();
            }
        });
        return () => {
            socket?.off('event:remove-conversation');
        }
    }, [socket]);

    return (
        <View style={styles.container} >
            <View style={styles.messageBox} >
                {
                    conversation?.messages?.length === 0 ? (
                        <View style={styles.emptyBox} >
                            <Text style={styles.emptyText}>No messages yet</Text >
                        </View>
                    )
                        :
                        (
                            <ScrollView
                                ref={(scrollView) => {
                                    scrollView?.scrollToEnd({ animated: true });
                                }}
                            >
                                {
                                    conversation?.messages?.map((message, index) => (
                                        <MessageComponent key={index} message={message} />
                                    ))
                                }
                            </ScrollView>
                        )
                }
            </View>
            <InputComponent conversationId={conversationId} />
            <ChatInfoModel
                conversationId={conversationId}
                goBack={goBack}
                isOpen={openInfoModel}
                onClose={() => setOpenInfoModel(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    messageBox: {
        width: '100%',
        flex: 1,
        paddingTop: 5
    },
    emptyBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '300'
    }
});

export default Chat;

