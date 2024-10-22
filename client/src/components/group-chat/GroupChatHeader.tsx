import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Conversation } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../../contexts/SocketProvider';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthProvider';
import { GroupImage } from '../../constants';

interface GroupChatHeaderProps {
    conversation: Conversation | undefined;
};

const GroupChatHeader: React.FC<GroupChatHeaderProps> = ({
    conversation
}) => {

    const { auth } = useAuth();
    const { socket } = useSocket();
    const { navigate } = useNavigation();
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        socket?.on(`event:typing-${conversation?.id}`, ({ userId }: { userId: string }) => {
            if (conversation?.users?.some(user => (user.id === userId && user.id !== auth?.user?.id))) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 2000);
            }
        });
        return () => {
            socket?.off(`event:typing-${conversation?.id}`);
        }
    }, [navigate, socket, conversation]);

    return (
        <TouchableOpacity
            style={styles.container}
            // @ts-expect-error
            onPress={() => navigate('Group-Info', { conversationId: conversation?.id })}
        >
            <Image
                style={styles.image}
                source={
                    conversation?.groupProfile ? {
                        uri: conversation?.groupProfile
                    }
                        :
                        { uri: GroupImage }
                }
            />
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1} >{conversation?.groupName}</Text>
                <Text style={styles.activeStatus} numberOfLines={1} >
                    {
                        isTyping ? (
                            'someone is typing...'
                        )
                            :
                            `${conversation?.users?.length} person in a group`
                    }
                </Text>
            </View >
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    image: {
        height: 40,
        width: 40,
        borderRadius: 99,
    },
    infoContainer: {
        marginLeft: 10,
        display: 'flex',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    activeStatus: {
        fontSize: 14,
        fontWeight: '300',
    }
});

export default GroupChatHeader;