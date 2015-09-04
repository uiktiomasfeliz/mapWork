angular.module('GecorCiudadano.serviceLogin', [])
  .value('version', '0.1')
  //.constant('URL', 'http://80.35.198.107:85/ServiceGecor/index.php')
  .constant('URL', 'http://192.168.1.147/RestDemoService/TestService.svc/login')
  .factory('factoryLogin', ['URL', '$http', function(URL, $http){
    return {
      login: function(user){
        return $http.post(URL, user);
      }
    };
  }]);


  /*
  $http.post('http://192.168.1.147/RestDemoService/TestService.svc/login', $scope.data).
    then(function(response) {
      if (response.data=='OK')
      {
          console.log(response);
      }
      else
      {
          console.log(response);
      }
    }, function(error) {
      console.log(error);
    });
    */
    /**/
    /*var req = {
       method: 'POST',
       dataType: "application/json",
       url: 'http://192.168.1.147/RestDemoService/TestService.svc/login',
       headers: {
         'Content-Type': 'application/json; charset=UTF-8'
       },
       data: $scope.data
      }

      $http(req).
        then(function(response) {
          if (response.data=='OK')
          {
              console.log(response);
          }
          else
          {
              console.log(response);
          }
        }, function(error) {
          console.log(error);
        });*/
