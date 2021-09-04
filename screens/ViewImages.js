import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Modal, TouchableOpacity, Alert, Text, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import { Button, Title } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';


const deviceHeight = Dimensions.get('window').height;
const statusBarHeight = StatusBar.currentHeight;
const maxHeight = deviceHeight - (statusBarHeight * 2);
const height = (maxHeight);
const height2 = (maxHeight) / 7;

var loadImgPath = "https://firebasestorage.googleapis.com/v0/b/fooddonation-bc0e3.appspot.com/o/";

const ViewImages = ({ route, navigation }) => {
    const [fileUrls, setFileUrls] = useState([]);
    const [itemImages, setItemImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageuri, setImageuri] = useState('');
    const [modalVisibleStatus, setModalVisibleStatus] = useState(false);

    const [imgName, setImgName] = useState([]);
    //function to check image download progress
    function _downloadFileProgress(data) {
        console.log(data);
    }

    //function to get fileids
    async function downloadImages() {
        if (fileUrls.length > 0) {
            let itemimages = [];
            let count = 0;
            for (let i = 0; i < fileUrls.length; i++) {
                filename = "test.png"
                itemimages.push(filename)
                var downloadFileOptions = {
                    fromUrl: '',
                    headers: '',
                    toFile: `file:///storage/emulated/0/android/data/com.restaurant/files/${filename}`,
                    // progress: (data) => _downloadFileProgress(data)
                };
                try {
                    if (r.statusCode == "200") {
                        count++;
                        if (count == len) {
                            setItemImages(itemimages);
                            setLoading(false);
                        }
                    }
                } catch {
                    Alert.alert("Network connection required")
                    count++;
                }
            }
        }
    }

    function getImages(userDocId){
        let count = 0;
        try {
            firestore()
                .collection('DonationRequests')
                .doc(userDocId)
                .onSnapshot(documentSnapshot => {
                    var imgs = documentSnapshot.data().Image;
                    var imageContainer = [];
                    for(var key in imgs) {
                       let object = new Object();
                       object[key] = imgs[key];
                       imageContainer.push(object);
                    }
                    setImgName(imageContainer);
                });
        } catch (e) {
            console.log(e);
        }
    }

    //first function to execute when the screen is called
    useEffect(() => {
        const { docId } = route.params;
        var fileurls='';
        getImages(docId);
        setFileUrls(fileurls);
        downloadImages();
    }, []);

    //function to enable and disable the image modal
    function ShowModalFunction(visible, imageURL) {
    console.log("imageURL",imageURL);
        setModalVisibleStatus(visible);
        setImageuri(imageURL);
    }

    if (modalVisibleStatus) {
        return (
            <Modal
                transparent={true}
                animationType={'fade'}
                visible={modalVisibleStatus}
                onRequestClose={() => {
                    ShowModalFunction(false, '');
                }}
            >
                <View style={styles.modelStyle}>
                    <FastImage
                        style={styles.fullImageStyle}
                        source={{ uri: imageuri }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <Button style={styles.containerStyle}
                        contentStyle={styles.buttonStyle} mode="contained"
                        onPress={() => ShowModalFunction(false, '')}>
                        Close
                    </Button>
                </View>
            </Modal>
        );
    } else {
        return (
            <View style={styles.container}>
                {
                    loading ?
                        <View style={[styles.containerIndicator, styles.horizontalIndicator]}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                        :
                        <View>
                            <View style={styles.imagePartitian}>
                                {
                                    imgName && imgName.length > 0 ?
                                        <FlatList
                                            data={imgName}
                                            renderItem={({ item, index }) => (
                                                <View style={{ flex: 1, flexDirection: 'column', margin: 1 }}>
                                                    <TouchableOpacity
                                                        key={item[index]}
                                                        style={{ flex: 1 }}
                                                        onPress={() => {
                                                            ShowModalFunction(true, `${loadImgPath+item[index]+'?alt=media'}`);
                                                        }}>
                                                        <FastImage
                                                            style={styles.image}
                                                            key={index}
                                                            source={{
                                                                uri: loadImgPath+item[index]+'?alt=media',
                                                                // priority: FastImage.priority.normal,
                                                            }}
                                                        // resizeMode={FastImage.resizeMode.contain}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            numColumns={3}
                                            keyExtractor={(item, index) => index.toString()}
                                        />
                                        :
                                        <View style={styles.noImageStyle}>
                                            <Text>No item images to display</Text>
                                        </View>
                                }
                            </View>
                        </View>
               }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    imagePartitian: {
        height: height
    },
    noImageStyle: {
        margin: height2,
        alignContent: 'center'
    },
    image: {
        height: 120,
        width: '100%',
    },
    fullImageStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '90%',
        width: '100%',
        resizeMode: 'contain',
    },
    modelStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerStyle: {
        width: '60%',
        margin: 10,
        backgroundColor: '#187bcd'
    },
    closeButtonStyle: {
        width: 25,
        height: 50,
        position: 'absolute',
    },
    containerIndicator: {
        justifyContent: "center",
        marginTop: 100
    },
    horizontalIndicator: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    heading: {
        textAlign: 'left',
        margin: 20,
        fontSize: 20,
    },
});

export default ViewImages;
