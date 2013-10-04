'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('PetsFriendly', ["PetsFriendly.services","leaflet-directive", "ngGeolocation"]).
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
				templateUrl: 'partials/pro/index.php',
				controller: 'ProCtrl'
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

var INTEGER_REGEXP = /^\-?\d*$/;
app.directive('integer', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (INTEGER_REGEXP.test(viewValue)) {
                    ctrl.$setValidity('integer', true);
                    return viewValue;
                } else {
                    ctrl.$setValidity('integer', false);
                    return undefined;
                }
            });
        }
    };
});