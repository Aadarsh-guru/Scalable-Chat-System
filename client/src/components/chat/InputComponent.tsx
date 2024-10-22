import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useSocket } from '../../contexts/SocketProvider';
import { useAuth } from '../../contexts/AuthProvider';
import handleUploadFile from '../../services/UploadFile';

interface InputComponentProps {
    conversationId: string;
}

const InputComponent: React.FC<InputComponentProps> = ({
    conversationId,
}) => {

    const { auth } = useAuth();
    const { socket } = useSocket();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSend = () => {
        socket?.emit(`event:send-message`, {
            conversationId: conversationId,
            messageType: "TEXT",
            body: text,
            senderId: auth?.user?.id
        });
        setText('');
    };

    const handleTyping = () => {
        socket?.emit('event:typing', {
            conversationId: conversationId,
            userId: auth?.user?.id,
        });
    };

    const handleTextInputChange = (inputText: string) => {
        setText(inputText);
        handleTyping();
    };

    const handleSendImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });
            if (result.canceled) {
                return;
            }
            setLoading(true);
            const response = await handleUploadFile(result.assets[0].uri, 'media-files', result.assets[0].type!);
            if (response?.success) {
                socket?.emit(`event:send-message`, {
                    conversationId: conversationId,
                    messageType: "IMAGE",
                    body: response.url,
                    senderId: auth?.user?.id
                });
            };
        } catch (error: any) {
            return Alert.alert(error.response.data.message || error.message || 'Something went wrong.')
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.inputBox} >
            <TouchableOpacity disabled={loading} onPress={handleSendImage} >
                {
                    loading ? (
                        <ActivityIndicator size={'small'} color={'grey'} />
                    )
                        : (
                            <Ionicons name="images-outline" size={24} color="black" />
                        )
                }
            </TouchableOpacity>
            <TextInput
                multiline
                autoFocus
                returnKeyType='send'
                value={text}
                onChangeText={handleTextInputChange}
                style={styles.inputFeild}
                placeholder='Type a message here..'
            />
            <TouchableOpacity
                onPress={handleSend}
                disabled={!text || loading}
                activeOpacity={0.7}
                style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    backgroundColor: (text && !loading) ? '#F43F5E' : '#c72641',
                    borderRadius: 99,
                }}
            >
                <Ionicons
                    name="send-outline"
                    size={24}
                    color="#fff"
                />
            </TouchableOpacity>
        </View>
    );
};

export default InputComponent;

const styles = StyleSheet.create({
    inputBox: {
        backgroundColor: '#fff',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    inputFeild: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        height: 40,
        borderRadius: 25,
        paddingHorizontal: 15,
        fontSize: 18,
    },
});