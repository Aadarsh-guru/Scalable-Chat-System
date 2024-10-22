import { useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import axios from 'axios';

const Register = ({ navigation }: { navigation: any }) => {

    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !username || !email || !password) {
            return Alert.alert('Please fill all the fields');
        }
        //    removing extrs spaces from username
        if (username !== username.replaceAll(' ', '') || username.toLowerCase() !== username) {
            return Alert.alert('Username cannot contain spaces and Capital latters.');
        }
        if (password?.length < 6) {
            return Alert.alert('Password must be at least 6 characters long');
        }
        try {
            setLoading(true);
            const response = await axios.post(`/api/v1/auth/register`, {
                fullName, username, email, password
            });
            const { success } = response.data;
            if (success) {
                return navigation.navigate("Login")
            }
        } catch (error: any) {
            return Alert.alert(error.response.data.message || error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.whiteSheet} />
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Sign Up</Text>
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
                    placeholder="Enter email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter password"
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry={!showPassword}
                        textContentType="password"
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                    />
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#F43F5E" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity disabled={loading} activeOpacity={0.8} style={[styles.button, loading && { backgroundColor: '#c72641' }]} onPress={() => handleRegister()}>
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>
                        {
                            loading ?
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                    <ActivityIndicator color={'#fff'} />
                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}> Signing up..</Text>
                                </View>
                                :
                                'Sign Up'
                        }
                    </Text>
                </TouchableOpacity>
                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={{ color: '#F43F5E', fontWeight: '600', fontSize: 14 }}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default Register

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: "#F43F5E",
        alignSelf: "center",
        paddingBottom: 24,
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    whiteSheet: {
        width: '100%',
        height: '100%',
        position: "absolute",
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 60,
    },
    form: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 30,
    },
    button: {
        backgroundColor: '#F43F5E',
        height: 58,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    passwordContainer: {
        position: "relative",
        marginBottom: 20,
    },
    passwordInput: {
        backgroundColor: "#F6F7FB",
        height: 58,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    toggleButton: {
        position: "absolute",
        top: 18,
        right: 12,
    },
});