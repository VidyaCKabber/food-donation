import React, { Component } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, FlatList, Modal, Dimensions, StatusBar } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { Button, IconButton, withTheme, Appbar } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import db from '../Database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/AntDesign';
import ImagePicker from 'react-native-image-picker';

const deviceHeight = Dimensions.get('window').height;
const statusBarHeight = StatusBar.currentHeight;
const deviceWidth = Dimensions.get('window').width;
const marginSide = deviceWidth / 50;
const maxHeight = deviceHeight - (statusBarHeight * 2);
const height = (maxHeight) / 12;
const height2 = (maxHeight) / 11;
const buttonStyleIcon = (maxHeight) / 14;

class Camera extends Component {
    state = {
        image: null,
        pickedData: '',
        itemimages: [],
        itemimagesUri: [],
        isCamera: false,
        ModalVisibleStatus: false,
        imageuri: '',
        counter: 1,
        loginid: 'f7TYKjDfIAKGLZ6socaj',
        disabled: false,
        unsaved: false,
        request_id: 0,
        requested_datetime: ''
    }

    //function to take pictures
    takePicture = async () => {
        const { itemimages, itemimagesUri } = this.state;
        if (this.camera) {
            const options = { quality: 0.5, base64: true };
            const data = await this.camera.takePictureAsync(options);
            var newStateArray = itemimages.slice();
            var newStateArr = itemimagesUri.slice();
            newStateArray.push(data.base64);
            newStateArr.push(data.uri);
            console.log(data.uri)

            AsyncStorage.setItem('imgUri',data.uri);
            
            this.setState({
                pickedData: data,
                isCamera: false,
                itemimages: newStateArray,
                itemimagesUri: newStateArr,
                unsaved: true
            })
        } else {
            console.log("something wrong 1")
        }
    };

