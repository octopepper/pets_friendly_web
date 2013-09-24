function MainCtrl($scope)
{


}

function SearchCtrl($scope, $http)
{
	jQuery('.map-app').css('height',jQuery(window).height() - 110);

	$scope.results = [];

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
			markers : []
	    }
     });

	$scope.search = function(){

		$scope.map.markers = [];
		var what = $('#search-what').val(),
       	 	where = $('#search-where').val();

     	$http.post('data.json', {what: what, where: where}).success(function(data){
	    	$('#start-block').fadeOut();
	        var i = 0;
	        $.each(data, function(key, value){

	        	value.id = key;
	        	$scope.results.push(value);

	        	/* 

	        	iconUrl: 'http://leafletjs.com/docs/images/leaf-orange.png',
	            shadowUrl: 'http://leafletjs.com/docs/images/leaf-shadow.png',
	            iconSize:     [38, 95],
	            shadowSize:   [50, 64],
	            iconAnchor:   [22, 94],
	            shadowAnchor: [4, 62]

	            */
	            switch(value.type)
	            {
	                case 'bar':
	                break;

	                case 'restaurant':
	                break;
					/*

					Bar
					Café
					Resto
					Hotel
					Plage
					Camping
					Dogpark  / Canisite
					Taxi

					*/
	            }

	            setTimeout(function(){
	            	var marker = {
						lat: parseFloat(value.latitude),
						lng: parseFloat(value.longitude),
            		};
	            	$scope.$apply(function(){
	            		$scope.map.markers.push(marker);

					});
	            }, i*100);
	            i++;
	        });
			

			
            $('.result-search-zone').animate({right: '0'}, 200);
	    });

	    
	}

	$scope.$on('leafletDirectiveMarker.click', function(e, data){
		console.log(e);
		console.log(data);
	});
}