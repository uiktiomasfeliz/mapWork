'use strict';

// Declare app level module which depends on views, and components
angular.module('GecorCiudadano', [
  'ngRoute',
  //'mm.foundation',
  'ui.materialize',
  'GecorCiudadano.map',
  'GecorCiudadano.serviceLogin'
]).
config(['$routeProvider' , '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $routeProvider.otherwise({redirectTo: '/app'});
}]);
