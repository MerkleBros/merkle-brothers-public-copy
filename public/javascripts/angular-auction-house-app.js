var app = angular.module('angular-auction-house-app', ['ngRoute', 'ArtCardCtrl']);
app.config(function($routeProvider) {
	$routeProvider
	.when('/enter-user-information', {
		templateUrl: "./views/enter-user-information.html"
	})
	.otherwise({templateUrl: "./views/auction-house-view.html"
	});
});