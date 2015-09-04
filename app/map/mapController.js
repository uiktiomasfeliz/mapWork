'use strict';

angular.module('GecorCiudadano.map', ['ngRoute','uiGmapgoogle-maps','oc.lazyLoad'])
.config(['$routeProvider', '$locationProvider', 'uiGmapGoogleMapApiProvider', '$ocLazyLoadProvider', function($routeProvider, $locationProvider, uiGmapGoogleMapApiProvider, $ocLazyLoadProvider) {
  uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20',
        libraries: 'weather,geometry,visualization,places'
    });

  $ocLazyLoadProvider.config({
    debug: false
  });
  $routeProvider.when('/app', {
    //templateUrl: 'map/map.html',
    templateUrl: 'app/map/map.html',//HTML5Mode app/
    controller: 'mapController',
    resolve: {
      loadMyPlugins: ['$ocLazyLoad', function($ocLazyLoad) {
      // you can lazy load files for an existing module
             return $ocLazyLoad.load([
                {
                  name: 'ui.bootstrap',
                  files: ['app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js']
                },
                {
                  files: ['app/bower_components/CryptoJS/rollups/sha1.js','app/bower_components/CryptoJS/components/core-min.js','app/bower_components/CryptoJS/components/enc-base64-min.js']
                }
             ]);
        }
      ]
    }
  });
}])
.run(['$templateCache', function ($templateCache) {
  $templateCache.put('searchbox.tpl.html', '<input id="pac-input" class="controls" type="text" placeholder="Search Box">');
  $templateCache.put('window.tpl.html', '<div ng-controller="WindowCtrl" ng-init="showPlaceDetails(parameter)">{{place.name}}</div>');
}])
//directive
.directive('movingAside', function($window) {
  return {
      scope: {
        valor: '=',
      },
      link : function(scope, element, attr) {
        //start with false..
        /* RIGHT VERSION
        function check(flag){
          if(flag){
            element.css('width', 300 + 'px' );
            element.css('right', 0 + 'px' );
          }else{
            element.css('width', 0 );
            element.css('right', ((element[0].clientWidth * -1)+30) + 'px' );
          }
        }
        */
        /* LEFT VERSION */
        function check(flag){
          if(flag){
            //element.css('width', 300 + 'px' );
            element.css('left', 0 + 'px' );
          }else{
            element.css('left', (element[0].clientWidth * -1));
            //element.css('width', 0 );
          }
        }
        scope.$watch('valor', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            // You actions here
            //console.log("I got the new value! ", newValue);
            check(newValue);
          }else{
            check(oldValue);
          }
        }, true);
    }
  }
})
.directive('buttonMenu', function() {
  return {
    restrict: 'E',
    scope: {
      markersArray: '='
    },
    //templateUrl: 'map/templates/btnMenu.html',
    templateUrl: 'app/map/templates/btnMenu.html',//HTML5Mode
    link : function(scope, element, attr) {
        var btn = element.children()[0];//angular.element()
        var container = document.getElementsByClassName("had-container")[0];//angular.element(document.getElementsByClassName("container"))
        btn.addEventListener('click', function () {
            this.classList.toggle('open');
            container.classList.toggle('active');
        });
    }
  };
})
.controller('WindowCtrl', function ($scope) {
  $scope.place = {};
  $scope.showPlaceDetails = function(param) {
    $scope.place = param;
  }
})
.controller('mapController', ['$scope', '$timeout', 'uiGmapGoogleMapApi', '$http', '$rootScope', '$log', 'factoryLogin', '$modal', function($scope, $timeout, uiGmapGoogleMapApi, $http, $rootScope, $log, factoryLogin, $modal) {
  //$scope.searchInMap = true;
  $scope.streetView = [];
  $scope.svState = false;

  $scope.closeSv = function (){
    $scope.svState = false;
  }
  $scope.openSv = function (){
    $scope.svState = true;
  }

  uiGmapGoogleMapApi.then(function(maps) {

    var styles = [
      {
        "stylers": [
          { "saturation": -100 }
        ]
      },{
        "featureType": "water",
        "stylers": [
          { "color": "#a0bac8" }
        ]
      }
    ];
    angular.extend($scope, {
      selected: {
        options: {
          visible:false
        },
        templateurl:'window.tpl.html',
        templateparameter: {}
      },
      map: {
        control: {},
        center: {
          latitude: 36.6608081,
          longitude: -4.5538591
        },
        options: {
          /*mapTypeControl: false,
          zoomControl: false*/
          maxZoom: 16,
          minZoom: 7,
          styles: styles,
          panControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
              //style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
              style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
              position: maps.ControlPosition.TOP_RIGHT
          },
          scaleControl: true,
          streetViewControl: false,
          streetViewControlOptions: {
            position: maps.ControlPosition.RIGHT_TOP
          },
          zoomControl: true,
          zoomControlOptions: {
            style: maps.ZoomControlStyle.SMALL,
            position: maps.ControlPosition.RIGHT_TOP
          }
        },
        zoom: 12,
        dragging: true,
        bounds: {},
        //markers: [],
        idkey: 'place_id',
        events: {
          idle: function (map) {

          },
          dragend: function(map) {
            //update the search box bounds after dragging the map
            var bounds = map.getBounds();
            var ne = bounds.getNorthEast();
            var sw = bounds.getSouthWest();
            $scope.searchbox.options.bounds = new google.maps.LatLngBounds(sw, ne);
            //$scope.searchbox.options.visible = true;
          },
          click: function(map,eventName, originalEventArgs){
            var e = originalEventArgs[0];
              var lat = e.latLng.lat(),
              lon = e.latLng.lng();
              var marker = {
                id:0,
                coords: {
                  latitude: lat,
                  longitude: lon,
                 },
                options: {
                  //visible:false,
                  draggable:true
                },
                events: {
                  dragend: function (marker, eventName, args) {
                    var lat = marker.getPosition().lat();
                    var lon = marker.getPosition().lng();
                    //console.log(lat +" - "+ lon );
                    //STreet View Param adding on Drag
                    $scope.streetView.parameter = _.extend({}, $scope.map.marker.coords);
                    $scope.svState=true;
                    $scope.$apply();
                  }
                }
              };
              $scope.map.marker = marker;
              //STreet View Param adding on click
              $scope.streetView.parameter = _.extend({}, $scope.map.marker.coords);
              $scope.svState=true;
              $scope.$apply();
          }
        }
      }
    });

    //maps.visualRefresh = true;
    $scope.defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(40.82148, -73.66450),
      new google.maps.LatLng(40.66541, -74.31715));

    $scope.map.bounds = {
      northeast: {
        latitude:$scope.defaultBounds.getNorthEast().lat(),
        longitude:$scope.defaultBounds.getNorthEast().lng()
      },
      southwest: {
        latitude:$scope.defaultBounds.getSouthWest().lat(),
        longitude:-$scope.defaultBounds.getSouthWest().lng()

      }
    }
    /*search box options */
    $scope.searchbox.options.bounds = new google.maps.LatLngBounds($scope.defaultBounds.getNorthEast(), $scope.defaultBounds.getSouthWest());
    /* Street View Events && Options */
    $scope.streetView.options = {
        addressControlOptions: {
          position: maps.ControlPosition.BOTTOM_CENTER
        },
        linksControl: false,
        panControl: false,
        zoomControlOptions: {
          style: maps.ZoomControlStyle.SMALL
        },
        enableCloseButton: false
      };
      $scope.streetView.events = {
        image_status_changed:function(gObject,eventName,model,status){
          $log.info("status street: " + status);
        }
      };
      console.log($scope.streetView);
  });

/* Geolocation */
$scope.addPosition = function (position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var accuracy = position.coords.accuracy;
    //$scope.$apply(); //

    /*$scope.latlng = new google.maps.LatLng($scope.lat, $scope.lng);*/
    $scope.map.center = {
      latitude: lat,
      longitude: lng
    }

    var marker = {
      id:0,
      coords: {
        latitude: lat,
        longitude: lng
      },
      options: {
        //visible:false,
        draggable:true
      },
      events: {
        dragend: function (marker, eventName, args) {
          var lat = marker.getPosition().lat();
          var lon = marker.getPosition().lng();
          //console.log(lat +" - "+ lon );
          //STreet View Param adding on Drag
          $scope.streetView.parameter = _.extend({}, $scope.map.marker.coords);
          $scope.svState=true;
          $scope.$apply();
        }
      }
    };
    $scope.map.marker = marker;
    //STreet View Param adding on click
    $scope.streetView.parameter = _.extend({}, $scope.map.marker.coords);
    $scope.svState=true;
    console.log($scope.streetView);
    $scope.$apply();
};
$scope.showError = function (error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            $scope.error = "User denied the request for Geolocation.";
            console.log($scope.error);
            break;
        case error.POSITION_UNAVAILABLE:
            $scope.error = "Location information is unavailable.";
            console.log($scope.error);
            break;
        case error.TIMEOUT:
            $scope.error = "The request to get user location timed out.";
            console.log($scope.error);
            break;
        case error.UNKNOWN_ERROR:
            $scope.error = "An unknown error occurred.";
            console.log($scope.error);
            break;
    }
    $scope.$apply();
};

