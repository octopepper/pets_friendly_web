'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('PetsFriendly', ["PetsFriendly.services","leaflet-directive", "ngGeolocation"]).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index.html',
      }).
      when('/search', {
        templateUrl: 'partials/search.html',
        controller: 'SearchCtrl'
      }).
      when('/pro', {
        templateUrl: 'partials/pro/index.html',
      }).
      when('/pro/plans', {
        templateUrl: 'partials/pro/plans.html',
      }).
      when('/join', {
        templateUrl: 'partials/join.html',
        controller: 'JoinCtrl'
      }).
      otherwise({redirectTo: '/'});
  }]);

angular.module('PetsFriendly.services', [])
    .service('sharedProperties', function () {
        this.setProperty = function(key,value)
        {
          this[key] = value;
        };

        this.getProperty = function(key){
          return this[key];
        };
    });

angular.module('ngGeolocation',[])
  .constant('options',{})
  .factory('geolocation',
        ["$q","$rootScope","options",
function ($q , $rootScope , options){
  return {
    position: function () {
      var deferred = $q.defer();
      navigator.geolocation.getCurrentPosition(function (pos) {
        $rootScope.$apply(function () {
          deferred.resolve(angular.copy(pos));
        });
      }, function (error) {
        $rootScope.$apply(function () {
          deferred.reject(error);
        });
      },options);
      return deferred.promise;
    }
  };
}]);