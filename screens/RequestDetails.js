import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
} from 'react-native';
import { Card, ListItem, Paragraph, Button } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';


var loadImgPath = "https://firebasestorage.googleapis.com/v0/b/fooddonation-bc0e3.appspot.com/o/";
const RequestDetails = ({ route, navigation }) => {
    const [requests, setDetails]= useState([]);
    const [loadLocation, setLoadLocation] = useState(false);
    const [userLocation, setUserLocation] = useState({latitude:0,longitude:0});

    async function getRequestDetails(userDocId,tableName) {
        let MyLatitude = await AsyncStorage.getItem('Latitude');
        let MyLongitude = await AsyncStorage.getItem('Longitude');

        setLoadLocation(false);
        for (let i = 1; i <= 5; i++) {
            setTimeout(() => console.log(`#${i}`), 1000);
        }
        setUserLocation({
            latitude : parseFloat(MyLatitude),
            longitude : parseFloat(MyLongitude)
        });
        setLoadLocation(true);
        console.log("Location in RequestDetatils",userLocation);

        setDetails([]);
        try {
            firestore()
                .collection(tableName)
                .doc(userDocId)
                .onSnapshot(documentSnapshot => {
                    var data = documentSnapshot.data();
                    var CreatedOn = data.CreatedOn.toDate().toDateString();
                    console.log("documentSnapshot",documentSnapshot.data());
                    var DueOn = data.DueOn.toDate().toDateString();
                    data["CreatedOn"] = CreatedOn;
                    data["DueOn"] = DueOn;
                    let status = 'Pending';
                      if (data["Status"] == 1) {
                        status = 'Pending';
                      } else if (data["Status"] == 2) {
                        status = 'Accepted';
                      } else if (data["Status"] == 3) {
                        status = 'Declined';
                      } else {
                        status = 'Fulfilled';
                      }
                    if(documentSnapshot.data().RequesterId){
                        data["Image"] = documentSnapshot.data().Image;
                    } else {
                        data["Image"] = documentSnapshot.data().Image[0];
                    }
                    data["Status"] = status;

                    let requester = 'Requested By';
                    if(data.RequesterId){
                        requester = 'Donated By';
                    }
                    let updatedDocData = Object.assign(data, {'docId':userDocId},{'requester':requester});
                    setDetails(requests => [...requests, updatedDocData]);
                });
        } catch (e) {
        console.log(e);
        }
    }
    useEffect(() =>{
        const { docId,tableName }  = route.params;
        getRequestDetails(docId,tableName);
    },[])
    return (
      requests.map(req => (
        <Card key= {req.index}>
            <Card.Title title={req.FoodName}/>
            <Card.Cover  source={{ uri: loadImgPath+req.Image+'?alt=media'}} />
            <Card.Content>
                <Paragraph>{}</Paragraph>
            </Card.Content>
            <Card.Content>
                <Paragraph>{req.Description}</Paragraph>
            </Card.Content>
            <Card.Content>
                <Paragraph></Paragraph>
            </Card.Content>
            <Card.Content>
                <Paragraph>Food Type : {req.FoodType}</Paragraph>
            </Card.Content>
            <Card.Content>
                <Paragraph>Quantity : {req.Quantity}</Paragraph>
            </Card.Content>
            <Card.Content>
                <Paragraph>Requested On : {req.CreatedOn}</Paragraph>
            </Card.Content>
            <Card.Content>
                <Paragraph>Due On : {req.DueOn}</Paragraph>
            </Card.Content>
            <Card.Content>
                <Paragraph>Status : {req.Status}</Paragraph>
            </Card.Content>
            <Card.Actions>
                <Button onPress={() => navigation.navigate('viewlocation', {userLocation : userLocation, latitude: req.Location.Latitude, longitude: req.Location.Longitude })}>View Location</Button>
                { req.RequesterId ?
                    false :
                    <Button onPress={() => navigation.navigate('viewimages', {'docId':req.docId})}>View Images</Button>
                }
                {req.Status == 'Pending'?
                    false
                    :
                  <Button onPress={() => navigation.navigate("profile", {docId: req.ReqSeveredBy, userType: 4 })}>Requester</Button>
                }
            </Card.Actions>
        </Card>
      ))    
    )
}
export default RequestDetails;
