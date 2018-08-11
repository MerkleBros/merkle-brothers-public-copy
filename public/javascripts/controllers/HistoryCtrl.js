//$http returns a res object, actual data is stored in res.data
angular.module('HistoryCtrl', []).controller('HistoryController', ['$scope', '$location', '$http', '$filter', function($scope, $location, $http, $filter) {

  checkWeb3();

  //Check for web3. If web3 exists, set user's account to $scope.account and get user's cards
  function checkWeb3() {
    console.log("Check web3");
    if (typeof web3 !== 'undefined') {
        web3.eth.getAccounts(function(e, result) {
          if(e) {console.log('Unable to get accounts from Metamask in HistoryCtrl');}
          else {
            //REMOVE AFTER TESTING
            console.log('Retrieved accounts from Metamask in HistoryCtrl');

            //Retrieve web3 account
            $scope.account = result[0];
            getCards();
          }
        });
    } 
    else {console.log('Web3 provider not detected in HistoryCtrl');}
  };

  
  //Function to retrieve a user's cards and add to $scope
  //Then match user's cards to card prototypes in a given set
  function getCards() {
    console.log('In getCards');
    $http.get('/cardbook/' + $scope.account).then(function(res){
      $scope.cards = res.data;
      $http.get('/cardprototypebook/').then(function(resp){
        $scope.cardPrototypes = resp.data;

        for (var i = 0; i < $scope.cards.length; i++) {
          var cardPrototype = $filter('filter')($scope.cardPrototypes, {_id: $scope.cards[i].cardPrototypeId}, true)[0];
          $scope.cards[i].cardPrototype = cardPrototype;
          var rarity = $scope.cards[i].cardPrototype.rarity;
          if (rarity == 0) {
            $scope.cards[i].rarityText = "Totem";
          }
          if (rarity == 1) {
            $scope.cards[i].rarityText = "Common";
          }
          if (rarity == 2) {
            $scope.cards[i].rarityText = "Rare";
          }
          if (rarity == 3) {
            $scope.cards[i].rarityText = "Epic";
          }
          if (rarity == 4) {
            $scope.cards[i].rarityText = "Legendary";
          }
          if (rarity == 100) {
            $scope.cards[i].rarityText = "Promo";
          }
          if (rarity == 200) {
            $scope.cards[i].rarityText = "Fine Art Print";
          }
        }
      });

    });
  }

}]);