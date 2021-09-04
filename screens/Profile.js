import React, { useState, useEffect } from 'react';
import {
    View,
    Alert,
    AppState,
    TouchableOpacity,
    StyleSheet,
    Text,
    Image
} from 'react-native';
import { Button } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Profile = ({ route, navigation }) => {
    const [userDetails, serUserDetails]= useState([]);
    const [loadLocation, setLoadLocation] = useState(false);
    const [userLocation, setUserLocation] = useState({latitude:0,longitude:0});

    async function getUserProfile(userDocId, userType) {

        serUserDetails([]);
        
        var userRole = 'User';
        if(userType == 1){
          userRole = 'Maintainer'
        } else if (userType==2){
          userRole = 'Manager'
        } else if (userType==3){
          userRole = 'Donar'
        } else {
          userRole = 'Receiver'
        }

        try {
            firestore()
                .collection('Accounts')
                .doc(userDocId)
                .onSnapshot(documentSnapshot => {
                    var userDoc = documentSnapshot.data();
                    var roleid = documentSnapshot.data().RoleId;
                    console.log("----------roleid---------------",roleid);
                    if(roleid != 4){
                        var dob = documentSnapshot.data().DateOfBirth.toDate().toDateString();
                        console.log("userDoc",dob);
                        userDoc["DateOfBirth"] = dob;
                    }
                    userDoc["RoleId"] = "I'm "+ userRole;
                    userDoc["ContactNumber"] = "+91 "+userDoc.ContactNumber;
                    serUserDetails(userDetails => [...userDetails, userDoc]); 
                    setLoadLocation(false);
                    getLocation();
                    setLoadLocation(true);
                });
        } catch (e) {
        console.log(e);
        }
    }

  async function getLocation(){
        let MyLatitude = await AsyncStorage.getItem('Latitude');
        let MyLongitude = await AsyncStorage.getItem('Longitude');

        setLoadLocation(false);
        for (let i = 1; i <= 15; i++) {
            setTimeout(() => console.log(`#${i}`), 1000);
        }
        setUserLocation({
          latitude : parseFloat(MyLatitude),
          longitude : parseFloat(MyLongitude)
        });
        setLoadLocation(true);
        console.log("myLocation",userLocation);
  }
  
  useEffect(() =>{
      const {docId,userType}  = route.params;
      getUserProfile(docId,userType);
    },[])

    return (
          userDetails.map(user => (
            <View style={styles.container}>
            <View style={styles.header}>
            <View style={styles.headerContent}>
                <Image style={styles.avatar}
                  source={{uri: 'https://bootdey.com/img/Content/avatar/avatar6.png'}}/>
                <Text style={styles.name}>{user.Username}</Text>
                <Text style={styles.userInfo}>{user.RoleId}</Text>
            </View>
          </View>
          <View style={styles.body}>
            <View style={styles.item}>
              <View style={styles.iconContent}>
                <Image style={styles.icon} source={{uri: 'https://img.icons8.com/color/70/000000/phone.png'}}/>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.info}>{user.ContactNumber}</Text>
              </View>
            </View>
            {user.DateOfBirth?
              <View style={styles.item}>
                <View style={styles.iconContent}>
                  <Image style={styles.icon} source={{uri: 'https://img.icons8.com/color/70/000000/birthday.png'}}/>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.info}>{user.DateOfBirth}</Text>
                </View>
            </View>
              :
              null
            }
            <View style={styles.item}>
              <View style={styles.iconContent}>
                <Image style={styles.icon} source={{uri: 'https://img.icons8.com/color/70/000000/map.png'}}/>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.info}>
                  <Button onPress={() => navigation.navigate('viewlocation',{ userLocation : userLocation, latitude: user.Location._latitude, longitude: user.Location._longitude})}>View Location</Button>
                </Text>
              </View>
            </View>
          </View>
      </View>
      ))
    );
  }

const styles = StyleSheet.create({
  header:{
    backgroundColor: "#DCDCDC",
  },
  headerContent:{
    padding:30,
    alignItems: 'center',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom:10,
  },
  name:{
    fontSize:22,
    fontWeight:'600',
  },
  userInfo:{
    fontSize:16,
    fontWeight:'600',
  },
  body:{
    height:500
  },
  item:{
    flexDirection : 'row',
  },
  infoContent:{
    flex:1,
    alignItems:'flex-start',
    paddingLeft:5,
   
  },
  iconContent:{
    alignItems:'flex-start',
    paddingRight:5,
    marginLeft:20
  },
  icon:{
    width:30,
    height:30,
    marginTop:20,
  },
  info:{
    fontSize:18,
    marginTop:20
  }
});
                                    
export default Profile;

