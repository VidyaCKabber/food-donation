import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Alert
} from 'react-native';
import { TextInput, Button, Title, Appbar, Text } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
    const [mobnum, setMobnum] = useState('');
    const [password, setPassword] = useState('');
    const [disabled, setDisabled] = useState(false);

    async function loginUser() {
        try {
            if (mobnum != "" && password != "") {
                firestore()
                    .collection('Accounts')
                    // Filter results
                    .where('ContactNumber', '==', Number(mobnum))
                    .get()
                    .then(querySnapshot => {
                        if (querySnapshot.size > 0) {
                            querySnapshot.forEach(documentSnapshot => {
                                // Password validation
                                var ValidPasswd = documentSnapshot.data().Password.toString();
                                if (ValidPasswd === password) {
                                    //Validate verified user
                                    const IsVerified = Boolean(documentSnapshot.data().IsVerified);
                                    if (IsVerified) {
                                        //validate active user
                                        const IsActive = Boolean(documentSnapshot.data().IsActive);
                                        if (IsActive) {
                                            AsyncStorage.setItem('UserDocId', documentSnapshot.id);
                                            // Get user role 
                                            let latitude = documentSnapshot.data().Location._latitude.toString();
                                            let longitude = documentSnapshot.data().Location._longitude.toString();
                                            console.log("-----------------------------in login page--------------",latitude,longitude);
                                            
                                            AsyncStorage.setItem('UserType', documentSnapshot.data().RoleId.toString());
                                            AsyncStorage.setItem('Latitude', latitude);
                                            AsyncStorage.setItem('Longitude', longitude);
                                            setMobnum('');
                                            setPassword('');
                                            setDisabled(false);
                                            // redirect to home screen    
                                            navigation.navigate('initial');
                                        } else {
                                            Alert.alert("Inactive user");
                                        }
                                    } else {
                                        Alert.alert("Unautherized user");
                                        setDisabled(false);
                                    }
                                } else {
                                    Alert.alert("Invalid password");
                                    setDisabled(false);
                                }
                            });
                        } else {
                            Alert.alert("Invalid User");
                            setDisabled(false);
                        }
                    }).catch(error => console.error(error));
            } else {
                Alert.alert("Please provide registered mobile number and password to login");
                setDisabled(false);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function checkLogin() {
        try {
            let loginid = await AsyncStorage.getItem('UserDocId');
            if (loginid != null) {
                navigation.navigate('initial');
            }
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        checkLogin()
    }, [])

    return (
        <>
            <Appbar.Header style={{ backgroundColor: '#1E90FF' }}>
                <Appbar.Content title="Login" />
            </Appbar.Header>
            <View style={styles.body}>
                <Title style={styles.heading}>Login</Title>
                <TextInput
                    style={styles.input}
                    dense={true}
                    maxLength={10}
                    keyboardType={"numeric"}
                    onChangeText={text => setMobnum(text)}
                    value={mobnum}
                    label="Mobile Number"
                />
                <TextInput
                    style={styles.input}
                    dense={true}
                    secureTextEntry={true}
                    onChangeText={text => setPassword(text)}
                    value={password}
                    label="Password"
                />
                <View style={{ alignSelf: "flex-end" }}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("ForgotPassword");
                        }}>
                        <Text style={{ marginTop: 10, color: '#1E90FF', fontSize: 17 }}>Forgot password?</Text>
                    </TouchableOpacity>
                </View>
                <Button style={styles.buttonStyle} mode="contained" onPress={loginUser} disabled={disabled}>
                    Submit
                </Button>
                <View
                    style={{ marginTop: 100, alignContent: 'center', alignSelf: "center" }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("Signup")
                        }}>
                        <Text style={{ color: '#1E90FF', fontSize: 17 }}>Don't have an account? Signup</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    body: {
        padding: 20,
        alignContent: 'center',
        marginTop: 100,
    },
    input: {
        marginTop: 10
    },
    heading: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 25,
    },
    buttonStyle: {
        marginTop: 30,
        backgroundColor: '#1E90FF'
    }
});

export default Login;

