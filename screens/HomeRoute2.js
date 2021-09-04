import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    useWindowDimensions,
    Alert,
    AppState,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { TabView } from 'react-native-tab-view';
import { Appbar, Card, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntIcon from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';

var loadImgPath = "https://firebasestorage.googleapis.com/v0/b/fooddonation-bc0e3.appspot.com/o/";
// show food request to donar and donations requests to recivers or all?
const Feed = ({ navigation }) => {
    const quotes = [
        { "index": 0, "title": "Feed the Needy", "imageName": "donote_receive.PNG", "quote": "No more hungry tummies." },
        { "index": 1, "title": "Serve the Nation", "imageName": "FeedChild.PNG", "quote": "Say goodbye to child hunger by feeding one hungry tummy at a time." },
        { "index": 2, "title": "No more food wastage", "imageName": "GivingSaving.PNG", "quote": "The heroes of tomorrow are the youth of today." },
        { "index": 3, "title": "Feed the Needy", "imageName": "donote_receive.PNG", "quote": "No more hungry tummies." },
        { "index": 4, "title": "Serve the Nation", "imageName": "FeedChild.PNG", "quote": "Say goodbye to child hunger by feeding one hungry tummy at a time." },
        { "index": 5, "title": "No more food wastage", "imageName": "GivingSaving.PNG", "quote": "The heroes of tomorrow are the youth of today." },
        { "index": 6, "title": "Feed the Needy", "imageName": "donote_receive.PNG", "quote": "No more hungry tummies." },
        { "index": 7, "title": "Serve the Nation", "imageName": "FeedChild.PNG", "quote": "Say goodbye to child hunger by feeding one hungry tummy at a time." },
        { "index": 8, "title": "No more food wastage", "imageName": "GivingSaving.PNG", "quote": "The heroes of tomorrow are the youth of today." }
    ]

    return (
        <SafeAreaView>
            {
                quotes.length > 0 ?
                    <FlatList
                        data={quotes}
                        keyExtractor={(item) => item.index}
                        renderItem={(quote) => {
                            return (
                                <Card key={quote.index} style={{ margin: 10 }}>
                                    <Card.Title title={quote.item.title} />
                                    <TouchableOpacity>
                                        <Card.Cover source={{ uri: loadImgPath + quote.item.imageName + '?alt=media' }} />
                                    </TouchableOpacity>
                                    <Card.Content>
                                        <Paragraph>{quote.item.quote}</Paragraph>
                                    </Card.Content>
                                </Card>
                            )
                        }}
                    />
                    :
                    <Text style={{ alignSelf: 'center', fontSize: 20, marginTop: 250 }}>No Content to display</Text>
            }
        </SafeAreaView>
    )
};

// food requests
const Requests = ({ navigation }) => {
    const [requests, setRequests] = useState([]);
    const [isreqstatusupdated, setIsReqStatusUpdated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [loadLocation, setLoadLocation] = useState(false);
    const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });

    async function sendNotification(token, userid, status, message) {
        firestore()
            .collection('UpdateTokens')
            .where('UserId', '==', userid)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.size > 0) {
                    let count = 0
                    querySnapshot.forEach(documentSnapshot => {
                        let docData = documentSnapshot.data();
                        let fcm_token = docData.fcmtoken;
                        var myHeaders = new Headers();
                        myHeaders.append("Content-Type", "application/json");
                        myHeaders.append("Accept", "application/json");
                        myHeaders.append("Authorization", "Bearer " + token);
                        var raw = JSON.stringify({
                            "message": {
                                "notification": {
                                    "title": "Request " + status,
                                    "body": message
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

    function getAccessToken(userid, status, message) {
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
                sendNotification(result['access_token'], userid, status, message)
            })
            .catch(error => console.log('error', error));
    }

    async function updateRequestStatus(requeststatus, requestDoc, userid) {
        let usertype = await AsyncStorage.getItem('UserType');
        let loginid = await AsyncStorage.getItem('UserDocId');
        var getCollections = {
            "3": {
                sourcetable: "FoodRequests",
                subtable: "FoodRequestStatus",
                conditionfiled: "RequestId"
            },
            "4": {
                sourcetable: "DonationRequests",
                subtable: "FoodDonationStatus",
                conditionfiled: "DonationId"
            }
        };
        //usertype -> 3: donor , 4: receiver
        let getInfo = getCollections[usertype];
        firestore()
            .collection(getInfo['subtable'])
            .where(getInfo['conditionfiled'], '==', requestDoc)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach(documentSnapshot => {
                    // in case donar requested the food
                    if (documentSnapshot.data().AccountId == loginid) {
                        firestore()
                            .collection(getInfo['subtable'])
                            .doc(documentSnapshot.id)
                            .update({
                                Status: Number(requeststatus)
                            }).then(() => {
                                setIsReqStatusUpdated(true);
                            }).catch(error => console.error(error));
                    } else {
                        firestore()
                            .collection(getInfo['subtable'])
                            .add({
                                'AccountId': loginid,
                                'RequestId': requestDoc,
                                'Status': Number(requeststatus)
                            }).catch(error => console.error(error));
                    }
                })
            }).catch(error => console.error(error));

        // when request accepted , updated it's status in main table 
        // if (Number(requeststatus) !== 3) {
        firestore()
            .collection(getInfo['sourcetable'])
            .doc(requestDoc)
            .update({
                Status: Number(requeststatus),
                ReqSeveredBy: loginid
            }).then(() => {
                setIsReqStatusUpdated(true);
            })
        // }
        console.log(isreqstatusupdated)
        if (isreqstatusupdated) {
            if (Number(requeststatus) == 2) {
                var status = 'Accepted';
                getRequests('DonationRequests', 'FoodDonationStatus', 'DonationId');
                getAccessToken(userid, status, "Hurray... Your request accepted successfully");
                Alert.alert("Request " + status + " Successfully!");
            }
            if (Number(requeststatus) == 4) {
                var status = 'Fulfilled';
                getRequests('DonationRequests', 'FoodDonationStatus', 'DonationId');
                getAccessToken(userid, status, "Hurray... Your request fulfilled successfully");
                Alert.alert("Request " + status + " Successfully!");
            }
            if (Number(requeststatus) == 3) {
                var status = 'Declined';
                getRequests('DonationRequests', 'FoodDonationStatus', 'DonationId');
                Alert.alert("Request " + status + " Successfully!");
            }
        }
    }

    async function getRequests(sourcetable, subtable, conditionval) {
        let loginid = await AsyncStorage.getItem('UserDocId');
        setRequests([]);
        setLoading(true);
        try {
            firestore()
                .collection(sourcetable)
                // Status == 1 for pending requests
                .get()
                .then(querySnapshot => {
                    let count = 0;
                    if (querySnapshot.size > 0) {
                        querySnapshot.forEach(documentSnapshot => {
                            //Validate the request id declined by the user -> don't not list user declined requests
                            /* 
                                When user decline the request, that is declained to the user and not for others. Therefore, status of request set as pending until due time
                            */

                            firestore()
                                .collection(subtable)
                                .where(conditionval, '==', documentSnapshot.id)
                                .get().then(query => {
                                    query.forEach(document => {
                                        let docData = { docId: documentSnapshot.id, ...documentSnapshot.data() };
                                        if (document.data().AccountId == loginid) {
                                            // Status -> 3: The request is declined by the user
                                            if (document.data().Status != 3) {
                                                let status = 'Pending';
                                                if (docData["Status"] == 1) {
                                                    status = 'Pending';
                                                } else if (docData["Status"] == 2) {
                                                    status = 'Accepted';
                                                } else if (docData["Status"] == 3) {
                                                    status = 'Declined';
                                                } else {
                                                    status = 'Fulfilled';
                                                }
                                                var datum = Date.parse(docData["DueOn"].toDate());
                                                var Duetimestamp = datum / 1000;
                                                var currentTime = new Date();
                                                currentTime.setMilliseconds(0);
                                                var currentTimestamp = currentTime.getTime() / 1000;
                                                if (Number(currentTimestamp) > Number(Duetimestamp)) {
                                                    status = 'Expired';
                                                }
                                                docData["Status"] = status;
                                                let updatedDocDate = Object.assign(docData, { 'sourcetable': sourcetable });
                                                setRequests(requests => [...requests, updatedDocDate]);
                                                count++;
                                                if (count == query.size) {
                                                    setLoading(false);
                                                    setIsFetching(false);
                                                }
                                            } else {
                                                let status = 'Pending';
                                                if (docData["Status"] == 1) {
                                                    status = 'Pending';
                                                } else if (docData["Status"] == 2) {
                                                    status = 'Accepted';
                                                } else if (docData["Status"] == 3) {
                                                    status = 'Declined';
                                                } else {
                                                    status = 'Fulfilled';
                                                }
                                                var datum = Date.parse(docData["DueOn"].toDate());
                                                var Duetimestamp = datum / 1000;
                                                var currentTime = new Date();
                                                currentTime.setMilliseconds(0);
                                                var currentTimestamp = currentTime.getTime() / 1000;
                                                if (Number(currentTimestamp) > Number(Duetimestamp)) {
                                                    status = 'Expired';
                                                }
                                                docData["Status"] = status;
                                                let updatedDocDate = Object.assign(docData, { 'sourcetable': sourcetable });
                                                setRequests(requests => [...requests, updatedDocDate]);
                                                count++;
                                                if (count == query.size) {
                                                    setLoading(false);
                                                    setIsFetching(false);
                                                }
                                            }
                                        } else {
                                            let status = 'Pending';
                                            if (docData["Status"] == 1) {
                                                status = 'Pending';
                                            } else if (docData["Status"] == 2) {
                                                status = 'Accepted';
                                            } else if (docData["Status"] == 3) {
                                                status = 'Declined';
                                            } else {
                                                status = 'Fulfilled';
                                            }
                                            var datum = Date.parse(docData["DueOn"].toDate());
                                            var Duetimestamp = datum / 1000;
                                            var currentTime = new Date();
                                            currentTime.setMilliseconds(0);
                                            var currentTimestamp = currentTime.getTime() / 1000;
                                            if (Number(currentTimestamp) > Number(Duetimestamp)) {
                                                status = 'Expired';
                                            }
                                            docData["Status"] = status;
                                            let updatedDocDate = Object.assign(docData, { 'sourcetable': sourcetable });
                                            setRequests(requests => [...requests, updatedDocDate]);
                                            count++;
                                            if (count == query.size) {
                                                setLoading(false);
                                                setIsFetching(false);
                                            }
                                        }
                                    })
                                });
                        });
                    }
                }).catch(error => {
                    console.error(error);
                    setLoading(false);
                    setIsFetching(false);
                });
        } catch (e) {
            console.log(e);
            setIsFetching(false);
            setLoading(false);
        }
    }

    async function listRequests() {
        let MyLatitude = await AsyncStorage.getItem('Latitude');
        let MyLongitude = await AsyncStorage.getItem('Longitude');
        setLoadLocation(false);
        for (let i = 1; i <= 5; i++) {
            setTimeout(() => console.log(`#${i}`), 1000);
        }
        setUserLocation({
            latitude: parseFloat(MyLatitude),
            longitude: parseFloat(MyLongitude)
        });
        setLoadLocation(true);
    }

    useEffect(() => {
        setLoading(false);
        listRequests();
        getRequests('DonationRequests', 'FoodDonationStatus', 'DonationId');
    }, []);

    function onRefresh() {
        setIsFetching(true);
        setLoading(true);
        getRequests('DonationRequests', 'FoodDonationStatus', 'DonationId');
    }

    return (
        <SafeAreaView>
            {
                loading ?
                    <View style={[styles.container2, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#187bcd" />
                    </View>
                    :
                    requests && requests.length > 0 ?
                        <FlatList
                            data={requests}
                            keyExtractor={(item) => item.docId}
                            onRefresh={() => onRefresh()}
                            refreshing={isFetching}
                            renderItem={(request) => {
                                return (
                                    <Card key={request.item.docId} style={{ margin: 10 }}>
                                        <Card.Title
                                            title={request.item.FoodName}
                                            right={(props) => <Text style={{ marginRight: 10 }}>{request.item.Status}</Text>}
                                        />
                                        <Card.Content>
                                            <Paragraph>{request.item.Description}</Paragraph>
                                        </Card.Content>
                                        <TouchableOpacity onPress={() => navigation.navigate('details', { 'docId': request.item.docId, 'tableName': request.item.sourcetable })}>
                                            <Card.Cover source={{ uri: loadImgPath + request.item.Image[0] + '?alt=media' }} />
                                        </TouchableOpacity>
                                        {
                                            request.item.Status == 'Expired' ?
                                                <Card.Actions >
                                                    <Button onPress={() => navigation.navigate('viewlocation', { userLocation: userLocation, latitude: request.item.Location.Latitude, longitude: request.item.Location.Longitude })}>View Location</Button>
                                                    {
                                                        request.item.Status == 'Pending' ?
                                                            <>
                                                                <Button disabled={true} >Accept</Button>
                                                                <Button disabled={true} >Decline</Button>
                                                            </>
                                                            :
                                                            false
                                                    }
                                                </Card.Actions>
                                                :
                                                <Card.Actions >
                                                    <Button onPress={() => navigation.navigate('viewlocation', { userLocation: userLocation, latitude: request.item.Location.Latitude, longitude: request.item.Location.Longitude })}>View Location</Button>
                                                    {
                                                        request.item.Status == 'Pending' ?
                                                            <>
                                                                <Button onPress={() => updateRequestStatus(2, request.item.docId, request.item.DonorId)}>Accept</Button>
                                                                <Button onPress={() => updateRequestStatus(3, request.item.docId, request.item.DonorId)}>Decline</Button>
                                                            </>
                                                            :
                                                            request.item.Status == 'Accepted' ?
                                                                <Button onPress={() => updateRequestStatus(4, request.item.docId, request.item.DonorId)}>Fulfill</Button>
                                                                :
                                                                false
                                                    }
                                                </Card.Actions>
                                        }
                                    </Card>
                                )
                            }}
                        />
                        :
                        <View>
                            <Text style={{ alignSelf: 'center', fontSize: 20, marginTop: 250 }}>No Content to display</Text>
                            <Button mode="contained" onPress={onRefresh} width={150} style={{ alignSelf: 'center', marginTop: 20, backgroundColor: '#187bcd' }}>Refresh</Button>
                        </View>
            }
        </SafeAreaView>
    )
};

const MyActivities = ({ navigation }) => {
    const [foodRequests, setFoodRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [usertype, setUserType] = useState('');
    const [loginid, setLoginId] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [loadLocation, setLoadLocation] = useState(false);
    const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });

    async function getFoodRequests(userDocId, sourcetable) {
        setFoodRequests([]);
        try {
            firestore()
                .collection(sourcetable)
                // Status == 1 for pending requests
                .where('RequesterId', '==', userDocId)
                .get()
                .then(querySnapshot => {
                    console.log(querySnapshot.size)
                    if (querySnapshot.size > 0) {
                        let count = 0;
                        querySnapshot.forEach(documentSnapshot => {
                            // list only active and verified users
                            let docData = { docId: documentSnapshot.id, ...documentSnapshot.data() };
                            let status = 'Pending';
                            if (docData["Status"] == 1) {
                                status = 'Pending';
                            } else if (docData["Status"] == 2) {
                                status = 'Accepted';
                            } else if (docData["Status"] == 3) {
                                status = 'Declined';
                            } else {
                                status = 'Fulfilled';
                            }
                            var datum = Date.parse(docData["DueOn"].toDate());
                            var Duetimestamp = datum / 1000;
                            var currentTime = new Date();
                            currentTime.setMilliseconds(0);
                            var currentTimestamp = currentTime.getTime() / 1000;

                            if (Number(currentTimestamp) > Number(Duetimestamp)) {
                                status = 'Expired';
                            }
                            if (documentSnapshot.data().RequesterId) {
                                docData["Image"] = documentSnapshot.data().Image;
                            } else {
                                docData["Image"] = documentSnapshot.data().Image[0];
                            }
                            docData["Status"] = status;
                            let updatedDocData = Object.assign(docData, { 'sourcetable': sourcetable });
                            setFoodRequests(foodRequests => [...foodRequests, updatedDocData]);
                            count++;
                            if (count == querySnapshot.size) {
                                setLoading(false);
                                setIsFetching(false);
                            }
                        })
                    } else {
                        setLoading(false);
                        setIsFetching(false);
                    }
                }).catch(error => {
                    console.error(error);
                    setLoading(false);
                    setIsFetching(false);
                });
        } catch (e) {
            console.log(e);
            setLoading(false);
            setIsFetching(false);
        }
    }

    async function listRequests() {
        let usertype = await AsyncStorage.getItem('UserType');
        let MyLatitude = await AsyncStorage.getItem('Latitude');
        let MyLongitude = await AsyncStorage.getItem('Longitude');

        setLoadLocation(false);
        for (let i = 1; i <= 5; i++) {
            setTimeout(() => console.log(`#${i}`), 1000);
        }
        setUserLocation({
            latitude: parseFloat(MyLatitude),
            longitude: parseFloat(MyLongitude)
        });
        setLoadLocation(true);
        console.log("myLocation", userLocation);
        setUserType(usertype);
        setUserType(usertype)
        let loginid = await AsyncStorage.getItem('UserDocId');
        setLoginId(loginid)
        try {
            getFoodRequests(loginid, 'FoodRequests');
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        setLoading(false);
        listRequests();
    }, []);

    function onRefresh() {
        setIsFetching(true);
        setLoading(true);
        getFoodRequests(loginid, 'FoodRequests');
    }

    return (
        <SafeAreaView>
            <View>
                {
                    usertype == '4' && loading ?
                        <View style={[styles.container2, styles.horizontal]}>
                            <ActivityIndicator size="large" color="#187bcd" />
                        </View>
                        :
                        foodRequests && foodRequests.length > 0 ?
                            <FlatList
                                data={foodRequests}
                                keyExtractor={(request) => request.docId}
                                onRefresh={() => onRefresh()}
                                refreshing={isFetching}
                                renderItem={(request) => {
                                    return (
                                        <Card key={request.item.docId} style={{ margin: 10 }}>
                                            <Card.Title
                                                title={request.item.FoodName}
                                                right={(props) =>
                                                    <Text style={{ marginRight: 10 }}>{request.item.Status}</Text>}
                                            />
                                            <TouchableOpacity onPress={() => navigation.navigate('details', { 'docId': request.item.docId, 'tableName': request.item.sourcetable })}>
                                                <Card.Cover source={{ uri: loadImgPath + request.item.Image + '?alt=media' }} onPress={() => { navigation.navigate('details', { 'details': { 'name': 'vidya' } }) }} />
                                            </TouchableOpacity>
                                            <Card.Content>
                                                <Paragraph>{request.item.Description}</Paragraph>
                                            </Card.Content>
                                            {
                                                request.item.Status == 'Expired' ?
                                                    <Card.Actions >
                                                        <Button onPress={() => navigation.navigate('viewlocation', { userLocation: userLocation, latitude: request.item.Location.Latitude, longitude: request.item.Location.Longitude })}>View Location</Button>
                                                    </Card.Actions>
                                                    :
                                                    <Card.Actions >
                                                        <Button onPress={() => navigation.navigate('viewlocation', { userLocation: userLocation, latitude: request.item.Location.Latitude, longitude: request.item.Location.Longitude })}>View Location</Button>
                                                    </Card.Actions>
                                            }
                                        </Card>
                                    )
                                }}
                            />
                            :
                            <View>
                                <Text style={{ alignSelf: 'center', fontSize: 20, marginTop: 250 }}>No Content to display</Text>
                                <Button mode="contained" onPress={onRefresh} width={150} style={{ alignSelf: 'center', marginTop: 20, backgroundColor: '#187bcd' }}>Refresh</Button>
                            </View>
                }

            </View>
        </SafeAreaView>
    )
};

const Donors = ({ navigation }) => {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [foodType, setFoodType] = useState([]);

    function getMostDonationFoodBySelectedDonor(DonorDoc) {
        firestore()
            .collection('DonationRequests')
            // Filter results
            .where('DonorId', '==', DonorDoc)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.size > 0) {
                    querySnapshot.forEach(documentSnapshot => {
                        let FoodType = documentSnapshot.data().FoodType;
                        setFoodType(foodType => [...foodType, FoodType]);
                    });
                } else {
                    console.log("No items found");
                }
            }).catch(error => console.error(error));
    }

    function getMostReceivedFoodBySelectedReceiver(ReceiverDoc) {
        firestore()
            .collection('FoodRequests')
            // Filter results
            .where('ReqSeveredBy', '==', ReceiverDoc)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.size > 0) {
                    querySnapshot.forEach(documentSnapshot => {
                        let FoodType = documentSnapshot.data().FoodType;
                        setFoodType(foodType => [...foodType, FoodType]);
                    });
                } else {
                    console.log("No items found");
                }
            }).catch(error => console.error(error));
    }

    function getFoodType(arr) {

        return arr.sort((a, b) =>
            arr.filter(v => v === a).length
            - arr.filter(v => v === b).length
        ).pop();
    }

    function getMostDonatedFood(docId) {
        getMostDonationFoodBySelectedDonor(docId);
        getMostReceivedFoodBySelectedReceiver(docId);
        for (let i = 1; i <= 5; i++) {
            setTimeout(() => console.log(`#${i}`), 1000);
        }
        foodtype = getFoodType(foodType);
        return foodtype;
    }

    async function getDonors() {
        setDonors([]);
        try {
            firestore()
                .collection('Accounts')
                // Status == 1 for pending requests
                .where('RoleId', '==', Number(3))
                .get()
                .then(querySnapshot => {
                    let count = 0;
                    if (querySnapshot.size > 0) {
                        querySnapshot.forEach(documentSnapshot => {
                            // list only active and verified users
                            if (documentSnapshot.data().IsVerified == documentSnapshot.data().IsActive) {
                                let docData = { docId: documentSnapshot.id, ...documentSnapshot.data() };
                                MDfoodType = getMostDonatedFood(documentSnapshot.id);
                                let updatedDocData = Object.assign(docData, { 'MDfoodType': "Usually donated " + MDfoodType });
                                setDonors(donors => [...donors, updatedDocData]);
                                count++;
                                if (count == querySnapshot.size) {
                                    setLoading(false);
                                    setIsFetching(false);
                                }
                            }
                        })
                    } else {
                        setLoading(false);
                        setIsFetching(false);
                    }
                }).catch(error => {
                    console.error(error)
                    setLoading(false);
                    setIsFetching(false);
                });
        } catch (e) {
            console.log(e);
            setLoading(false);
            setIsFetching(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        getDonors();
    }, []);

    function onRefresh() {
        setIsFetching(true);
        setLoading(true);
        getDonors();
    }

    return (
        <SafeAreaView>
            {
                loading ?
                    <View style={[styles.container2, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#187bcd" />
                    </View>
                    :
                    donors && donors.length > 0 ?
                        <FlatList
                            data={donors}
                            keyExtractor={(item) => item.docId}
                            onRefresh={() => onRefresh()}
                            refreshing={isFetching}
                            renderItem={(donar) => {
                                return (
                                    <Card key={donar.item.docId} style={{ margin: 10 }}>
                                        <Card.Title title={donar.item.Username} />
                                        <Card.Content>
                                            <Paragraph>{donar.item.MDfoodType}</Paragraph>
                                        </Card.Content>
                                        <Card.Content>
                                            <Paragraph></Paragraph>
                                        </Card.Content>
                                        <TouchableOpacity onPress={() => navigation.navigate("profile", { 'docId': donar.item.docId, 'userType': 3 })}>
                                            <Card.Cover source={{ uri: loadImgPath + 'donate.PNG' + '?alt=media' }} />
                                        </TouchableOpacity>
                                        <Card.Actions>
                                            <Button onPress={() => navigation.navigate("profile", { 'docId': donar.item.docId, 'userType': 3 })}>View Profile</Button>
                                            <Button onPress={() => navigation.navigate("Donate")}> Request</Button>
                                        </Card.Actions>
                                    </Card>
                                )
                            }}
                        />
                        :
                        <View>
                            <Text style={{ alignSelf: 'center', fontSize: 20, marginTop: 250 }}>No Content to display</Text>
                            <Button mode="contained" onPress={onRefresh} width={150} style={{ alignSelf: 'center', marginTop: 20, backgroundColor: '#187bcd' }}>Refresh</Button>
                        </View>
            }
        </SafeAreaView>
    )
};

const HomeRoute2 = ({ navigation }) => {
    const [usertype, setUserType] = useState('');
    const [userId, setUserId] = useState('');
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);
    const layout = useWindowDimensions();
    const [index, setIndex] = React.useState(0);

    const [routes] = React.useState([
        { key: 'feed', title: 'Feed' },
        { key: 'requests', title: 'Requests' },
        { key: 'donations', title: 'My Activities' },
        { key: 'donors', title: 'Donors' }
    ]);

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'feed'://receiver -> donations vs : donar -> food requests
                return <Feed navigation={navigation} />;
            case 'requests': // donar -> food requests : rec -> donation requests
                return <Requests navigation={navigation} />;
            case 'donations': // my donations : my receivers
                return <MyActivities navigation={navigation} />;//
            case 'donors': // donate can not see this tab 
                return <Donors navigation={navigation} />;
        }
    };

    async function signOut() {
        await AsyncStorage.removeItem('UserDocId');
        await AsyncStorage.removeItem('UserType');
        navigation.navigate('Login');
    }

    function navigateToRequestsDonates() {
        if (usertype == 3) {
            navigation.navigate("Donate");
        } else if (usertype == 4) {
            navigation.navigate("Request");
        }
    }

    async function getData() {
        try {
            let loginid = await AsyncStorage.getItem('UserDocId');
            if (loginid != null) {
                setUserId(loginid);
                let usertype = await AsyncStorage.getItem('UserType');
                setUserType(usertype);
            } else {
                navigation.navigate('Login');
            }
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <>
            <Appbar.Header style={{ backgroundColor: '#1E90FF' }}>
                <Appbar.Content title="Home" />
                <Appbar.Action style={{ marginRight: 30 }} icon="plus" onPress={() => navigateToRequestsDonates()} />
                <Icon style={{ marginRight: 30 }} name="user" size={25} color="#ffffff" onPress={() => { navigation.navigate('profile', { 'docId': userId, 'userType': usertype }) }} />
                <Appbar.Action icon={() => <AntIcon name="logout" size={20} color="white" />} onPress={signOut} />
            </Appbar.Header>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container2: {
        justifyContent: "center",
        marginTop: 100
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
    }
});

export default HomeRoute2;