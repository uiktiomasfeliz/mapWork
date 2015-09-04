'use strict';

angular.module('GecorCiudadano.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/auth', {
    templateUrl: 'loginRegister/login.html',
    controller: 'login'
  });
}])

.controller('login', [function() {

}]);