$scope.geolocateMe = function() {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition($scope.addPosition, $scope.showError);
  }
  else {
      $scope.error = "Geolocation is not supported by this browser.";
  }
};

/* SEARCH BOX */
angular.extend($scope, {
  searchbox: {
    template: 'searchbox.tpl.html',
    //position:'top-right',
    position:'top-left',
    options: {
      bounds: {}
    },
    //parentdiv:'searchBoxParent',
    events: {
      places_changed: function (searchBox) {
        var places = searchBox.getPlaces()
        if (places.length == 0) {
          return;
        }
        var bounds = new google.maps.LatLngBounds();
        //only 1 marker
        var marker = {
          //id:0,
          place_id: places[0].place_id,
          id: places[0].place_id,
          name: places[0].name,
          coords: {
            latitude: places[0].geometry.location.lat(),
            longitude: places[0].geometry.location.lng(),
           },
          options: {
            //visible:false,
            draggable:true
          },
          events: {
            dragend: function (marker, eventName, args) {
              var lat = marker.getPosition().lat();
              var lon = marker.getPosition().lng();

              //setup street view on search
              $scope.streetView.parameter = _.extend({}, $scope.map.marker.coords);
              $scope.svState=true;
            }
          },
          templateurl:'window.tpl.html',
          templateparameter: places[0]
        };

        bounds.extend(places[0].geometry.location);

        $scope.map.bounds = {
          northeast: {
            latitude: bounds.getNorthEast().lat(),
            longitude: bounds.getNorthEast().lng()
          },
          southwest: {
            latitude: bounds.getSouthWest().lat(),
            longitude: bounds.getSouthWest().lng()
          }
        }
        //only 1 marker
        marker.closeClick = function() {
          $scope.selected.options.visible = false;
          marker.options.visble = false;
          return $scope.$apply();
        };
        marker.onClicked = function() {
          $scope.selected.options.visible = false;
          $scope.selected = marker;
          $scope.selected.options.visible = true;
        };
        $scope.map.zoom = 12;
        $scope.map.marker = marker;
        //setup street view on search
        $scope.streetView.parameter = _.extend({}, $scope.map.marker.coords);
        $scope.svState=true;
        $scope.searchbox.options.visible = false;
        $scope.$apply();
      }
    }
  }
});

