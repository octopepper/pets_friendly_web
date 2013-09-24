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
            }),
            div_icon: L.divIcon({
            	className : 'icon-marker',
                iconSize:     [25, 39],
                popupAnchor: [0, 0],
                iconAnchor : [12,0]
            }),
	    }
     });
}

function SearchCtrl($scope, $http)
{
	jQuery('.map-app').css('height',jQuery(window).height() - 110);

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

	$scope.results = [];

	$scope.search = function(what,where){

		$scope.map.markers = [];
		var what = $('#search-what').val() || what,
       	 	where = $('#search-where').val() || where;

     	$http.post('data.json', {what: what, where: where}).success(function(data){
	    	$('#start-block').fadeOut();
	        var i = 0;
	        angular.forEach(data, function(value, key){
	        	value.id = key;
	        	$scope.results.push(value);

	            var classIcon = "";
	            switch(value.type)
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
					lat: parseFloat(value.latitude),
					lng: parseFloat(value.longitude),
					icon: $scope.map.div_icon,
        		};
        		marker.icon.options.className = 'icon-marker '+classIcon;

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

	$scope.sortResult = {};
}