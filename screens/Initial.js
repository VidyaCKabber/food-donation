import React, { useRef, useState, useEffect } from 'react';
import {
    Alert,
    AppState,
    SafeAreaView,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntIcon from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

const Initial = ({ navigation }) => {
    const [userId, setUserId] = useState(false);
    const [usertype, setUserType] = useState(false);
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    async function getData() {
        try {
            let usertype = await AsyncStorage.getItem('UserType');
            if (usertype == '1' || usertype == '2') {
                navigation.navigate('manageradmin');
            }
            if (usertype == '3') {
                navigation.navigate('Home');
            }
            if (usertype == '4') {
                navigation.navigate('Home2');
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function updateTokens(tkn) {
        let loginid = await AsyncStorage.getItem('UserDocId');
        try {
            firestore()
                .collection('UpdateTokens')
                .where('UserId', '==', loginid)
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach(documentSnapshot => {
                        firestore()
                            .collection('UpdateTokens')
                            .doc(documentSnapshot.id)
                            .update({
                                fcmtoken: tkn
                            }).then(() => {
                                console.log("Token updated successfully");
                            }).catch(error => console.error(error));
                    })
                })
        }
        catch (e) {
            console.log(e);
        }
    }
    function _handleAppStateChange(nextAppState) {
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            console.log("App has come to the foreground!");
        }
        appState.current = nextAppState;
        setAppStateVisible(appState.current);
    };


    useEffect(() => {
        getData();
        messaging()
            .getToken()
            .then(token => {
                console.log(token)
                let tkn = token;
                updateTokens(tkn);
            });
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
        });
        AppState.addEventListener("change", _handleAppStateChange);
        return () => {
            AppState.removeEventListener("change", _handleAppStateChange);
            unsubscribe();
        };
    }, []);


    async function signOut() {
        await AsyncStorage.removeItem('UserDocId');
        await AsyncStorage.removeItem('UserType');
        navigation.navigate('Login');
    }

    return (
        <SafeAreaView>
            <Appbar.Header style={{ backgroundColor: '#1E90FF' }}>
                <Appbar.Content title="Home" />
                <Icon name="user" size={25} color="#ffffff" onPress={() => { navigation.navigate('profile', { 'docId': userId, 'userType': usertype }) }} />
                <Appbar.Action icon={() => <AntIcon name="logout" size={20} color="white" />} onPress={signOut} />
            </Appbar.Header>
        </SafeAreaView>
    )
};

export default Initial;