import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import moment from 'moment';
import { Message } from '../../types';
import { useAuth } from '../../contexts/AuthProvider';
import { useNavigation } from '@react-navigation/native';

interface GroupMessageComponentProps {
    message: Message;
};

const GroupMessageComponet: React.FC<GroupMessageComponentProps> = ({
    message
}) => {

    const { auth } = useAuth();
    const { navigate } = useNavigation();
    const isMessageOwner = auth?.user?.id === message.senderId;
    const formattedDate = moment(message.createdAt).format('MMM DD, YYYY hh:mm a');
    const user = auth?.user?.friends.find(friend => friend.friendId === message.senderId);

    return (
        <View style={[styles.container, isMessageOwner && { alignSelf: 'flex-end', paddingLeft: 0, paddingRight: 8 }]} >
            {!isMessageOwner ? <Text style={styles.sentBy} >{user?.username ?? 'Anonymous'}</Text> : <Text style={[styles.sentBy, { marginLeft: 'auto', marginRight: 5 }]}>{auth?.user?.username}</Text>}
            {message?.messageType === 'TEXT' && (
                <Text style={[styles.textMessage, isMessageOwner && { backgroundColor: '#3B82F6', color: '#fff' }]} >{message?.body}</Text>
            )}
            {message?.messageType === 'IMAGE' && (
                <TouchableOpacity
                    // @ts-expect-error
                    onPress={() => navigate('View-Media', { message })} >
                    <Image
                        source={{
                            uri: message?.body
                        }}
                        alt='An Image sent!'
                        style={styles.imageMessage}
                    />
                </TouchableOpacity>
            )}
            <Text style={[styles.dateTime, isMessageOwner && { marginLeft: 'auto', marginRight: 5 }]}>{formattedDate}</Text>
        </View>
    );
};

export default GroupMessageComponet;

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        marginLeft: 8,
        maxWidth: '70%',
        alignSelf: 'flex-start',
    },
    textMessage: {
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    dateTime: {
        fontSize: 10,
        color: 'grey',
        fontWeight: '400',
        marginTop: 3,
        marginLeft: 5
    },
    imageMessage: {
        width: 200,
        height: 200,
        objectFit: 'cover',
        borderRadius: 10,
        margin: 5,
        alignSelf: 'center'
    },
    sentBy: {
        fontSize: 12,
        fontWeight: '500',
        color: 'grey',
        marginLeft: 5,
        marginBottom: 3,
    },
});