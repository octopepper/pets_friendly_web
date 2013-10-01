function MainCtrl($scope, $route, $http, $location)
{
	angular.extend($scope, {
		map: {
			defaults:{
				maxZoom: 15,
				minZoom: 9,
			},
			center: {
				lat: 44.849541,
				lng: -0.579643,
				zoom: 12
			},
			layers: {
				baselayers: {
					googleRoadmap: {
						name: 'Google Streets',
						layerType: 'ROADMAP',
						type: 'google'
					}
				}
			},
			markers : [],
		}
	});

	$scope.go = function(){
		var what = $('#search-what').val(),
			where = $('#search-where').val();

		if(what !== undefined && where !== undefined)
		{
			window.location.href += "search?c="+where+"&t="+what;
		}
	};

	$scope.range = function(n) {
		return new Array(n);
	};

	$scope.$on('$locationChangeStart', function(scope, next, current){
		
		//var proRegexp = /.*\/pro.*/;
		/*if(proRegexp.test(next))
		{
			$location.path('/login');
			$http.get('./ajax/is_logged.php').
			error(function(data, status, headers, config) {
				if(status == 401)
				{
					$location.path('/login');
				}
			});
		}*/
	});

	$scope.$on('$locationChangeSuccess', function(event) {
		
		
	});
}

