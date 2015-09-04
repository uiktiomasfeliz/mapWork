'use strict';

angular.module('GecorCiudadano.principal', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'principal/principal.html',
    controller: 'principal'
  });
}])

.controller('principal', [function() {

}]);
