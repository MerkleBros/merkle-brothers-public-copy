    angular.module('AppRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // cards page that will use the CardController
        .when('/cards', {
            templateUrl: 'views/cards.html',
            controller: 'CardController'
        })
        .when('/my-collection2.html', {
            controller: 'CardController'
        });

    $locationProvider.html5Mode(true);

}]);
