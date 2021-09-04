import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Alert,
} from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

const Request = ({ navigation }) => {
    const foodTypes = ["RAW MATERIALS", "COOKED FOOD", "VEGETABLES"];
    const [foodType, setFoodType] = useState('');
    const [foodname, setFoodName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState();
    const [beneficiaries, setBeneficiaries] = useState();
    const [disabled, setDisabled] = useState(false);
    const [date, setDate] = useState('');
    const [loginid, setLoginid] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [showMaxTime, setShowMaxTime] = useState(false);
    const [maxTime, setMaxTime] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [reqid, setReqId] = useState('');

    async function sendNotification(token) {
        firestore()
            .collection('UpdateTokens')
            .where('Usertype', '==', 3)
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
                                    "title": "New Food Request Added",
                                    "body": "Food Request Added, please help them by donating it"
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
                        }
                    })
                }
            }).catch(error => console.error(error));
    }

    function getAccessToken() {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer token");
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({ "client_id": "424032600661-lvb2uiugtkru87rh56nupltiuounjm9l.apps.googleusercontent.com", "client_secret": "h0kruKyuaSQiBwHkeBaUUlm1", "refresh_token": "1//0gmFg-8LZoB_hCgYIARAAGBASNwF-L9IrYdP0AZS-UifmDjjAg1i7ThSQCJk6CS9W5Z_SfRO7OWVi-sDPD-T5I2zcEMoVvnIFdww", "grant_type": "refresh_token" });
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        fetch("https://www.googleapis.com/oauth2/v4/token", requestOptions)
            .then(response => response.json())
            .then(result => {
                sendNotification(result['access_token'])
            })
            .catch(error => console.log('error', error));
    }

    function createFoodRequest() {
        try {
            setDisabled(true);
            var currentTime = firestore.Timestamp.fromDate(new Date());
            var dueTime = firestore.Timestamp.fromDate(new Date(date));

            firestore()
                .collection('FoodRequests')
                .add({
                    'Benefiters': Number(beneficiaries),
                    'Description': description,
                    'DueOn': dueTime,
                    'FoodName': foodname,
                    'FoodType': foodType,
                    'Image': "receive.PNG",
                    'Location': {
                        'Latitude': latitude, //latitude
                        'Longitude': longitude //longitude
                    },
                    'Quantity': Number(quantity),
                    'CreatedOn': currentTime,
                    'RequesterId': loginid, //loginid
                    'Status': 1,
                    'ReqSeveredBy': ''
                })
                .then(function (docRef) {
                    setReqId(docRef.id);

                    // add to status tracking table
                    firestore()
                        .collection('FoodRequestStatus')
                        .add({
                            'AccountId': loginid,
                            'RequestId': docRef.id,
                            'Status': 1
                        })
                        .then(() => {
                            getAccessToken();
                            Alert.alert("Food Request Created Successfully");
                            setFoodType('');
                            setFoodName('');
                            setDescription('');
                            setLatitude('');
                            setLongitude('');
                            setQuantity('');
                            setBeneficiaries('');
                            setShowMaxTime('');
                            setMaxTime('');
                            navigation.goBack();
                        }).catch(error => console.error(error));

                }).catch(error => console.error(error));

        } catch (e) {
            console.log(e);
            setDisabled(false);
        }
    }

    function validation() {
        if (foodType == "") {
            Alert.alert("Food type can not be empty");
        } else if (foodname == "") {
            Alert.alert("Food name can not be empty");
        } else if (description == "") {
            Alert.alert("Description can not be empty");
        } else if (quantity == "") {
            Alert.alert("Quantity can not be empty");
        } else if (date == "") {
            Alert.alert("Date Time can not be empty");
        } else if (latitude == "" || longitude == "") {
            Alert.alert("Please add Location");
        } else {
            createFoodRequest();
        }
    }

    async function setLocation(latitude, longitude) {
        let lat = await AsyncStorage.getItem('@latitude');
        let long = await AsyncStorage.getItem('@longitude');
        setLatitude(latitude);
        setLongitude(longitude);
    }

    //get initial data
    async function getData() {
        try {
            //let userid = await AsyncStorage.getItem('@loginid');
            let userid = await AsyncStorage.getItem('UserDocId');
            console.log(userid);
            setLoginid(userid)

            let usertype = await AsyncStorage.getItem('UserType');
            console.log(usertype)
            setUserType(usertype);

        } catch (e) {
            console.log(e);
            setCounter(1);
        }
    }

    //first function to execute
    useEffect(() => {
        getData();
    }, []);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        hideDatePicker();
        setDate(date);
        let day = date.toString();
        day = day.substring(0, 21);
        setMaxTime(day);
        setShowMaxTime(true);
    };

    return (
        <>
            <View style={styles.body}>
                <Title style={styles.heading}>REQUEST FOOD</Title>
                <View style={styles.pickerStyle}>
                    <Picker
                        selectedValue={foodType}
                        style={styles.dropdownStyle}
                        mode="dropdown"
                        onValueChange={(itemValue) =>
                            setFoodType(itemValue)
                        }>
                        <Picker.Item label={"SELECT FOOD TYPE"} value={""} key={0} />
                        {
                            foodTypes.map((item, index) => {
                                return <Picker.Item label={item} value={item} key={index} />
                            })
                        }
                    </Picker>
                </View>
                <TextInput
                    style={styles.input}
                    dense={true}
                    maxLength={100}
                    onChangeText={text => setFoodName(text)}
                    value={foodname}
                    label="Food Name"
                />
                <TextInput
                    style={styles.input}
                    dense={true}
                    multiline={true}
                    numberOfLines={3}
                    maxLength={500}
                    onChangeText={text => setDescription(text)}
                    value={description}
                    label="Description"
                />
                <TextInput
                    style={styles.input}
                    dense={true}
                    keyboardType={"numeric"}
                    onChangeText={text => setQuantity(text)}
                    value={quantity}
                    label="Quantity in Kg/Ltr"
                />
                <TextInput
                    style={styles.input}
                    dense={true}
                    keyboardType={"numeric"}
                    onChangeText={text => setBeneficiaries(text)}
                    value={beneficiaries}
                    label="Number of Benefitiers"
                />
                <View style={styles.pickerStyle}>
                    {
                        showMaxTime ?
                            <Button color='black' onPress={showDatePicker}>{maxTime.toString()}</Button>
                            :
                            <Button color="black" onPress={showDatePicker}>SELECT DATE TIME</Button>
                    }
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="datetime"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                    />
                </View>
                <Button
                    style={styles.buttonStyle2}
                    mode="contained"
                    onPress={() => navigation.navigate('Map', { setLocation: setLocation })}
                >
                    Add Location
                </Button>
                <Button
                    style={styles.buttonStyle}
                    mode="contained"
                    disabled={disabled}
                    onPress={validation}
                >
                    Submit
                </Button>
            </View>
        </>
    );
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

export default Request;
