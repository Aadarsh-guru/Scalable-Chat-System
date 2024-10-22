import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSocket } from '../../contexts/SocketProvider';
import { AccountImage } from '../../constants';

interface ChatHeaderProps {
    conversationId: string;
    otherUser: {
        id: string;
        fullName: string;
        username: string;
        about: string;
        profile: string;
        email: string;
    } | undefined
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    otherUser,
    conversationId
}) => {

    const { socket } = useSocket();
    const { navigate } = useNavigation();
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);

    useEffect(() => {
        socket?.emit('event:check-online', { userId: otherUser?.id });
        socket?.on('event:online-status', ({ isOnline }: { isOnline: boolean }) => {
            setIsActive(isOnline);
        });
        socket?.on(`event:${otherUser?.id}-connected`, ({ isOnline }: { isOnline: boolean }) => {
            setIsActive(isOnline);
        });
        socket?.on(`event:${otherUser?.id}-disconnected`, ({ isOnline }: { isOnline: boolean }) => {
            setIsActive(isOnline);
        });
        socket?.on(`event:typing-${conversationId}`, ({ userId }: { userId: string }) => {
            if (userId === otherUser?.id) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 2000);
            }
        });
        return () => {
            socket?.off(`event:online-status`);
            socket?.off(`event:${otherUser?.id}-connected`);
            socket?.off(`event:${otherUser?.id}-disconnected`);
            socket?.off(`event:typing-${conversationId}`);
        }
    }, [navigate, socket]);

    return (
        <TouchableOpacity
            // @ts-expect-error
            onPress={() => navigate('Search-Profile', { user: otherUser })}
            style={styles.container}
        >
            <Image
                style={styles.image}
                source={
                    otherUser?.profile ? {
                        uri: otherUser?.profile
                    }
                        :
                        { uri: AccountImage }
                }
            />
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1} >{otherUser?.fullName}</Text>
                {!isTyping ? (
                    <Text style={[styles.activeStatus, isActive && { color: 'green' }]} numberOfLines={1} >{isActive ? 'Online' : 'Offline'}</Text>
                ) : (
                    <Text style={[styles.activeStatus, isActive && { color: 'green' }]} numberOfLines={1} >Typing..</Text>
                )}
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

export default ChatHeader;