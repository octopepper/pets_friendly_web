'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('PetsFriendly', ["leaflet-directive", "ngGeolocation"]).
	config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider,$httpProvider) {
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
				templateUrl: 'partials/pro/accueil.php',
				controller: 'ProCtrl'
			}).
			when('/pro/accueil', {
				templateUrl: 'partials/pro/accueil.php',
				controller: 'ProCtrl'
			}).
			when('/pro/plans', {
				templateUrl: 'partials/pro/plans.php',
			}).
			when('/login', {
				templateUrl: 'partials/login.html',
				controller: 'LoginCtrl'
			}).
			otherwise({redirectTo: '/'});
			$httpProvider.interceptors.push('myHttpInterceptor');
	}]);

app.factory('myHttpInterceptor', function($q, $location) {
	return {
		/*request: function(config) {
			return config || $q.when(config);
		},

		response: function(response) {
			return response || $q.when(response);
		},*/
		responseError: function(rejection) {
			if(rejection.status == 401)
			{
				$location.path('/login');
			}
			return $q.reject(rejection);
		}
	}
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