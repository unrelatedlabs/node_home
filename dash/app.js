var config = {
	    apiKey: "AIzaSyC0Vqb-oTpl1oe6dW2ZzZ07xBlc8NIC3YQ",
	    authDomain: "iotdata.firebaseapp.com",
	    databaseURL: "https://iotdata.firebaseio.com",
	    storageBucket: "firebase-iotdata.appspot.com",
	    messagingSenderId: "462881763016"
	};
  firebase.initializeApp(config);

  var app = angular.module("homeApp", ["firebase"]);
  app.controller("StatusCtrl", function($scope, $rootScope,$firebaseObject,$firebaseArray,$interval) {
	  var living_room_ref = firebase.database().ref("temperature_log/living_room").orderByKey().limitToLast(1)
	  // download the data into a local object
	  $scope.living_room = $firebaseArray(living_room_ref);

	  var bedroom_ref = firebase.database().ref("temperature_log/bedroom").orderByKey().limitToLast(1)
	  // download the data into a local object
	  $scope.bedroom = $firebaseArray(bedroom_ref);

	  var living_room_settings_ref = firebase.database().ref("settings/living_room")
	  // download the data into a local object

	  var living_room_settings = $firebaseObject(living_room_settings_ref);

	  living_room_settings.$bindTo($scope, "living_room_settings");
	  // putting a console.log here won't work, see below
	  $scope.ago = 0

	  $interval(function() {
	  	   $scope.bedroom_ago = (new Date().getTime()-$scope.bedroom[0].timestamp);
	  	   $scope.living_room_ago = (new Date().getTime()-$scope.living_room[0].timestamp);

	  }, 1000 );

	  $scope.updateTemperature = function(change){
	  	console.log("update",$scope.living_room_settings.temperature,change)

	  	$scope.living_room_settings.temperature  = ($scope.living_room_settings.temperature  || 0 ) + change

	  	console.log("update",$scope.living_room_settings.temperature, change)
	  }

   });

   app.filter('elapsed', function($filter,$interval){
   	 
    return function(difference){

        if (!difference) return;

        
   
        // Seconds (e.g. 32s)
        difference /= 1000;
        if (difference < 60) return Math.floor(difference)+'s';

        // Minutes (e.g. 12m)
        difference /= 60;
        if (difference < 60) return Math.floor(difference)+'m';

        // Hours (e.g. 5h)
        difference /= 60;
        if (difference < 24) return Math.floor(difference)+'h';

        // Date (e.g. Dec 2)
        return $filter('date')(time, 'MMM d');
    };
    });

    