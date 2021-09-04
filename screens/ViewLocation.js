import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Dimensions
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewLocation = ({ route, navigation }) => {
  const { userLocation, latitude, longitude }  = route.params;

    const [coordinates] = useState([
    {
      latitude:  parseFloat(userLocation.latitude),
      longitude: parseFloat(userLocation.longitude),
    },
    {
      latitude: parseFloat(route.params.latitude),
      longitude: parseFloat(route.params.longitude),
    },
  ]);
  const [loading,setLoding] = useState(false);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.maps}
        initialRegion={{
          latitude: coordinates[0].latitude, 
          longitude: coordinates[0].longitude,
          latitudeDelta: 0.0622,
          longitudeDelta: 0.0121,
        }}>
        <Marker coordinate={coordinates[0]} pinColor={'blue'} title="You"/>
        <Marker coordinate={coordinates[1]} title="Requester" />
        <Polyline
          coordinates={coordinates}
          strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
          strokeColors={['#7F0000']}
          strokeWidth={5}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  maps: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
});

export default ViewLocation; 