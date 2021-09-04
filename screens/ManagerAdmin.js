import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Alert,
    SafeAreaView,
    FlatList,
    Text,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { Appbar, Card, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntIcon from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';

const ManagerAdmin = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(false);
    const [usertype, setUserType] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });

    async function VerifyUser(docId) {
        try {
            setDisabled(true)
            firestore()
                .collection('Accounts')
                .doc(docId)
                .update({ IsVerified: true })
                .then(() => {
                    setDisabled(false)
                    // getUsers();
                    if (parseInt(usertype) == 1) {
                        getAllUsers()
                    }
                    if (parseInt(usertype) == 2) {
                        getUsers();
                    }
                }).catch(e => {
                    setDisabled(false)
                    Alert.alert("Something went wrong, try again later")
                })
        } catch (e) {
            setDisabled(false)
            console.log(e);
        }
    }

    async function EnableDisableUser(docId, state) {
        try {
            setDisabled(true)
            firestore()
                .collection('Accounts')
                .doc(docId)
                .update({ IsActive: state })
                .then(() => {
                    setDisabled(false)
                    // getUsers();
                    if (parseInt(usertype) == 1) {
                        getAllUsers()
                    }
                    if (parseInt(usertype) == 2) {
                        getUsers();
                    }
                }).catch(e => {
                    setDisabled(false)
                    Alert.alert("Something went wrong, try again later")
                })
        } catch (e) {
            setDisabled(false)
            console.log(e);
        }
    }

    async function getAllUsers() {
        try {
            setLoading(true);
            setUsers([]);
            firestore()
                .collection('Accounts')
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.size > 0) {
                        let count = 0;
                        querySnapshot.forEach(documentSnapshot => {
                            let docData = { docId: documentSnapshot.id, ...documentSnapshot.data() };
                            setUsers(users => [...users, docData]);
                            count++;
                            if (count == querySnapshot.size) {
                                setLoading(false)
                                setIsFetching(false)
                            }
                        })
                    } else {
                        setLoading(false)
                        setIsFetching(false)
                    }
                }).catch(error => console.error(error));
        } catch (e) {
            console.log(e);
        }
    }

    async function getUsers() {
        try {
            setLoading(true);
            setUsers([]);
            firestore()
                .collection('Accounts')
                .where('RoleId', 'in', [3, 4])
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.size > 0) {
                        let count = 0;
                        querySnapshot.forEach(documentSnapshot => {
                            let docData = { docId: documentSnapshot.id, ...documentSnapshot.data() };
                            setUsers(users => [...users, docData]);
                            count++;
                            if (count == querySnapshot.size) {
                                setLoading(false)
                                setIsFetching(false)
                            }
                        })
                    } else {
                        setLoading(false)
                        setIsFetching(false)
                    }
                }).catch(error => console.error(error));
        } catch (e) {
            console.log(e);
        }
    }

    async function getData() {
        try {
            let loginid = await AsyncStorage.getItem('UserDocId');
            setUserId(loginid);
            let MyLatitude = await AsyncStorage.getItem('Latitude');
            let MyLongitude = await AsyncStorage.getItem('Longitude');
            setUserLocation({
                latitude: parseFloat(MyLatitude),
                longitude: parseFloat(MyLongitude)
            });
            if (loginid != null) {
                let usertype = await AsyncStorage.getItem('UserType');
                setUserType(usertype);
                // getUsers();
                if (parseInt(usertype) == 1) {
                    getAllUsers()
                }
                if (parseInt(usertype) == 2) {
                    getUsers();
                }
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

    async function signOut() {
        await AsyncStorage.removeItem('UserDocId');
        await AsyncStorage.removeItem('UserType');
        navigation.navigate('Login');
    }

    function onRefresh() {
        setIsFetching(true)
        getUsers()
    }

    return (
        <SafeAreaView>
            <Appbar.Header style={{ backgroundColor: '#1E90FF' }}>
                <Appbar.Content title="Home" />
                <Icon style={{ marginRight: 30 }} name="user" size={25} color="#ffffff" onPress={() => { navigation.navigate('profile', { 'docId': userId, 'userType': usertype }) }} />
                <Appbar.Action icon={() => <AntIcon name="logout" size={20} color="white" />} onPress={signOut} />
            </Appbar.Header>
            {
                loading ?
                    <View style={[styles.container2, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#187bcd" />
                    </View>
                    :
                    users.length > 0 ?
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item.docId}
                            style={{ marginBottom: 50 }}
                            onRefresh={() => onRefresh()}
                            refreshing={isFetching}
                            renderItem={(user) => {
                                return (
                                    <View style={{ margin: 10 }}>
                                        <Card key={user.item.docId}>
                                            <Card.Title title={user.item.Username} />
                                            <Card.Content>
                                                <Paragraph>Contact Number: {user.item.ContactNumber}</Paragraph>
                                                <Paragraph>User Type: {user.item.RoleId == 3 ? 'Donor' : user.item.RoleId == 4 ? 'Receiver' : user.item.RoleId == 2 ? 'Manager' : 'Admin'}</Paragraph>
                                                {
                                                    user.item.RoleId == 3 ?
                                                        <Paragraph>Date Of Birth: {user.item.DateOfBirth.toDate().toDateString()}</Paragraph>
                                                        :
                                                        false
                                                }
                                            </Card.Content>
                                            <Card.Actions>
                                                <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
                                                    <Button mode="contained" style={{ backgroundColor: '#187bcd', margin: 10 }} onPress={() => navigation.navigate('viewlocation', { userLocation: userLocation, latitude: user.item.Location.latitude, longitude: user.item.Location.longitude })}>View Location</Button>
                                                    {
                                                        user.item.IsActive && user.item.IsVerified ?
                                                            <Button mode="contained" disabled={disabled} style={{ backgroundColor: '#187bcd', margin: 10 }} onPress={() => EnableDisableUser(user.item.docId, false)}>Disable</Button>
                                                            :
                                                            !user.item.IsActive && user.item.IsVerified ?
                                                                <Button mode="contained" disabled={disabled} style={{ backgroundColor: '#187bcd', margin: 10 }} onPress={() => EnableDisableUser(user.item.docId, true)}>Enable</Button>
                                                                :
                                                                <Button mode="contained" disabled={disabled} style={{ backgroundColor: '#187bcd', margin: 10 }} onPress={() => VerifyUser(user.item.docId)}>Verify</Button>
                                                    }
                                                </View>
                                            </Card.Actions>
                                        </Card>
                                    </View>
                                )
                            }}
                        />
                        :
                        <Text style={{ alignSelf: 'center', fontSize: 20, marginTop: 250 }}>No Content to display</Text>

            }
        </SafeAreaView>
    )
};

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

export default ManagerAdmin;