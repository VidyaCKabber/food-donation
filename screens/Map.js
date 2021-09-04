import React from "react";
import { View, PermissionsAndroid } from "react-native";
import MapView from 'react-native-maps';
import { Button } from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Map extends React.Component {
    state = {
        markerData: {
            latitude: 0,
            longitude: 0,
        },
        mapData: {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
        },
        latitude: 0,
        longitude: 0,
        loading: true
    };

    setLoader = () => {
        this.setState({
            loading: false
        })
    }

    requestLocationPermission = async () => {
        try {
            let granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                Geolocation.getCurrentPosition((position) => {
                    this.setState({
                        markerData: {
                            latitude: parseFloat(position.coords.latitude),
                            longitude: parseFloat(position.coords.longitude)
                        },
                        mapData: {
                            latitude: parseFloat(position.coords.latitude),
                            longitude: parseFloat(position.coords.longitude),
                            latitudeDelta: 0.015,
                            longitudeDelta: 0.0121,
                        }
                    });
                    this.setLoader();
                },
                    (error) => {
                        console.log(error.code, error.message);
                    },
                    { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
                );
            } else {
                console.log('Location permission not granted!!!!');
            }
        } catch (e) {
            console.log(e);
        }
    };

    componentDidMount() {
        this.setState({
            loading: true
        })
        this.requestLocationPermission();
    }

    handleRegionChange = mapData => {
        this.setState({
            markerData: { latitude: mapData.latitude, longitude: mapData.longitude },
            mapData,
        });
    };

    submitLocation = async () => {
        try {
            let data = this.state.mapData;
            await AsyncStorage.setItem("@latitude", data.latitude.toString());
            await AsyncStorage.setItem("@longitude", data.longitude.toString());
            this.props.route.params.setLocation(data.latitude.toString(), data.longitude.toString())
            this.props.navigation.goBack();
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        if (this.state.loading) {
            return (
                <View>
                </View>
            );
        } else {
            return (
                <View style={{ flex: 1 }}>
                    <MapView
                        style={{ flex: 1 }}
                        region={this.state.mapData}
                        onRegionChangeComplete={this.handleRegionChange}
                    >
                        <MapView.Marker
                            coordinate={this.state.markerData}
                            title={"title"}
                            description={"description"}
                        />
                    </MapView>
                    <Button
                        style={{
                            marginBottom: 10,
                            backgroundColor: '#1E90FF'
                        }}
                        mode="contained"
                        onPress={this.submitLocation}
                    >
                        Submit Location
                    </Button>
                </View>
            );
        }

    }
}