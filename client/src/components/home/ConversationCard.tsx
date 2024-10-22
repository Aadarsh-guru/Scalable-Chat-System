import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../../contexts/DataProvider';
import { AccountImage, GroupImage } from '../../constants';

interface GroupConversationCardProps {
    conversationId: string;
};

const GroupConversationCard: React.FC<GroupConversationCardProps> = ({
    conversationId
}) => {

    const { auth } = useAuth();
    const { conversations } = useData();
    const { navigate } = useNavigation();
    const conversation = conversations?.find((conversation) => conversation.id === conversationId);
    const lastMessage = conversation?.messages[conversation?.messages?.length - 1] || null;
    const otherUser = conversation?.users?.find((user) => user.id !== auth?.user?.id);
    const formattedDate = moment(lastMessage?.createdAt).format('hh:mm a');
    const isLastMessageOwner = lastMessage?.senderId === auth?.user?.id;

    const truncateText = (text: string, maxLength: number) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };


    return (
        <TouchableOpacity
            // @ts-expect-error
            onPress={() => conversation?.isGroup ? navigate('Group-Chat', { conversationId }) : navigate('Chat', { otherUser, conversationId })}
            style={styles.container}
        >
            {conversation?.isGroup ? (
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
            )
                :
                (
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
                )}
            <View style={styles.infoContainer}>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'space-between' }} >
                    <Text style={styles.name} numberOfLines={1} >{conversation?.isGroup ? conversation.groupName : otherUser?.fullName}</Text>
                    <Text style={[styles.lastMessageDate]}>{formattedDate}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'space-between' }} >
                    <Text style={styles.lastMessage} numberOfLines={1} >
                        {lastMessage ? (
                            <>
                                {
                                    lastMessage.messageType === 'TEXT' ? (
                                        `${isLastMessageOwner ? 'You:' : ''} ${truncateText(lastMessage?.body, 25)}`
                                    )
                                        :
                                        (
                                            `${isLastMessageOwner ? 'You:' : ''} Sent an ${lastMessage.messageType.toLowerCase()}`
                                        )
                                }
                            </>
                        )
                            :
                            conversation?.isGroup ? (
                                conversation?.groupAdminId === auth?.user?.id ? 'Created a group' : 'Joined a group.'
                            )
                                :
                                'Started new conversation.'}
                    </Text>
                </View>
            </View >
        </TouchableOpacity>
    );
};

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
        flex: 1,
        display: 'flex',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 3,
    },
    lastMessage: {
        fontSize: 20,
        fontWeight: '300',
    },
    lastMessageDate: {
        fontSize: 13,
        color: 'grey',
        fontWeight: '400',
        marginTop: 3,
        marginLeft: 5
    },
});

export default GroupConversationCard;