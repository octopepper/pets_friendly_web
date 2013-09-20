function MainCtrl($scope)
{
	$scope.center = {
		latitude:44.849541,
		longitude: -0.579643
	}
	$scope.zoom = 13;
	google.maps.visualRefresh = true;
}