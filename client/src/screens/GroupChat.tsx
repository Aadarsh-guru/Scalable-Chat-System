import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import InputComponent from '../components/chat/InputComponent';
import { useData } from '../contexts/DataProvider';
import { useSocket } from '../contexts/SocketProvider';
import { Conversation } from '../types';
import GroupChatHeader from '../components/group-chat/GroupChatHeader';
import GroupChatInfoModel from '../components/group-chat/GroupChatInfoModel';
import GroupMessageComponet from '../components/group-chat/GroupMessageComponent';
import { useAuth } from '../contexts/AuthProvider';

interface GroupChatScreenProps {
    route: {
        params: {
            conversationId: string;
        };
    };
};

const GroupChat: React.FC<GroupChatScreenProps> = ({ route }) => {

    const { auth } = useAuth();
    const { socket } = useSocket();
    const { conversations, setConversations } = useData();
    const { conversationId } = route.params;
    const { setOptions, goBack } = useNavigation();

    const [openInfoModel, setOpenInfoModel] = useState<boolean>(false);

    const conversation = conversations?.find((conversation) => conversation.id === conversationId);

    useEffect(() => {
        setOptions({
            headerTitle: () => <GroupChatHeader conversation={conversation} />,
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
        const handleRemoveUserConversation = ({ conversation, userId }: { conversation: Conversation, userId: string }) => {
            if (userId === auth?.user?.id) {
                setConversations(prev => prev.filter(con => con.id !== conversation.id));
                goBack();
            }
        };
        socket?.on('event:remove-conversation', (removedConversation: Conversation) => {
            if (removedConversation.id === conversationId) {
                setConversations(prev => prev?.filter((con) => con.id !== conversationId));
                goBack();
            }
        });
        socket?.on('event:remove-user', handleRemoveUserConversation);
        return () => {
            socket?.off('event:remove-conversation');
            socket?.off('event:remove-user', handleRemoveUserConversation);
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
                                        <GroupMessageComponet key={index} message={message} />
                                    ))
                                }
                            </ScrollView>
                        )
                }
            </View>
            <InputComponent conversationId={conversationId} />
            <GroupChatInfoModel
                conversation={conversation}
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

export default GroupChat;

