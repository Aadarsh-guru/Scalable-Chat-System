import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DeleteModelProps {
    isOpen: boolean,
    onClose: () => void,
}

const DeleteModel: React.FC<DeleteModelProps> = ({
    isOpen,
    onClose
}) => {

    const { setAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');

    const handleDeleteAccount = async () => {
        try {
            if (!password) {
                return Alert.alert('Please enter your password');
            };

            setLoading(true);
            const response = await axios.post(`/api/v1/users/delete-account`, {
                password
            });

            const { message, success } = response.data;
            if (success) {
                onClose();
                setAuth({
                    accessToken: "",
                    refreshToken: "",
                    user: null
                });
                await AsyncStorage.removeItem('auth');
            } else {
                return Alert.alert(message);
            }
        } catch (error: any) {
            return Alert.alert(error.response.data.message || error.message || 'Something went wrong.')
        } finally {
            setLoading(false);
        }
    };


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
                    width: 250,
                }}>
                    <Text
                        style={{
                            marginBottom: 15,
                            textAlign: 'center',
                            fontWeight: '500',
                            color: 'grey'
                        }}
                    >
                        Are You Sure you wanna Delete your account permanantly? this action can not be undone.
                    </Text>
                    <View style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: 15,
                    }}>
                        <TextInput
                            style={{
                                backgroundColor: "#fff",
                                height: 44,
                                fontSize: 16,
                                borderRadius: 10,
                                padding: 12,
                                width: '100%'
                            }}
                            placeholder="Enter password"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="password"
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                        />
                        <TouchableOpacity
                            disabled={loading}
                            style={{
                                width: '100%',
                                paddingVertical: 10,
                                paddingHorizontal: 10,
                                backgroundColor: loading ? '#c72641' : '#F43F5E',
                                borderRadius: 10,
                            }}
                            onPress={() => handleDeleteAccount()}>
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
                                        'Delete Account'
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

export default DeleteModel;