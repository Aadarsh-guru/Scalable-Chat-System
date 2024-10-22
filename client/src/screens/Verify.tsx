import { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, } from "react-native";
import axios from "axios";

interface VerifyScreenProps {
    navigation: any;
    route: {
        params: {
            email: string;
        };
    };
};

const Verify = ({ navigation, route }: VerifyScreenProps) => {

    const { email } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyClick = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`/api/v1/auth/verify-otp`, {
                email, otp, userVerify: true
            })
            const { success } = response.data;
            if (success) {
                navigation.goBack();
            }
        } catch (error: any) {
            return Alert.alert(error.response.data.message || error.message || "Something went wrong.")
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        axios.post(`/api/v1/auth/send-otp`, { email, subject: 'Email verification' }).then(({ data }) => {
            if (!data?.success) {
                return Alert.alert(data?.message);
            }
        }).catch((error) => {
            return Alert.alert(error?.response?.data?.message || error?.message || "Something went wrong.");
        });
    }, [email]);

    return (
        <View style={styles.container}>
            <View style={styles.whiteSheet} />
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Verify Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter OTP here."
                    value={otp}
                    onChangeText={(text) => setOtp(text)}
                />
                <TouchableOpacity
                    disabled={loading}
                    activeOpacity={0.8}
                    style={[styles.button, loading && { backgroundColor: '#c72641' }]}
                    onPress={() => handleVerifyClick()}
                >
                    <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
                        {
                            loading ?
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                    <ActivityIndicator color={'#fff'} />
                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Verifying..</Text>
                                </View>
                                :
                                'Verify'
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

export default Verify;

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
        marginBottom: 20,
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
