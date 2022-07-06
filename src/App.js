import React, { Component } from 'react';
// import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import Geolocation from 'react-native-geolocation-service';
import {
  withGoogleMap,
  Marker,
  GoogleMap,
  DirectionsRenderer,
  LoadScript, 
  DirectionsService
} from '@react-google-maps/api';

const containerStyle = {
  width: '400px',
  height: '400px'
};

// const google = window.google;

class App extends Component {
  constructor(props) {
    super(props);
		this.state = {
      center: {lat: 0, lng:0},
      latitude: 0,
      longitude: 0,
      data: {},
      walks: [],
      directionsArray: []
		};
	}
  componentDidMount() {
		navigator.geolocation.getCurrentPosition(
			position => {
				this.setState({ latitude: position.coords.latitude });
				this.setState({ longitude: position.coords.longitude });
        this.setState({ center: {lat:parseFloat(position.coords.latitude), lng:parseFloat(position.coords.longitude)}});
			},
			error => {
				window.alert('Error Code = ' + error.code + ' - ' + error.message);
			}
		);
	}

  render() {
    const makePaths = async (result) => {
      var paths = [];
      var directionsArr = [];
      for (var i = 0; i < 10;i++) {
        var path = {lat: parseFloat(result.features[0].geometry.coordinates[0][0][i][1]), lng: parseFloat(result.features[0].geometry.coordinates[0][0][i][0])};
        paths.push(path);
        var direction = await getDirections(path);
        directionsArr.push(direction);
      }
      this.setState({data: result, walks: paths, directionsArray: directionsArr});
    }

    const getDirections = async (location) => {
      return new Promise((resolve, reject) => {
        const directionsService = new window.google.maps.DirectionsService();
  
        const origin = this.state.center;
        const destination = location;
      
        if (origin !== null && destination !== null) {
          directionsService.route(
            {
              origin: origin,
              destination: destination,
              travelMode: window.google.maps.TravelMode.WALKING
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                resolve(result);
              } else {
                reject(`error fetching directions ${result}`);
              }
            }
          );
        } else {
          reject('Please mark your destination in the map first!');
        }
      })
    };
  

    const getWalks = () => {
      // var url = `https://api.geoapify.com/v1/isoline?lat=${this.state.latitude}&lon=${this.state.longitude}&type=time&mode=walk&range=300apiKey=b0acd933137644ac9718782accd6d543`;
      var requestOptions = {
        method: 'GET',
      };

      var url = `https://api.geoapify.com/v1/isoline?lat=${this.state.latitude}&lon=${this.state.longitude}&type=time&mode=walk&range=300&apiKey=b0acd933137644ac9718782accd6d543`;

      fetch(url, requestOptions)
        .then(response => {
          return response.json()
        })
        .then(result => {
          makePaths(result)          
        })
        .catch(error => {
          console.log('error', error)
        });
      }
    return (
      <LoadScript
        googleMapsApiKey="AIzaSyDPw_mJoO62DvnmGVIR6Thfi46pAJS5eSA"
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={this.state.center}
          zoom={10}
        >
         
          {
            this.state.directionsArray.map((directions, index) => (
              <DirectionsRenderer key={index} directions={directions} />
            ))
          }
          <></>
        </GoogleMap>
        <div>
						<button onClick={getWalks}>Get Walks</button>
				</div>
      </LoadScript>
    )
  }
}

export default App;