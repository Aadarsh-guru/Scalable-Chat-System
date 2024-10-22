import { useState } from "react";
import { FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, } from "react-native";
import { useAuth } from "../contexts/AuthProvider";
import axios from "axios";

const Login = ({ navigation }: { navigation: any }) => {

    const { handleLogin } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLoginClick = async () => {
        if (!email || !password) {
            return Alert.alert('Please fill all the fields');
        }
        if (password?.length < 6) {
            return Alert.alert('Password must be at least 6 characters long');
        }
        try {
            setLoading(true);
            const response = await axios.post(`/api/v1/auth/login`, {
                username: email, email, password
            })
            const { success, accessToken, refreshToken, user } = response.data;
            if (success) {
                if (!user?.isVerified) {
                    return navigation.navigate("Verify", { email });
                } else {
                    handleLogin({ accessToken, refreshToken, user });
                    return;
                }
            }
        } catch (error: any) {
            return Alert.alert(error.response.data.message || error.message || "Something went wrong.")
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.whiteSheet} />
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Log In</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter email or username"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                <TouchableOpacity onPress={() => navigation.navigate('Forget-Password')}>
                    <Text style={{ color: "#F43F5E", fontWeight: "600", fontSize: 12, textAlign: 'right', marginBottom: 5 }} >
                        Forget Password
                    </Text>
                </TouchableOpacity>
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
                <TouchableOpacity
                    disabled={loading}
                    activeOpacity={0.8}
                    style={[styles.button, loading && { backgroundColor: '#c72641' }]}
                    onPress={() => handleLoginClick()}
                >
                    <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
                        {
                            loading ?
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                    <ActivityIndicator color={'#fff'} />
                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Logging in..</Text>
                                </View>
                                :
                                'Login'
                        }
                    </Text>
                </TouchableOpacity>
                <View
                    style={{
                        marginTop: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        alignSelf: "center",
                    }}
                >
                    <Text style={{ color: "gray", fontWeight: "600", fontSize: 14 }}>
                        Don't have an account?{" "}
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Register")}
                    >
                        <Text
                            style={{ color: "#F43F5E", fontWeight: "600", fontSize: 14 }}
                        >
                            {" "}
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#F43F5E",
        alignSelf: "center",
        paddingBottom: 24,
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        marginBottom: 15,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    whiteSheet: {
        width: "100%",
        height: "100%",
        position: "absolute",
        bottom: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 60,
    },
    form: {
        flex: 1,
        justifyContent: "center",
        marginHorizontal: 30,
    },
    button: {
        backgroundColor: "#F43F5E",
        height: 58,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
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
