import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Alert,
    TouchableOpacity,
    PermissionsAndroid,
} from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const Signup = ({ navigation }) => {
    const userTypes = [{ "id": 3, "name": "DONOR" }, { "id": 4, "name": "RECEIVER" }, { "id": 2, "name": "MANAGER" }];
    const [userType, setUserType] = useState('');
    const [userRoleId, setUserRoleId] = useState('');
    const [mobnum, setMobnum] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [code, setCode] = useState('');
    const [visible, setVisible] = useState(false);
    const [showBirthDay, setShowBirthDay] = useState(false);
    const [birthday, setBirthDay] = useState('');

    async function sendNotification(token, usertype) {
        firestore()
            .collection('UpdateTokens')
            .where('Usertype', '==', usertype)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.size > 0) {
                    let count = 0
                    querySnapshot.forEach(documentSnapshot => {
                        let docData = documentSnapshot.data();
                        let fcm_token = docData.fcmtoken
                        var myHeaders = new Headers();
                        myHeaders.append("Content-Type", "application/json");
                        myHeaders.append("Accept", "application/json");
                        myHeaders.append("Authorization", "Bearer " + token);
                        var raw = JSON.stringify({
                            "message": {
                                "notification": {
                                    "title": "New User Added",
                                    "body": "New User is registered to the application, please verify and activate respective account"
                                },
                                "token": fcm_token
                            }
                        });
                        var requestOptions = {
                            method: 'POST',
                            headers: myHeaders,
                            body: raw,
                            redirect: 'follow'
                        };
                        fetch("https://fcm.googleapis.com/v1/projects/fooddonation-bc0e3/messages:send?key=AIzaSyD8RDiRJaRj3uFjSc2IS9m3-dyk17d2VRA", requestOptions)
                            .then(response => response.text())
                            .then(result => console.log(result))
                            .catch(error => console.log('error', error));
                        count++;
                        if (count == querySnapshot.size) {
                            setUserRoleId('');
                        }
                    })
                }
            }).catch(error => console.error(error));
    }


    function getAccessToken(roleId) {
        let usertype = 0
        if (roleId == '2') {
            usertype = 1
        } else if (roleId == '3' || roleId == '4') {
            usertype = 2
        }
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer token");
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "client_id": "424032600661-lvb2uiugtkru87rh56nupltiuounjm9l.apps.googleusercontent.com",
            "client_secret": "h0kruKyuaSQiBwHkeBaUUlm1",
            "refresh_token": "1//0gcYA3TvfakWECgYIARAAGBASNwF-L9IrXzvLMHNh9pX-iQ9IuBMXNSjmETmuZit4nutRa_67nRBEGLUpx46nELn8MClBJHab8K0",
            "grant_type": "refresh_token"
        });
        
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("https://www.googleapis.com/oauth2/v4/token", requestOptions)
            .then(response => response.json())
            .then(result => {
                sendNotification(result['access_token'], usertype)
            })
            .catch(error => console.log('error', error));
    }

    async function confirmVerificationCode() {
        try {
            setDisabled(true);
            let isVerified = await confirm.confirm(code);

            if (isVerified) {
                setConfirm(null);
                auth()
                    .signOut()
                    .then(() => console.log('User signed out!'));
                var currentTime = firestore.Timestamp.fromDate(new Date());
                var DOB = firestore.Timestamp.fromDate(new Date(date));
                if (userRoleId == 4) {
                    DOB = '';
                }
                var is_verified = false;
                var is_activate = false;
                if (userRoleId == 1) {
                    is_verified = true;
                }
                firestore()
                    .collection('Accounts')
                    .add({
                        'ContactNumber': Number(mobnum),
                        'DateOfBirth': DOB,
                        'InstanceId': 123456, // need this attribute for notification
                        'IsActive': true,
                        'IsVerified': is_activate,
                        'Location': new firestore.GeoPoint(Number(latitude), Number(longitude)),
                        'Password': password,
                        'RegisteredOn': currentTime,
                        'RoleId': userRoleId,
                        'Username': username

                    }).then(function (docRef) {
                        firestore()
                            .collection('UpdateTokens')
                            .add({
                                'UserId': docRef.id,
                                'Usertype': userRoleId,
                                'fcmtoken': ' '
                            }).then(() => {
                                console.log("Added to tokens table");
                            }).catch(error => console.error(error));

                        if (docRef.id) {
                            Alert.alert("Your phone authentication done successfully.");
                            setMobnum('');
                            setUserType('');
                            setUsername('');
                            setPassword('');
                            setConfirmPassword('');
                            setLongitude('');
                            setLatitude('');
                            setDate('');
                            setBirthDay('');
                            setShowBirthDay(false);
                            getAccessToken(userRoleId);
                            getAccessToken('2');
                            navigation.navigate("Login");
                        } else {
                            console.log("Something went wrong")
                        }
                    })
            }
        } catch (error) {
            console.log(error)
            Alert.alert("Invalid OTP");
        }
    }

    async function signInWithPhoneNumber() {
        let number = '+91 ' + mobnum;
        const confirmation = await auth().signInWithPhoneNumber(number).catch(e => console.log(e));
        setConfirm(confirmation);
        setDisabled(false);
        setVisible(true);
    }

    function validation() {
        if (userType != "") {
            if (mobnum != "") {
                if (mobnum.length == 10) {
                    if (username != "") {
                        if (password != "") {
                            if (confirmPassword != "") {
                                if (confirmPassword == password) {
                                    if (latitude != "" && longitude != "") {
                                        setDisabled(true);
                                        signInWithPhoneNumber();
                                    } else {
                                        Alert.alert("Add location")
                                    }
                                } else {
                                    Alert.alert("Passwords don't match");
                                }
                            } else {
                                Alert.alert("Password can not be empty");
                            }
                        } else {
                            Alert.alert("Username can not be empty");
                        }
                    } else {
                        Alert.alert("Username can not be empty");
                    }
                } else {
                    Alert.alert("Invalid mobile number");
                }
            } else {
                Alert.alert("Mobile number can not be empty");
            }
        } else {
            Alert.alert("User type can not be empty");
        }
    }

    async function setLocation(latitude, longitude) {
        setLatitude(latitude);
        setLongitude(longitude);
    }

    function showMode(currentMode) {
        setShow(true);
        setMode(currentMode);
    };

    function showDatepicker() {
        showMode('date');
    };

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
        let birthday = currentDate.toString();
        birthday = birthday.substring(0, 15);
        setBirthDay(birthday);
        setShowBirthDay(true);
    };

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
        });
        return () => {
            unsubscribe();
        };
    }, [])

    if (!visible) {
        return (
            <>
                <View style={styles.body}>
                    <Title style={styles.heading}>Signup</Title>
                    <View style={styles.pickerStyle}>
                        <Picker
                            selectedValue={userRoleId}
                            style={styles.dropdownStyle}
                            mode="dropdown"
                            onValueChange={(itemValue) => {
                                setUserType(itemValue.name);
                                setUserRoleId(itemValue.id);
                            }
                            }>
                            <Picker.Item label={"SELECT USER TYPE"} value={{ id: 0, name: "SELECT USER TYPE" }} key={0} />
                            {
                                userTypes.map((item, index) => {
                                    return <Picker.Item label={item.name} value={item} key={index} />
                                })
                            }
                        </Picker>
                    </View>
                    <TextInput
                        style={styles.input}
                        dense={true}
                        keyboardType={"numeric"}
                        onChangeText={text => setMobnum(text)}
                        value={mobnum}
                        label="Mobile Number"
                    />
                    <TextInput
                        style={styles.input}
                        dense={true}
                        onChangeText={text => setUsername(text)}
                        value={username}
                        label="Username"
                    />
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
                        secureTextEntry={true}
                        onChangeText={text => setConfirmPassword(text)}
                        value={confirmPassword}
                        label="Confirm Password"
                    />
                    <Button
                        style={styles.buttonStyle2}
                        mode="contained"
                        onPress={() => navigation.navigate('Map', { setLocation: setLocation })}
                    >
                        Add Location
                    </Button>
                    {
                        userType == "DONOR" ?
                            <View>
                                {showBirthDay ?
                                    <View style={styles.pickerStyle}>
                                        <Button color='black' onPress={showDatepicker}>{birthday.toString()}</Button>
                                    </View>
                                    :
                                    <View style={styles.pickerStyle}>
                                        <Button color='black' onPress={showDatepicker}>{"ADD BIRTH DAY"}</Button>
                                    </View>
                                }
                                <View >
                                    {show && (
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={date}
                                            mode={mode}
                                            is24Hour={true}
                                            display="default"
                                            onChange={onChange}
                                        />
                                    )}
                                </View>
                            </View>
                            :
                            false
                    }
                    <Button style={styles.buttonStyle} disabled={disabled} mode="contained" onPress={validation} disabled={disabled}>
                        Submit
                    </Button>
                    <View
                        style={{ marginTop: 50, alignContent: 'center', alignSelf: "center" }}

                    >
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("Login")
                            }}>
                            <Text style={{ color: '#1E90FF', fontSize: 17 }}>Have an account? Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        );
    } else {
        return (
            <View style={styles.body}>
                <Title style={styles.heading}>OTP Verification</Title>
                <TextInput
                    style={styles.input}
                    dense={true}
                    keyboardType={"numeric"}
                    onChangeText={text => setCode(text)}
                    value={code}
                    label="Enter OTP"
                />
                <View style={{ alignSelf: "flex-end" }}>
                    <TouchableOpacity
                        onPress={validation}>
                        <Text style={{ marginTop: 10, color: '#1E90FF', fontSize: 17 }}>Resend OTP</Text>
                    </TouchableOpacity>
                </View>
                <Button style={styles.buttonStyle} mode="contained" onPress={confirmVerificationCode} disabled={disabled}>
                    Submit
                </Button>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    body: {
        padding: 20,
        alignContent: 'center',
        marginTop: 5,
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
    },
    buttonStyle2: {
        marginTop: 20,
        backgroundColor: '#1E90FF'
    },
    pickerStyle: {
        borderWidth: 2,
        borderColor: '#c2c2c1',
        borderRadius: 5,
        marginTop: 20,
        backgroundColor: '#E8E8E8'
    },
    dropdownStyle: {
        height: 50,
        width: '100%'
    }
});

export default Signup;

