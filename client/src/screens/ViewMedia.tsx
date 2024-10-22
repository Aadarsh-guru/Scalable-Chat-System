import { View, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Message } from '../types';


interface ChatScreenProps {
    route: {
        params: {
            message: Message
        };
    };
};

const ViewMedia: React.FC<ChatScreenProps> = ({ route }) => {

    const { message } = route.params;
    const { setOptions } = useNavigation();
    const [loading, setLoading] = useState(false);

    const handleDownloadMedia = async () => {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission?.status !== 'granted') {
            return Alert.alert('Permission denied', 'You need to grant permission to download the media.');
        };
        setLoading(true);
        const fileUri = message.body;
        const fileName = fileUri.split('/').pop();
        const localFileUri = `${FileSystem.documentDirectory}${fileName}`;
        try {
            const { status } = await FileSystem.downloadAsync(fileUri, localFileUri);
            if (status !== 200) {
                return Alert.alert('Error downloading media', 'An error occurred while downloading the media.');
            }
            await MediaLibrary.createAssetAsync(localFileUri);
            Alert.alert('Media downloaded', 'The media has been downloaded successfully.');
        } catch (error: any) {
            console.error('Error downloading media:', error);
            return Alert.alert('Error downloading media', error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setOptions({
            headerTitle: message.messageType === 'IMAGE' ? 'An Image' : message.messageType === 'VIDEO' ? 'A Video' : 'View Media',
            headerRight: () => <TouchableOpacity
                disabled={loading}
                onPress={() => handleDownloadMedia()}
                style={{ marginRight: 15 }}
            >
                {
                    loading ?
                        <ActivityIndicator
                            size={'small'}
                            color={'grey'}
                        />
                        :
                        <Ionicons
                            name="download-outline"
                            size={24} color="grey"
                        />
                }
            </TouchableOpacity>,
        });
    }, [message.id, loading]);

    return (
        <View style={styles.container} >
            {message?.messageType === 'IMAGE' && (
                <Image
                    style={styles.image}
                    source={{
                        uri: message?.body
                    }}
                    resizeMethod='auto'
                    resizeMode='contain'
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        minHeight: 400
    },
});

export default ViewMedia;

