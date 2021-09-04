import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import messaging from '@react-native-firebase/messaging';
import Login from './screens/Login';
import Signup from './screens/Signup';
import ForgotPassword from './screens/ForgotPassword';
import Donate from './screens/DonationRequest';
import Request from './screens/FoodRequest';
import Camera from './screens/Camera';
import Map from './screens/Map';
import RequestDetails from './screens/RequestDetails';
import HomeRoute from './screens/HomeRoute';
import HomeRoute2 from './screens/HomeRoute2';
import ViewLocation from './screens/ViewLocation';
import ViewImages from './screens/ViewImages';
import Profile from './screens/Profile';
import ManagerAdmin from './screens/ManagerAdmin';
import Initial from './screens/Initial';

const Stack = createStackNavigator();

function App() {
  useEffect(() => {
    // LogBox.ignoreLogs(['warning....']);
    LogBox.ignoreAllLogs();//Ignore all log notifications
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);


  return (
    <PaperProvider theme={DefaultTheme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="initial" component={Initial}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home" component={HomeRoute}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home2" component={HomeRoute2}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="manageradmin" component={ManagerAdmin}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login" component={Login}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen name="Signup" component={Signup}
            options={{
              title: 'Signup',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword}
            options={{
              title: 'Forgot Password',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen name="Donate" component={Donate}
            options={{
              title: 'Donate Food',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen name="Request" component={Request}
            options={{
              title: 'Request Food',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen name="Camera" component={Camera}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Map" component={Map}
            options={{
              title: 'Select Location',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen name="details" component={RequestDetails}
            options={{
              title: 'Request Details',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen name="viewlocation" component={ViewLocation}
            options={{
              title: 'Location',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen name="viewimages" component={ViewImages}
            options={{
              title: 'Images',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen name="profile" component={Profile}
            options={{
              title: 'Profile',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
