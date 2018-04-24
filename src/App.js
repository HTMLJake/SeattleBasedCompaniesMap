import React, { Component } from 'react';
import './App.css';
import Sidebar from "./sidebar.js"

var google = window.google;
var infowindow = new window.google.maps.InfoWindow();


class App extends Component {
  state = {
    locations: [],
    markers: [],
    map: {},
    filter: "all",
    sidebar: " ",
    prevSelection: "",
    sidebarList: []
  }

  componentDidMount() {
    if(google) {
      this.initMap();
    }
  }

  initMap = () => {
    var bounds = new google.maps.LatLngBounds();
    this.setState({
        map: new google.maps.Map(document.getElementById('map'), {
          center: {lat:47.649297, lng:-122.351629},
          zoom: 11
      })
    });
    fetch('./locations.json').then((response) => {
        return response.json();
    }).then((json) => {
      this.setState({
        locations: json
      })
        for (let i = 0; i < this.state.locations.length; i++) {
            const marker = this.state.locations[i];
            var m = new google.maps.Marker({
                position: marker.pos,
                title: marker.name,
                map: this.state.map,
                animation: google.maps.Animation.DROP
            })
            bounds.extend(m.position);
            this.pushMarker(m,i);
        } 
    }).then(() => {
        this.state.map.fitBounds(bounds);
        this.fillSidebar(this.state.filter);
    })
  }


  pushMarker = (marker, index) => {
    var tempArray = this.state.markers;
    tempArray.push(marker);
    this.setState({
      markers: tempArray
    })
    
    let _this = this;
    
    marker.addListener('click' , function() {
      //populateInfoWindow(this, infoWindow);
      _this.showInfoWindow(marker, index);
    })
  }
  
  showInfoWindow = (marker, i) => {
    let googleMap = this.state.map;
    if (infowindow.marker !== marker) {
      infowindow.marker = marker;
      this.FetchAPI(this.state.locations[i]);
      infowindow.open(googleMap, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
      });  
    }
  }

  toggleSidebar = () => {
    if(this.state.sidebar === " ") {
      this.setState({
        sidebar: " open"
      })
    } else {
      this.setState({
        sidebar: " "
      })
    }
  }

  handleChange = (event) => {
    this.setState({
      filter: event.target.value
    });
    this.fillSidebar(event.target.value);
  }

  SidebarSelection = (input) => {
    let prevSelection = this.state.prevSelection
    let item = input.currentTarget;

    if(prevSelection) {
        if(prevSelection === item) {
            item.classList.toggle("selected");
            prevSelection = undefined;
            infowindow.setMarker = null;
            infowindow.close();
            this.ShowSelectedListings(input.currentTarget.parentNode.childNodes);
        } else {
            prevSelection.classList.toggle("selected");
            item.classList.toggle("selected");
            prevSelection = item;
            this.ShowSelectedListings(item);
        }
    } else {
        item.classList.toggle("selected");
        prevSelection = item;
        this.ShowSelectedListings(item);
    }  

    this.setState({
      prevSelection: prevSelection
    });
}

  getMarkerIndex = (elem) => {
    let index = 0;
    for (let i = 0; i < this.state.markers.length; i++) {
        const m = this.state.locations[i];
        if (elem.textContent && elem.textContent === m.name) {
            index = i;
        } else if(elem.name === m.name) {
          index = i;
        }
    }
    return index;
}

ShowSelectedListings = (item) => {

  let gMap = this.state.map;
  var _Bounds = new google.maps.LatLngBounds();
  //Set all markers map to none
  for (let i = 0; i < this.state.markers.length; i++) {
    this.state.markers[i].setMap(null);
  }

  //then only set the selected markers maps
  if (item.length > 0) {
    for (let i = 0; i < item.length; i++) {
      let mIndex = this.getMarkerIndex(item[i]);
      this.state.markers[mIndex].setMap(gMap);
      _Bounds.extend(this.state.markers[mIndex].position);
      gMap.fitBounds(_Bounds);
    }
  } else {
    let mIndex = this.getMarkerIndex(item);
    let _marker = this.state.markers[mIndex];
    _marker.setMap(gMap);
    _Bounds.extend(_marker.position);
    this.showInfoWindow(_marker, mIndex);
    gMap.fitBounds(_Bounds);
    gMap.setZoom(12);
  }
}


  fillSidebar = (filter) => {
    let newList;
    if(filter === "all") {
      newList = this.state.locations;
    } else {
      newList = this.state.locations.filter(loc => {return loc.tags.includes(filter)});
    }

    this.ShowSelectedListings(newList);

    this.setState({
      sidebarList: newList
    })
  }

  FetchAPI = (location) => {
    infowindow.setContent(
      `<h2>${location.name}</h2>
      <p>
      ${location.tags.map(tag => `<span> ${tag}</span>`)}
      </p>
      `)

    fetch(`https://api.foursquare.com/v2/venues/search?ll=${location.pos.lat.toFixed(2)},${this.state.locations[0].pos.lng.toFixed(2)}&client_id=XFCQCFTGSRV30JUYFS5OZYMXCVJ3DS1K20QR3FDC1K5YFZDY%20&client_secret=%203CFG54PJ4XKFL1DC5CLCKYMO5EK131OPTQSIMGPER53CZ2TO&v=20180423&query=${location.name}`)
      .then(response => {
        this.apiFetchImgs(response.json(), location);
      }).catch(err => {
        infowindow.setContent(
          `<h2>${location.name}</h2>
          <p>Couldn't retrieve image</p>
          <p>
            ${location.tags.map(tag => `<span>${tag}</span>`)}
          </p>
          `)
      })
  }

  apiFetchImgs = (api, location) => {
    api.then((response) => {
      fetch(`https://api.foursquare.com/v2/venues/${response.response.venues[0].id}/photos?client_id=XFCQCFTGSRV30JUYFS5OZYMXCVJ3DS1K20QR3FDC1K5YFZDY%20&client_secret=%203CFG54PJ4XKFL1DC5CLCKYMO5EK131OPTQSIMGPER53CZ2TO&v=20180423`)
      .then(response => {
        return response.json();
      }).then(json => {
        let img = json.response.photos.items[0];
        let size = 125;
        infowindow.setContent(
          `<h2>${location.name}</h2>
          <img src=${img.prefix + size + img.suffix} alt=${location.name}/>
          <p>
            ${location.tags.map(tag => `<span>${tag}</span>`)}
          </p>
          `)
      })
    })
  }



  render() {
    return (
      <section>
        <div id="hamburger" className={"hamburger" + this.state.sidebar} onClick={this.toggleSidebar}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
        </div>
        <Sidebar 
          SidebarSelection={this.SidebarSelection}
          handleChange={this.handleChange}
          sidebarList={this.state.sidebarList}
          sidebar={this.state.sidebar}
          fiter={this.state.filter}

        />
        <div className="main" onClick={() => {}}>
            <div className="title"><h1 className="header-title">Seattle Based Companies</h1></div>
            <div id="map" className="map">Cannot access Google Map</div>
        </div>
      </section>
    );
  }
}

export default App;
