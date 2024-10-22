import { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, } from "react-native";
import axios from "axios";

interface ForgetPasswordProps {
    navigation: any;
};

const ForgetPassword = ({ navigation }: ForgetPasswordProps) => {

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);

    const handleForgetPasswordClick = async () => {
        if (!otp) {
            return Alert.alert("Please enter OTP.");
        }
        if (!password) {
            return Alert.alert("Please enter password.");
        }
        if (password?.length < 6) {
            return Alert.alert("Password must be at least 6 characters.");
        }
        try {
            setLoading(true);
            const response = await axios.post(`/api/v1/auth/verify-otp`, { email, otp })
            const { success } = response.data;
            if (success) {
                const changePasswordResponse = await axios.patch(`/api/v1/auth/forget-password`, { email, password });
                if (changePasswordResponse.data.success) {
                    Alert.alert(changePasswordResponse.data.message);
                    return navigation.goBack();
                }
            }
        } catch (error: any) {
            return Alert.alert(error.response.data.message || error.message || "Something went wrong.")
        } finally {
            setLoading(false);
        }
    };

    const hanldeSendEmail = () => {
        if (!email) {
            return Alert.alert('Please enter email.');
        }
        setLoading(true);
        axios.post(`/api/v1/auth/send-otp`, { email, subject: 'Forget Password' }).then(({ data }) => {
            if (!data?.success) {
                return Alert.alert(data?.message);
            }
            setIsOtpSent(true);
        }).catch((error: any) => {
            return Alert.alert(error?.response?.data?.message || error?.message || "Something went wrong.");
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        setOtp('');
        setEmail('');
        setIsOtpSent(false);
        setLoading(false);
        setPassword('');
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.whiteSheet} />
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Forget Password</Text>
                {
                    isOtpSent ? (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter OTP."
                                value={otp}
                                onChangeText={(text) => setOtp(text)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password."
                                value={password}
                                onChangeText={(text) => setPassword(text)}
                            />
                            <TouchableOpacity
                                disabled={loading}
                                activeOpacity={0.8}
                                style={[styles.button, loading && { backgroundColor: '#c72641' }]}
                                onPress={() => handleForgetPasswordClick()}
                            >
                                <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
                                    {
                                        loading ?
                                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                                <ActivityIndicator color={'#fff'} />
                                                <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Submitting..</Text>
                                            </View>
                                            :
                                            'Change Password'
                                    }
                                </Text>
                            </TouchableOpacity>
                        </>
                    )
                        :
                        (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter account email here."
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    textContentType="emailAddress"
                                    value={email}
                                    onChangeText={(text) => setEmail(text)}
                                />
                                <TouchableOpacity
                                    disabled={loading}
                                    activeOpacity={0.8}
                                    style={[styles.button, loading && { backgroundColor: '#c72641' }]}
                                    onPress={() => hanldeSendEmail()}
                                >
                                    <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
                                        {
                                            loading ?
                                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                                    <ActivityIndicator color={'#fff'} />
                                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Sending..</Text>
                                                </View>
                                                :
                                                'Send OTP'
                                        }
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )
                }
                <View
                    style={{
                        marginTop: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        alignSelf: "center",
                    }}
                >
                    <Text style={{ color: "gray", fontWeight: "600", fontSize: 14 }}>
                        Go back?{" "}
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                    >
                        <Text
                            style={{ color: "#F43F5E", fontWeight: "600", fontSize: 14 }}
                        >
                            {" "}
                            Sign in
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default ForgetPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#F43F5E",
        alignSelf: "center",
        paddingBottom: 24,
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10
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