function SearchCtrl($scope, $http, $q, geolocation, $route)
{
	$scope.geoloc = "";
	$scope.isMarkerGeoloc = false;
	var geoloc = geolocation.position();

	geoloc.then(function(pos) {
		$scope.geoloc = new L.LatLng(pos.coords.latitude,pos.coords.longitude);

		if(($scope.isMarkerGeoloc === false) && ($scope.results.length !== 0))
		{
			$scope.map.markers.push({
				lat: $scope.geoloc.lat,
				lng: $scope.geoloc.lng
			});
			$scope.reCalcDistance();
		}
	}, function(reason) {
		$scope.geoloc = reason;
	});

	jQuery('.map-app').css('height',jQuery(window).height() - 110);

	$scope.currentItem = {title : '', type: ''};
	$scope.results = [];

	$('#search-what-inline,#search-where-inline').on('keypress',function(e){
		if(e.which == 13)
		{
			e.preventDefault();
			var what = $('#search-what-inline').val(),
				where = $('#search-where-inline').val();

			if(what !== "" && where !== "")
			{
				$scope.search(what,where);
			}
		}
	});


	$scope.search = function(what,where){

		$scope.map.markers = [];
			$scope.results = [];

		what = what || $('#search-what').val();
		where = where || $('#search-where').val();

		if(what === "" || where === "") return false;

		var tmpMarker = [];
		$('#ajax-loader').fadeIn();
		$('#btn-search').css('display','none');

		$http.jsonp('http://192.168.1.168/establishment/query?callback=JSON_CALLBACK&type=' + what + '&city=' + where).success(function(data){
			
			$('#ajax-loader').fadeOut();
			
			if(data.status === false)
			{
				$('.result-search-zone').animate({right: '-32%'},300);
				$('#start-block, .no-result,#btn-search').fadeIn();
				$('#search-what').attr('value',what);
				$('#search-where').attr('value',where);
				return false;
			}
			$('#start-block, .no-result').fadeOut();
			var i = 0;
			angular.forEach(data, function(value, key){

				value.id = key;
				value.typeResult = 'featured';

				value.goodnotes = value.popularity;
				value.badnotes = 5-value.popularity;

				var classIcon = "";
				var category = value.cat || '';

				value.cat = category;

				$scope.results.push(value);

				var position = value.store.split(', ');
				value.distance = GetDistance(position);

				switch(category.toLowerCase())
				{
					case 'bar':
						classIcon = "bar";
					break;

					case 'cafe':
						classIcon = "cafe";
					break;

					case 'restaurant':
						classIcon = "restaurant";
					break;

					case 'hotel':
						classIcon = "hotel";
					break;

					case 'plage':
						classIcon = "plage";
					break;

					case 'camping':
						classIcon = "camping";
					break;

					case 'dogpark':
						classIcon = "dogpark";
					break;

					case 'taxi':
						classIcon = "taxi";
					break;

					default:
						classIcon = "bar";
					break;
				}

				var marker = {
					lat: parseFloat(position[0]),
					lng: parseFloat(position[1]),
					icon: L.divIcon({
						className : 'icon-marker '+classIcon,
						html : '<input type="hidden" value="'+key+'" id="marker-'+key+'" />',
						iconSize:     [25, 39],
						popupAnchor: [0, 0],
						iconAnchor : [12,39]
					}),
					id: key
				};


				setTimeout(function(){
					$scope.$apply(function(){
						$scope.map.markers.push(marker);
					});
					if(key == data.length-1)
					{
						if(typeof $scope.geoloc != "string")
						{
							$scope.map.markers.push({
								lat: $scope.geoloc.lat,
								lng: $scope.geoloc.lng
							});
							$scope.isMarkerGeoloc = true;
						}
					}
				}, key*100);
			});

			$('.result-search-zone').animate({right: '0'}, 200, function(){
				$(".result-search-scroll").mCustomScrollbar("update");
			});
		});
	};

	if($route.current.params.c !== undefined && $route.current.params.t !== undefined)
	{
		var params = $route.current.params;
		$scope.search(params.t,params.c);
		$('#search-what').attr('value',params.type);
		$('#search-where').attr('value',params.city);
	}

	$scope.getDetails = function(id)
	{
		$('.details-place-zone').css('display','block');
		$('.details-place-zone').animate({left:0},300);
	};

	$scope.enterItem = function(id)
	{
		var result = $scope.results[id];
		$scope.currentItem = {title : result.name, type: result.cat};

		var data = {leafletEvent: {target : {_icon:$('#marker-'+id).parent()}}};
		$scope.$broadcast('leafletDirectiveMarker.mouseover', data);
	};

	$scope.leaveItem = function(id)
	{
		var result = $scope.results[id];
		$scope.currentItem = {title : '', type: ''};

		var data = $('#marker-'+id).parent();
		$scope.$broadcast('leafletDirectiveMarker.mouseout', data);
	};

	function GetPosMarker(matrix)
	{
		matrix = matrix.match(/(-?[0-9\.]+)/g);
		var posx = parseFloat(matrix[4]);
		var posy = parseFloat(matrix[5]);

		return {posx : posx, posy: posy};
	}

	$scope.$on('leafletDirectiveMarker.mouseover', function(e, data){
		var icon;
		if(data.leafletEvent !== undefined)
		{
			icon = $(data.leafletEvent.target._icon);
		}
		else
		{
			icon = $(data);
		}
		
		var matrix = GetPosMarker(icon.css('transform'));

		icon.css({ 'transform' : 'translate(' + (matrix.posx-7) + 'px, ' + (matrix.posy-20) + 'px)' });
		icon.css({'width': 40, 'height':60});
		icon.addClass('active');
	});
	$scope.$on('leafletDirectiveMarker.mouseout', function(e, data){
		var icon;
		if(data.leafletEvent !== undefined)
		{
			icon = $(data.leafletEvent.target._icon);
		}
		else
		{
			icon = $(data);
		}
		var matrix = GetPosMarker(icon.css('transform'));

		icon.css({ 'transform' : 'translate(' + (matrix.posx+7) + 'px, ' + (matrix.posy+20) + 'px)' });
		icon.css({'width': 25, 'height':39});
		icon.removeClass('active');
	});
	$scope.$on('leafletDirectiveMarker.click', function(e, data){
		$('.result-search-scroll').mCustomScrollbar("scrollTo","[data-id="+data.markerName+"]", {scrollInertia:1000});
		$('.result-search-elmt').removeClass('active');
		$('.result-search-elmt[data-id='+data.markerName+"]").addClass('active');
	});

	$scope.sortResultValues = [
		{
			libelle : 'En avant',
			active: true,
			sortOrder: "ascending",
			sortAttribute: "name"
		},
		{
			libelle : 'Populaires',
			active: true,
			sortOrder: "ascending",
			sortAttribute: "popularity"
		},
		{
			libelle : 'Type',
			active: false,
			sortOrder: "ascending",
			sortAttribute: "cat"
		},
		{
			libelle : 'Distance',
			active: false,
			sortOrder: "ascending",
			sortAttribute: "distance"
		},
		{
			libelle : 'Ouvert',
			active: false,
			sortOrder: "ascending",
			sortAttribute: "name"
		},
		{
			libelle : 'Prix',
			active: false,
			sortOrder: "descending",
			sortAttribute: "price"
		}
	];

	$scope.currentSort = [];


	$scope.sortResult = function(){
		var sortData = [];
		var sortvalues = $scope.sortResultValues;
		
		for(var i=0; i < sortvalues.length; i++) {
			if(sortvalues[i].active === true)
			{
				if(sortvalues[i].sortOrder === 'ascending') {
					sortData.push('+' + sortvalues[i].sortAttribute);
				} else {
					sortData.push('-' + sortvalues[i].sortAttribute);
				}
			}
		}
		return sortData;
	};

	$scope.$watch('sortResultValues', function(newModel, oldModel, $scope) {
		$scope.currentSort = $scope.sortResult();
		$(".result-search-scroll").mCustomScrollbar("update");
	}, true);

	$scope.reCalcDistance = function(){
		angular.forEach($scope.results, function(value, key){
			var position = value.store.split(', ');
			value.distance = GetDistance(position);
			$scope.results[key] = value;
		});
	};

	function GetDistance(position)
	{
		var distance;
		if(typeof $scope.geoloc != "string")
		{
			var latlng = new L.LatLng(position[0], position[1]);
			distance = Math.round(Math.round(latlng.distanceTo($scope.geoloc))/100)*100;
			if(distance > 1000 && distance < 10000)
			{
				distance = distance.toString().slice(0,2);
				var kilometer = distance.slice(0,1);
				var unit = distance.slice(1,2);
				distance = kilometer+","+unit;
			}
			if(distance < 1000)
			{
				distance = "0,"+distance.toString().slice(0,1);
			}
		}
		return distance;
	}
}

function LoginCtrl($scope)
{
	$scope.user = {};
	$scope.error = "";

	$scope.login = function(user){
		if(!user.$valid) return false;
	};
}

function ProCtrl($scope, $http, $route)
{
	$scope.load = function(module)
	{
		$http.get('./partials/pro/ajax/'+module+'.html').success(function(data){
			$('#Content').html(data);
		});
	};
}