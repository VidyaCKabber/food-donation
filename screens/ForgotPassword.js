import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Alert
} from 'react-native';
import { TextInput, Button, Title, Appbar, Text } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';


const ForgotPassword = ({ navigation }) => {
    const [mobnum, setMobnum] = useState('');
    const [confirm, setConfirm] = useState(null);
    const [userdoc, setUserDoc] = useState('');
    const [OTP, setOTP] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [enableOTP, setEnableOTP] = useState(false);
    const [resetPassword, setResetPassword] = useState(false);

    //first function to execute
    useEffect(() => {
    }, []);

    async function confirmVerificationCode() {
        try {
            setDisabled(true);
            let isVerified = await confirm.confirm(OTP);
            if (isVerified) {
                setConfirm(null);
                console.log("validated");
                auth()
                    .signOut()
                    .then(() => console.log('User signed out!'));
                setEnableOTP(false);
                setResetPassword(true);
                setDisabled(false);
            }
        } catch (error) {
            console.log(error)
            Alert.alert("Invalid OTP");
            setDisabled(false);
        }
    }

    async function signInWithPhoneNumber() {
        console.log("test")
        let number = '+91 ' + mobnum;
        const confirmation = await auth().signInWithPhoneNumber(number).catch(e => console.log(e));
        console.log(confirmation);
        setConfirm(confirmation);
    }

    function PasswordRecovery() {
        if (mobnum != "") {
            firestore()
                .collection('Accounts')
                .where('ContactNumber', '==', Number(mobnum))
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.size > 0) {
                        querySnapshot.forEach(documentSnapshot => {
                            setUserDoc(documentSnapshot.id);
                            if (OTP != "") {
                                signInWithPhoneNumber();
                            } else {
                                signInWithPhoneNumber();
                                Alert.alert("OTP is sent to the registered mobile number");
                                setEnableOTP(true);
                            }
                        })
                    }
                    else {
                        Alert.alert("Invalid user")
                    }
                }).catch(error => console.error(error))
        }
        else {
            Alert.alert("Please Enter the Registered Mobile Number");
        }
    }

    function ResetPassword() {
        if (password != "" && confirmPassword != "") {
            if (password == confirmPassword) {
                firestore()
                    .collection('Accounts')
                    .doc(userdoc)
                    .update({
                        Password: confirmPassword,
                    })
                    .then(() => {
                        Alert.alert("Password Changed Successfully!");
                    }).catch(e => console.error(e))
                navigation.navigate('Login');
            } else {
                Alert.alert("Passwords don't match");
            }
        } else {
            Alert.alert("Please Fill out the fields");
        }
    }

    return (
        <>
            {/* <Appbar.Header >
                <Appbar.Content title="Login" />
            </Appbar.Header> */}
            <View style={styles.body}>
                <Title style={styles.heading}>Forgot Password</Title>
                {
                    enableOTP != true && resetPassword != true ?
                        <View>
                            <TextInput
                                style={styles.input}
                                dense={true}
                                keyboardType={"numeric"}
                                value={mobnum}
                                maxLength={10}
                                label="Registered Mobile Number"
                                onChangeText={text => setMobnum(text)}
                            />
                            <Button style={styles.buttonStyle} mode="contained" onPress={PasswordRecovery} disabled={disabled}>
                                Submit
                            </Button>
                        </View>
                        :
                        false
                }
                {
                    enableOTP ?
                        <View>
                            <TextInput
                                style={styles.input}
                                dense={true}
                                secureTextEntry={true}
                                onChangeText={text => setOTP(text)}
                                value={OTP}
                                label="OTP"
                            />
                            <Button style={styles.buttonStyle} mode="contained"
                                onPress={() => {
                                    confirmVerificationCode()
                                }}
                                disabled={disabled}>
                                Submit
                            </Button>
                            <Button style={styles.buttonStyle} mode="contained"
                                onPress={() => {
                                    signInWithPhoneNumber()
                                }}>
                                Resend
                            </Button>
                        </View>
                        :
                        false
                }
                {
                    resetPassword ?
                        <View>
                            <TextInput
                                style={styles.input}
                                dense={true}
                                secureTextEntry={true}
                                onChangeText={text => setPassword(text)}
                                value={password}
                                label="Password"
                            />
                            <TextInput
                                style={styles.input}
                                dense={true}
                                onChangeText={text => setConfirmPassword(text)}
                                value={confirmPassword}
                                label="Confirm Password"
                            />
                            <Button style={styles.buttonStyle} mode="contained" onPress={ResetPassword} disabled={disabled}>
                                Submit
                            </Button>
                        </View>
                        :
                        false
                }
                <View
                    style={{ marginTop: 100, alignContent: 'center', alignSelf: "center" }}

                >
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("Login")
                        }}>
                        <Text style={{ color: '#1E90FF', fontSize: 17 }}>Login</Text>
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

export default ForgotPassword;

