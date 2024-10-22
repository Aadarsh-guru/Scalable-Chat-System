import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';
import { useState } from 'react';
import axios from 'axios';

interface ChangePasswordModelProps {
    isOpen: boolean,
    onClose: () => void,
}

const ChangePasswordModel: React.FC<ChangePasswordModelProps> = ({
    isOpen,
    onClose
}) => {

    const { handleLogout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleDeleteAccount = async () => {
        try {
            if (!password || !newPassword || !confirmPassword) {
                return Alert.alert('Please enter all feilds.');
            };

            if (newPassword !== confirmPassword) {
                return Alert.alert('Confirm password is not matching.');
            }

            if (newPassword.length < 6) {
                return Alert.alert('New Password must be at least 6 characters.');
            };

            setLoading(true);

            const response = await axios.patch(`/api/v1/users/update-password`, {
                password,
                newPassword
            });

            const { message, success } = response.data;
            if (success) {
                await handleLogout();
                onClose();
                return Alert.alert(`${message} login with your new credentials.`);
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
                            placeholder="Enter current password"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="password"
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                        />
                        <TextInput
                            style={{
                                backgroundColor: "#fff",
                                height: 44,
                                fontSize: 16,
                                borderRadius: 10,
                                padding: 12,
                                width: '100%'
                            }}
                            placeholder="Enter new password"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="password"
                            value={newPassword}
                            onChangeText={(text) => setNewPassword(text)}
                        />
                        <TextInput
                            style={{
                                backgroundColor: "#fff",
                                height: 44,
                                fontSize: 16,
                                borderRadius: 10,
                                padding: 12,
                                width: '100%'
                            }}
                            placeholder="Confiem new password"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="password"
                            value={confirmPassword}
                            onChangeText={(text) => setConfirmPassword(text)}
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
                                        'Change Password'
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

export default ChangePasswordModel;