    selectFile = () => {
        const { itemimages, itemimagesUri } = this.state;
        const options = {
            quality: 0.5,
            title: 'Select Image From Gallery',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        try {
            ImagePicker.launchImageLibrary(options, res => {
                if (res.didCancel) {
                    console.log('User cancelled image picker');
                } else if (res.error) {
                    console.log('ImagePicker Error: ', res.error);
                } else if (res.customButton) {
                    console.log('User tapped custom button: ', res.customButton);
                    alert(res.customButton);
                } else {
                    let source = res;
                    var newStateArray = itemimages.slice();
                    var newStateArr = itemimagesUri.slice();
                    newStateArray.push(source.data);
                    newStateArr.push(source.uri);
                    this.setState({
                        pickedData: source,
                        isCamera: false,
                        itemimages: newStateArray,
                        itemimagesUri: newStateArr,
                        unsaved: true
                    })
                }
            });
        } catch (e) {
            console.log(e);
        }
    };

    //function to navigate back to previous screen
    _back = () => {
        const { unsaved } = this.state;
        if (unsaved == true) {
            this.updateData();
            this.props.navigation.goBack();
        } else {
            this.props.navigation.goBack();
        }
    }

    //function to give alert if the images are empty
    Alerting = () => {
        const { itemimages } = this.state;
        if (itemimages.length > 0) {
            if (itemimages.length == 0) {
                Alert.alert(
                    "Alert",
                    "Images are not added, Are you sure you want to save?",
                    [
                        {
                            text: "Cancel",
                            onPress: () => console.log("Cancel Pressed"),
                            style: "cancel"
                        },
                        { text: "OK", onPress: () => this.checkType() }
                    ],
                    { cancelable: false }
                );
            }
        } else {
            Alert.alert("No images added to save");
        }
    }

    //function to get image_details counter
    getCounter = () => {
        try {
            const query = "SELECT MAX(ID) as ID FROM image_details;"
            db.transaction(tx => {
                tx.executeSql(query, [], (tx, results) => {
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < len; i++) {
                            var row = results.rows.item(i);
                            let count = 0;
                            if (row.ID == null) {
                                count++;
                            } else {
                                count = parseInt(row.ID) + 1;
                            }
                            this.setState({
                                counter: count
                            })
                        }
                    }
                });
            });
        } catch (e) {
            console.log(e);
        }
    }

    //function to check image type to capture
    update = () => {
        this.setState({
            isCamera: true,
        })
    }

    //function to delete images of a drafted bill
    deleteImage = () => {
        let imageuri = this.state.imageuri;
        let images = this.state.itemimagesUri;
        let base64images = this.state.itemimages;
        this.state.itemimagesUri.map((item, key) => {
            if (item == imageuri) {
                images.splice(key, 1);
                base64images.splice(key, 1);
            }
        })
        this.setState({
            itemimagesUri: images,
            itemimages: base64images,
            ModalVisibleStatus: false,
            unsaved: true
        })
    }

    //function to update images to local bill
    updateData = async () => {
        const { itemimages, itemimagesUri, counter, loginid, request_id, requested_datetime } = this.state;
        try {
            if (itemimages.length > 0) {
                this.setState({
                    disabled: true
                })
                let count = counter;
                var today = new Date();
                var currentTime = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
                if (itemimages.length > 0 && request_id !== '') {
                    let imagecount = 0;
                    itemimages.map((item, key) => {
                        const file_name = loginid + '_' + currentTime.toString() + (key + 1).toString() + '.png';
                        const clearData = `DELETE FROM image_details WHERE request_id='${request_id}'`;
                        db.transaction(tx => {
                            tx.executeSql(clearData, [], (tx, results) => {
                                var len = results.rows.length;
                                if (len == 0) {
                                    const query = `INSERT INTO image_details (ID, userid, request_id, requested_datetime,fileid, filename, fileuri, file, uploaded_datetime) VALUES 
                                    (${parseInt(count)},'${loginid}',${parseInt(request_id)},'${requested_datetime}','','${file_name}','${itemimagesUri[key]}','${item}','${currentTime}');`;
                                    db.transaction(tx => {
                                        tx.executeSql(query);
                                    });
                                    count++;
                                }
                            })
                        })
                        imagecount++;
                        if(imagecount == itemimages.length){
                            this.setState({
                                counter: count,
                                disabled: false,
                                unsaved: false
                            })
                        }
                    })
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    //function to get images of a bill from local database
    getImages = async (request_id) => {
        try {
            const squery = `SELECT * FROM image_details WHERE request_id='${request_id}';`;
            db.transaction(tx => {
                tx.executeSql(squery, [], (tx, results) => {
                    var len = results.rows.length;
                    if (len > 0) {
                        let count = 0;
                        let itemimages = [];
                        let itemimagesUri = [];
                        for (let i = 0; i < len; i++) {
                            var row = results.rows.item(i);
                            itemimages.push(row.file);
                            itemimagesUri.push(row.fileuri);
                            count++;
                        }
                        if (count == len) {
                            this.setState({
                                itemimages: itemimages,
                                itemimagesUri: itemimagesUri
                            })
                        }
                    } else {
                        console.log("No images found");
                    }
                })
            });
        } catch (e) {
            console.log(e);
        }
    }

    getLoginID = async () => {
        // let loginid = await AsyncStorage.getItem("@loginid");
        // this.setState({
        //     loginid: loginid
        // })
    }
    
    //function to handle device back button
    handleBackButton = () => {
        this._back();
        return true;
    }

    //first function to execute
    componentDidMount() {
        const { navigation, route } = this.props
        const { request_id, requested_datetime}  = route.params;
        this.setState({
            request_id: JSON.stringify(request_id),
            requested_datetime: JSON.stringify(requested_datetime)
        })
        this.getImages(request_id);
        this.getCounter();
        this.getLoginID();
    }

    ShowModalFunction(visible, imageURL) {
        this.setState({
            ModalVisibleStatus: visible,
            imageuri: imageURL,
        });
    }

    render() {
        const { isCamera, ModalVisibleStatus, itemimagesUri, imageuri } = this.state;
        if (ModalVisibleStatus) {
            return (
                <Modal
                    transparent={true}
                    animationType={'fade'}
                    visible={ModalVisibleStatus}
                    onRequestClose={() => {
                        this.ShowModalFunction(!ModalVisibleStatus, '', '');
                    }}
                >
                    <View style={styles.modelStyle}>
                        <FastImage
                            style={styles.fullImageStyle}
                            source={{ uri: imageuri }}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                        <View style={{ flexDirection: 'row' }}>
                            <Button style={styles.containerStyle3}
                                contentStyle={styles.buttonStyle} mode="contained" onPress={() => { this.deleteImage() }}>
                                Delete
                            </Button>
                            <Button style={styles.containerStyle3}
                                contentStyle={styles.buttonStyle} mode="contained"
                                onPress={() => this.ShowModalFunction(!ModalVisibleStatus, '')}>
                                Close
                            </Button>
                        </View>
                    </View>
                </Modal>
            );
        } else {
            return (
                <>
                    <View style={{ flex: 1 }}>
                        <Appbar.Header style={{ height: statusBarHeight * 2, backgroundColor: '#187bcd' }}>
                            <Appbar.BackAction onPress={this._back} />
                            <Appbar.Content title="Add Images" />
                            {/* <Appbar.Action icon={() => (<Icon2 name="images" color="#ffffff" size={20} />)} onPress={() => this.selectFile()} /> */}
                        </Appbar.Header>
                        {isCamera ? (
                            <View style={styles.container}>
                                <RNCamera
                                    ref={ref => {
                                        this.camera = ref;
                                    }}
                                    style={styles.preview}
                                    type={RNCamera.Constants.Type.back}
                                    flashMode={RNCamera.Constants.FlashMode.on}
                                    androidCameraPermissionOptions={{
                                        title: 'Permission to use camera',
                                        message: 'We need your permission to use your camera',
                                        buttonPositive: 'Ok',
                                        buttonNegative: 'Cancel',
                                    }}
                                    captureAudio={false}
                                />
                                <Button
                                    mode="contained"
                                    buttonStyle={{ margin: marginSide }}
                                    onPress={() => this.takePicture()}
                                    style={styles.containerStyle}
                                    contentStyle={styles.buttonStyle}
                                >
                                    Capture
                                </Button>
                            </View>
                        ) : (
                            <View style={{ alignContent: 'center', marginTop: marginSide, marginLeft: marginSide, marginRight: marginSide }}>
                                <View style={{ alignContent: 'center' }}>

                                    <View style={{ height: maxHeight / 1.3 }}>
                                        {
                                            itemimagesUri && itemimagesUri.length > 0 ?
                                                <View>
                                                    <FlatList
                                                        data={itemimagesUri}
                                                        renderItem={({ item, index }) => (
                                                            <View style={{ flex: 1, flexDirection: 'column', margin: 1 }}>
                                                                <TouchableOpacity
                                                                    key={item.id}
                                                                    style={{ flex: 1 }}
                                                                    onPress={() => {
                                                                        this.ShowModalFunction(true, item);
                                                                    }}>
                                                                    <FastImage
                                                                        style={styles.image}
                                                                        source={{
                                                                            uri: item,
                                                                        }}
                                                                    />
                                                                </TouchableOpacity>
                                                            </View>
                                                        )}
                                                        numColumns={3}
                                                        keyExtractor={(item, index) => index.toString()}
                                                    />
                                                </View>
                                                :
                                                false
                                        }
                                    </View>
                                    <IconButton
                                        icon={() => (<Icon name="plus" color="#ffffff" size={25} />)}
                                        size={buttonStyleIcon}
                                        style={{
                                            backgroundColor: '#187bcd',
                                            marginTop: maxHeight / 1.25,
                                            alignSelf: 'center',
                                            justifyContent: "center",
                                            alignItems: 'center',
                                            position: "absolute",
                                        }}
                                        onPress={() => this.update()}
                                    />
                                </View>
                            </View>
                        )
                        }
                    </View >
                </>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    image: {
        height: 100,
        width: '100%',
    },
    fullImageStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '80%',
        width: '80%',
        resizeMode: 'contain',
    },
    modelStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonStyle: {
        height: height,
    },
    buttonStyleEdit: {
        height: height2,
    },
    containerStyle: {
        width: '100%',
        backgroundColor: '#187bcd'
    },
    containerStyle2: {
        width: '100%',
        marginTop: marginSide
    },
    containerStyle3: {
        width: '45%',
        margin: marginSide,
        backgroundColor: '#187bcd'
    },
    containerStyle3: {
        width: '45%',
        margin: marginSide,
        backgroundColor: '#187bcd'
    },
});

export default withTheme(Camera);
