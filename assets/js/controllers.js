function MainCtrl($scope, $route, $http, $location)
{
	$scope.CustomCenter = {
		lat: 44.849541,
		lng: -0.579643
	};

	angular.extend($scope, {
		map: {
			defaults:{
				maxZoom: 15,
				minZoom: 9,
			},
			center: {
				lat: $scope.CustomCenter.lat,
				lng: $scope.CustomCenter.lng,
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
		},
		leafletMap : null,
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

function LoginCtrl($scope, sharedProperties)
{
	$scope.user = {};
	$scope.error = "";

	$scope.login = function(user){
		if(!user.$valid) return false;
		sharedProperties.setProperty(user,user);
		localStorage.setItem('user', JSON.stringify($scope.user));
	};
}

function ProCtrl($scope, $http, $route, $rootScope, $compile, sharedProperties)
{

	var markersArray = [];
	$scope.user = sharedProperties.getProperty('user') || {};
	$scope.module = {
		libelle: "Acceuil",
		url : 'partials/pro/accueil.html'
	};

	$scope.proMap = null;

	$scope.load = function(module)
	{
		$scope.module = {
			libelle: module,
			url: "partials/pro/"+module+'.html'
		};
	};

	$scope.update = function(user){
		angular.extend($scope.user,user);
		localStorage.setItem('user', JSON.stringify($scope.user));
		$('#etape2').css('display','block');
		var height = $(window).height()-$('header').height()-$('#etape2 .form-wrap').height()-parseFloat($('#etape2 .form').css('margin-top'))-parseFloat($('#etape2 .form').css('margin-bottom'));
        $('.include-map').css('height',height);
		$('#etape2').animate({left:0},300);
		$('#etape1').css('position','absolute');
		$('#etape1').animate({left:'-200%'},300,function(){
			$(this).css('display','none');
			$scope.proMap = L.map('map').setView([$scope.CustomCenter.lat, $scope.CustomCenter.lng], 12);
			var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
			var options = {
				type:"ROADMAP",
				maxZoom: 15,
				minZoom: 9,
			};
			var ggl = new L.Google(options);
			$scope.proMap.addLayer(ggl);

			var options				= {types: ['(cities)'],componentRestrictions: {country: "fr"}},
				inputVille			= document.getElementById('userVille'),
				autocompleteVille	= new google.maps.places.Autocomplete(inputVille,options);

			/*options = {types: ['(country)']};
			input = document.getElementById('userPays');
			autocomplete = new google.maps.places.Autocomplete(input,options);*/

			options			= {types: ['geocode'],componentRestrictions: {country: "fr"}};
			var inputAdress			= document.getElementById('userAdresse'),
				autocompleteAdress	= new google.maps.places.Autocomplete(inputAdress,options);

			google.maps.event.addListener(autocompleteVille, 'place_changed', function() {
				var place	= autocompleteVille.getPlace();
				for(var component in place.address_components)
				{
					var type = place.address_components[component].types[0];
					if(type == "locality")
					{
						$scope.$apply(function(){
							$scope.user.ville = place.address_components[component].long_name;
						});
					}
				}
			});
			google.maps.event.addListener(autocompleteAdress, 'place_changed', function() {
				for(var marker in markersArray)
				{
					$scope.proMap.removeLayer(markersArray[marker]);
				}
				var place	= autocompleteAdress.getPlace(),
					lat		= place.geometry.location.lat(),
					lng		= place.geometry.location.lng(),
					marker	= L.marker([lat, lng]).addTo($scope.proMap);

				markersArray.push(marker);
				$scope.proMap.setView([lat, lng], 12);

				var inputValue = "";
				for(var component in place.address_components)
				{
					var type = place.address_components[component].types[0];
					if(type == "route" || type == "street_number")
					{
						if(inputValue != "") inputValue += " ";
						inputValue += place.address_components[component].long_name;
					}
				}
				$scope.$apply(function(){
					$scope.user.adresse = inputValue;
				});
			});
		});
	};

}