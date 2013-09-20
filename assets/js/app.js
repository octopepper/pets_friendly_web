'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('PetsFriendly', ["PetsFriendly.services","google-maps"]).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index.html',
      }).
      when('/search', {
        templateUrl: 'partials/search.html',
      }).
	   otherwise({redirectTo: '/'});
    
  }]);

angular.module('PetsFriendly.services', [])
    .service('sharedProperties', function () {
        this.setProperty = function(key,value)
        {
          this[key] = value;
        }

        this.getProperty = function(key){
          return this[key];
        }
    });