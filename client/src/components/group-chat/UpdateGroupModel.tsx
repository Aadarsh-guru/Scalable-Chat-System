import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert, Image, TextInput, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../contexts/DataProvider';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Conversation } from '../../types';
import handleUploadFile from '../../services/UploadFile';
import { GroupImage } from '../../constants';


interface UpdateGroupModelProps {
    conversation: Conversation | undefined;
    isOpen: boolean;
    onClose: () => void;
};

const UpdateGroupModel: React.FC<UpdateGroupModelProps> = ({
    conversation, isOpen, onClose
}) => {

    const [loading, setLoading] = useState(false);
    const { setConversations } = useData();
    const [groupName, setGroupName] = useState<string | undefined>(conversation?.groupName || '');
    const [groupAbout, setGroupAbout] = useState<string | undefined>(conversation?.groupAbout || '');
    const [groupProfile, setGroupProfile] = useState<string | undefined>(conversation?.groupProfile || '');
    const [fileType, setFileType] = useState<string | null>(null);

    useEffect(() => {
        setGroupName(conversation?.groupName);
        setGroupAbout(conversation?.groupAbout);
        setGroupProfile(conversation?.groupProfile);
    }, [isOpen, onClose]);

    const handleUpdateClick = async () => {
        if (!groupName) {
            return Alert.alert('Please enter a group name');
        };
        try {
            setLoading(true);
            const payload = {
                groupName,
                groupAbout
            }
            if (groupProfile && groupProfile !== conversation?.groupProfile) {
                const res = await handleUploadFile(groupProfile, 'profile-images', fileType!);
                if (res?.success) {
                    // @ts-expect-error
                    payload.groupProfile = res.url;
                }
            }
            const response = await axios.put(`/api/v1/conversations/group/update/${conversation?.id}`, payload);
            const { success, newConversation } = response.data;
            if (success) {
                setConversations(prevConversations => {
                    const updatedConversations = prevConversations.map(con => {
                        if (con.id === newConversation?.id) {
                            return {
                                ...con,
                                groupAbout: newConversation?.groupAbout,
                                groupName: newConversation?.groupName,
                                groupProfile: newConversation?.groupProfile
                            };
                        }
                        return con;
                    });
                    return updatedConversations;
                });
                onClose();
            };
        } catch (error: any) {
            return Alert.alert(error.response.data.message || error.message || 'Something went wrong.')
        } finally {
            setLoading(false);
        }
    };


    const handlePickProfile = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });
        if (!result.canceled) {
            setGroupProfile(result.assets[0].uri);
            setFileType(result.assets[0].type!);
        }
    }

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
                    width: '95%',
                }}>
                    <Text
                        style={{
                            marginBottom: 15,
                            textAlign: 'center',
                            fontWeight: '500',
                            color: 'grey'
                        }}
                    >
                        Update Group Info
                    </Text>
                    <View
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 20
                        }}
                    >
                        <Image
                            style={{
                                height: 100,
                                width: 100,
                                borderRadius: 100,
                                borderWidth: 2,
                                borderColor: 'lightgrey'
                            }}
                            source={
                                groupProfile ? { uri: groupProfile }
                                    :
                                    { uri: GroupImage }
                            }
                        />
                        <TouchableOpacity
                            onPress={() => handlePickProfile()}
                            style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 5
                            }}
                        >
                            <Ionicons
                                name="camera-outline"
                                size={18}
                                color="green"
                            />
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: 'green'
                                }}
                            >
                                {groupProfile ? 'Change Photo' : 'Add Photo'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter group name"
                        autoCapitalize="none"
                        textContentType="name"
                        value={groupName}
                        onChangeText={(text) => setGroupName(text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter something about this group"
                        value={groupAbout}
                        maxLength={100}
                        onChangeText={(text) => setGroupAbout(text)}
                    />
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
                            onPress={() => handleUpdateClick()}>
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
                                        'Update Info'
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

export default UpdateGroupModel;


const styles = StyleSheet.create({
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        width: '100%',
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
});