import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import LogoutModel from '../components/profile/LogoutModel';
import { useState } from 'react';
import DeleteModel from '../components/profile/DeleteModel';
import ChangePasswordModel from '../components/profile/ChangePasswordModel';
import { AccountImage } from '../constants';

const Profile: React.FC = () => {

    const { auth } = useAuth();
    const { navigate } = useNavigation();
    const [openDeleteAccountModel, setOpenDeleteAccountModel] = useState(false);
    const [openChangePasswordModel, setOpenChangePasswordModel] = useState(false);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#fff'
            }}
        >
            <View
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 20
                }}
            >
                {
                    auth?.user?.profile ?
                        <Image
                            source={{
                                uri: auth.user.profile
                            }}
                            style={{
                                height: 150,
                                width: 150,
                                borderRadius: 100,
                                borderWidth: 2,
                                borderColor: 'lightgrey'
                            }}
                        />
                        :
                        <Image
                            source={{ uri: AccountImage }}
                            style={{
                                height: 150,
                                width: 150,
                                borderRadius: 100,
                                borderWidth: 2,
                                borderColor: 'lightgrey'
                            }}
                        />
                }
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '600',
                        color: 'grey',
                        marginTop: 16
                    }}
                >
                    {auth?.user?.fullName}
                </Text>
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: 'grey',
                        marginTop: 4,
                        overflow: 'hidden'
                    }}
                >
                    {auth?.user?.email}
                </Text>
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '600',
                        color: 'grey',
                        marginTop: 16
                    }}
                >
                    {auth?.user?.friends.length}
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: 'grey',
                        overflow: 'hidden'
                    }}
                >
                    Friends
                </Text>
                <View>
                    {auth?.user?.about ?
                        (
                            <Text
                                style={{
                                    marginTop: 20,
                                    fontSize: 14,
                                    fontWeight: '500',
                                    color: 'grey',
                                    overflow: 'hidden'
                                }}
                            >
                                {auth?.user?.about}
                            </Text>
                        ) :
                        (
                            <Text
                                style={{
                                    marginTop: 20,
                                    fontSize: 14,
                                    fontWeight: '500',
                                    color: 'grey',
                                    overflow: 'hidden'
                                }}
                            >
                                You Don't have information in your bio.
                            </Text>
                        )
                    }
                </View>
                <TouchableOpacity
                    // @ts-ignore
                    onPress={() => navigate('Edit-Profile')}
                    style={{
                        marginTop: 30,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 6,
                        paddingHorizontal: 20,
                        borderWidth: 1,
                        borderColor: 'green',
                        borderRadius: 10
                    }}
                >
                    <Ionicons
                        name="settings-outline"
                        size={24}
                        color="green"
                    />
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: 'green'
                        }}
                    >
                        Edit Profile
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setOpenChangePasswordModel(true)}
                    style={{
                        marginTop: 15,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 6,
                        paddingHorizontal: 20,
                        borderWidth: 1,
                        borderColor: '#03cafc',
                        borderRadius: 10
                    }}
                >
                    <Ionicons
                        name="create-outline"
                        size={24}
                        color="#03cafc"
                    />
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#03cafc'
                        }}
                    >
                        Change Password
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setOpenDeleteAccountModel(true)}
                    style={{
                        marginTop: 15,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 6,
                        paddingHorizontal: 20,
                        borderWidth: 1,
                        borderColor: '#F43F5E',
                        borderRadius: 10
                    }}
                >
                    <Ionicons
                        name="trash-outline"
                        size={24}
                        color="#F43F5E"
                    />
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#F43F5E'
                        }}
                    >
                        Delete Account
                    </Text>
                </TouchableOpacity>
            </View>
            <LogoutModel />
            <DeleteModel
                isOpen={openDeleteAccountModel}
                onClose={() => setOpenDeleteAccountModel(false)}
            />
            <ChangePasswordModel
                isOpen={openChangePasswordModel}
                onClose={() => setOpenChangePasswordModel(false)}
            />
        </View>
    )
}

export default Profile;