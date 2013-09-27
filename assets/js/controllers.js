function MainCtrl($scope)
{
	angular.extend($scope, {
		map: {
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
			default_icon: L.icon({
                iconUrl: 'assets/img/Sprite-markers.png',
                iconSize:     [25, 39],
			    iconAnchor:   [49, 11],
            })
	    }
     });
}

function SearchCtrl($scope, $http, $q)
{
	jQuery('.map-app').css('height',jQuery(window).height() - 110);

	$scope.currentItem = {title : '', type: ''};
	$scope.results = [];

	$('#search-what-inline,#search-where-inline').on('keypress',function(e){
		if(e.which == 13)
		{
			e.preventDefault();
			var what = $('#search-what-inline').val(),
       	 		where = $('#search-where-inline').val();

       	 	if(what != "" && where != "")
       	 	{
       	 		$scope.search(what,where);
       	 	}
		}
	});

	

	$scope.search = function(what,where){

		$scope.map.markers = [],
			$scope.results = [];

		var what = what || $('#search-what').val() ,
       	 	where = where || $('#search-where').val();

       	var tmpMarker = [];
     	$http.jsonp('http://192.168.1.168/establishment/query?callback=JSON_CALLBACK&type=' + what + '&city=' + where).success(function(data){
	    	if(data.status == false)
	    	{
	    		$('.result-search-zone').animate({right: '-32%'},300);
	    		$('#start-block, .no-result').fadeIn();
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

	        	$scope.results.push(value);


	            var classIcon = "";
	            var category = value.cat || '';

	            var position = value.store.split(', ');

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
	            }, key*100);
	        });

            $('.result-search-zone').animate({right: '0'}, 200, function(){
            	$(".result-search-scroll").mCustomScrollbar("update");
            });
	    });
	}

	$scope.getDetails = function(id)
	{
		alert(id);
	}

	$scope.enterItem = function(id)
	{
		var result = $scope.results[id];
		$scope.currentItem = {title : result.name, type: result.description};
	}

	$scope.leaveItem = function(id)
	{
		var result = $scope.results[id];
		$scope.currentItem = {title : '', type: ''};
	}

	function GetPosMarker(matrix)
	{
		matrix = matrix.match(/(-?[0-9\.]+)/g);
		var posx = parseFloat(matrix[4]);
		var posy = parseFloat(matrix[5]);

		return {posx : posx, posy: posy};
	}

	$scope.$on('leafletDirectiveMarker.mouseover', function(e, data){
		var icon = $(data.leafletEvent.target._icon);
		var matrix = GetPosMarker(icon.css('transform'));

		icon.css({ 'transform' : 'translate(' + (matrix.posx-7) + 'px, ' + (matrix.posy-20) + 'px)' });
		icon.css({'width': 40, 'height':60});
		icon.addClass('active');
	});
	$scope.$on('leafletDirectiveMarker.mouseout', function(e, data){
		var icon = $(data.leafletEvent.target._icon);
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
           	sortAttribute: "name"
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
        	if(sortvalues[i].active == true)
        	{
        		if(sortvalues[i].sortOrder === 'ascending') {
	                sortData.push('+' + sortvalues[i].sortAttribute);
	            } else {
	                sortData.push('-' + sortvalues[i].sortAttribute);
	            }
        	}
        }
        return sortData;
	}

	$scope.$watch('sortResultValues', function(newModel, oldModel, $scope) {
		$scope.currentSort = $scope.sortResult();
		$(".result-search-scroll").mCustomScrollbar("update");
	}, true);
}