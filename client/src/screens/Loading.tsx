import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {


    return (
        <View style={styles.container}>
            <ActivityIndicator size={'large'} color={'#F43F5E'} />
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LoadingScreen;