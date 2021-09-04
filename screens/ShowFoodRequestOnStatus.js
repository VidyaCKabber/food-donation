import React, { useRef, useState, useEffect } from 'react';
import {
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';


const ShowFoodRequestOnStatus = (usertype,loginid,reqstatus) => {
    
    const [requests, setRequests] = useEffect([]);

    function getRequests(sourcetable, subtable, conditionval) {
       
        try {
            firestore()
                .collection(sourcetable)
                // Status == 1 for pending requests
                .where('Status', '==', Number(reqstatus))
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.size > 0) {
                        querySnapshot.forEach(documentSnapshot => {

                            //Validate the request id declined by the user -> don't not list user declined requests
                            /* 
                                When user decline the request, that is declained to the user and not for others. Therefore, status of request set as pending until due time
                            */
                            if (Number(reqstatus) == 1) {
                                firestore()
                                    .collection(subtable)
                                    .where(conditionval, '==', documentSnapshot.id)
                                    .get().then(query => {
                                        query.forEach(document => {
                                            if (document.data().AccountId == loginid) {
                                                // Status -> 3: The request is declined by the user
                                                if (document.data().Status != 3) {
                                                    const docData = { docId: documentSnapshot.id, ...documentSnapshot.data() };
                                                    setRequests(...requests ,docData);
                                                    console.log("--a--",requests);
                                                }
                                            }
                                        })
                                    })
                            } else {
                                const docData = {docId: documentSnapshot.id, ...documentSnapshot.data()};
                                setRequests(...requests ,docData);
                                console.log("----b-----",requests);
                            }
                        });
                    } else {
                        Alert.alert("No Requests Found");
                    }
                }).catch(error => console.error(error));
        } catch (e) {
            console.log(e);
        }
   }

function listRequestsOnRole() {
        try {
            if (usertype == "3") {
                //sourcetable,subtable,conditionval
                getRequests('FoodRequests', 'FoodRequestStatus', 'RequestId');
            } else if (usertype == "4") {
                //sourcetable,subtable,conditionval
                getRequests('DonationRequests', 'DonationRequestStatus', 'DonationId');
            } else{
                console.log("Something went wrong");
            }

        } catch (e) {
            console.log(e);
        }
    }


useEffect(() => {
    listRequestsOnRole();
},[]);

return (
    requests
    );
};

export default ShowFoodRequestOnStatus;