$scope.changeSbShow = function (){
  $scope.searchbox.options.visible = !$scope.searchbox.options.visible;
}

$scope.apps = [
  {
    icon: 'img/move.jpg',
    title: 'MOVE',
    developer: 'MOVE, Inc.',
    price: 0.99
  },
  {
    icon: 'img/shutterbugg.jpg',
    title: 'Shutterbugg',
    developer: 'Chico Dusty',
    price: 2.99
  } ,
  {
    icon: 'img/shutterbugg.jpg',
    title: 'The red button',
    developer: 'Game?',
    price: 0
  },
  {
    icon: 'img/shutterbugg.jpg',
    title: 'Mr. Bean',
    developer: 'Whaaat',
    price: 2.99
  }
]

$scope.testLogin = function(){
    $scope.data = {
      "email": $scope.Email,
      "password": $scope.Password//CryptoJS.enc.Base64.stringify(CryptoJS.enc.Base64.parse($scope.Password))//CryptoJS.SHA1($scope.Password).toString()//$scope.Password //CryptoJS.SHA1($scope.Password)
    };
    //console.log($scope.data);

    console.log(CryptoJS.SHA1($scope.Password).toString())
    //alert(pass);
    //var a = CryptoJS.enc.Base64.parse($scope.Password);
    //console.log();
    //console.log(CryptoJS.enc.Base64.stringify(a));
    // Simple POST request example (passing data) :
    //joseantoniocamposgonzalez@gmail.com

    factoryLogin.login($scope.data).then (
          function (response){
            if (response.data=='OK')
            {
                console.log(response);
            }
            else
            {
              console.log(response);
            }
          },
          function (error){
            console.log(error);

          }
        )


}
/*
$scope.open = function (size) {
    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/map/templates/modalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
  */

}])

.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'items', function ($scope, $modalInstance, items) {
  $scope.place = {};
  $scope.showPlaceDetails = function(param) {
    $scope.place = param;
  }
}])


;
