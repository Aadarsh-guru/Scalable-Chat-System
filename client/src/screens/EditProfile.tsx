import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthProvider';
import { useState } from 'react';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import handleUploadFile from '../services/UploadFile';
import { AccountImage } from '../constants';


const EditProfile: React.FC = () => {

    const { goBack } = useNavigation();
    const { setAuth, auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState(auth?.user?.fullName || '');
    const [username, setUsername] = useState(auth?.user?.username || '');
    const [about, setAbout] = useState(auth?.user?.about || '');
    const [profile, setProfile] = useState<string>(auth?.user?.profile || '');
    const [fileType, setFileType] = useState<string | null>(null);

    const handleSave = async () => {
        if (!fullName || !username) {
            return Alert.alert('Please fill all the fields')
        }
        if (about.length > 100) {
            return Alert.alert('About must be less than 100 characters');
        }
        setLoading(true);
        try {
            const payload = {
                fullName,
                about
            }
            if (profile && profile !== auth?.user?.profile) {
                const res = await handleUploadFile(profile, 'profile-images', fileType!);
                if (res?.success) {
                    // @ts-expect-error
                    payload.profile = res.url;
                }
            }
            if (username !== auth?.user?.username) {
                // @ts-expect-error
                payload.username = username;
            }
            const response = await axios.patch(`/api/v1/users/update-user`, payload);
            const { success, user } = response.data;
            if (success) {
                setAuth({ ...auth, user });
                await AsyncStorage.setItem('auth', JSON.stringify({ ...auth, user }))
                return goBack();
            }
        } catch (error: any) {
            return Alert.alert(error.response.data.message || error.message || "Something went wrong.");
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
            setProfile(result.assets[0].uri);
            setFileType(result.assets[0].type!);
        }
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <View
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}
            >
                <Image
                    style={{
                        height: 150,
                        width: 155,
                        borderRadius: 100,
                        borderWidth: 2,
                        borderColor: 'lightgrey'
                    }}
                    source={
                        profile ? { uri: profile }
                            :
                            { uri: AccountImage }
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
                        {profile ? 'Change Photo' : 'Add Photo'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text
                style={{
                    marginTop: 20,
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: "#F43F5E",
                }}
            >
                Personal Info
            </Text>

            <View style={styles.container} >
                <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    autoCapitalize="none"
                    textContentType="name"
                    value={fullName}
                    onChangeText={(text) => setFullName(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter username"
                    autoCapitalize="none"
                    textContentType="name"
                    value={username}
                    onChangeText={(text) => setUsername(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter something about yourself"
                    value={about}
                    maxLength={100}
                    onChangeText={(text) => setAbout(text)}
                />
                <TouchableOpacity disabled={loading} activeOpacity={0.8} style={[styles.button, loading && { backgroundColor: '#c72641' }]} onPress={() => handleSave()}>
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>
                        {
                            loading ?
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                    <ActivityIndicator color={'#fff'} />
                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Saving..</Text>
                                </View>
                                :
                                'Save info'
                        }
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 30,
        marginTop: 30
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        width: '100%',
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    button: {
        backgroundColor: '#F43F5E',
        height: 58,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
});

export default EditProfile;