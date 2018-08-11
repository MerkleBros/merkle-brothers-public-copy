pragma solidity ^0.4.23;
contract MerkleBros {
    /* ----------------------- GLOBAL VARIABLES -----------------------*/
    address public owner;                       //Contract creator
    uint256 public tokenCount = 1;              //Incremented by one every time a new card (token) is minted
    uint32 public cardPrototypeCount = 1;       //Incremented by one every time a new card prototype is released
    uint8 public cardActionsCount = 1;          //Incremented by one every time a new card action is added to cardActions mapping
    uint256 public auctionCount = 1;            //Incremented by one every time a new auction is created
    uint256 public auctionFee = 1400 szabo;     //Auction house fee when purchasing a card from the auction house. Owner can set
    uint256 public cardPackPrice = 1400 szabo;  //Individual card price when buying packs of cards. Owner can set
    uint256 public transferFee = 3000 szabo;    //Transfer fee (used to discourage spawning free totems endlessly)
    uint256 public cardPackAmount = 100;        //Max number of cards that can be purchased in a pack. Owner can set to make sure gas use doesn't get crazy in buyCards()
    uint256 public contractBalanceOwed = 0 ether; //Total balance owed to auction sales
    bool public allowTotem = true;              //Flag allowing the use of totems (turn off when adding cards to an incomplete set)
    bool public delegateAuction = false;        //Flag for allowing another contract to handle auctions if auction logic in this contract is faulty
    bool public freeTransferAllowed = false;    //Flag for allowing free transfers (transferring may be abused to spawn totems)
    address public auctionAddress;              //Address that will be used for auctions if needed
    address public artAddress;                  //Address that will be associated with Merkle Bros prints trackable via the blockchain
    address public upgradeAddress;              //Upgrade address if contract ever needs to be upgraded

    /* ----------------------- Events -----------------------*/
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event CreateCardPrototype(address indexed _creator, uint32 indexed _cardPrototypeId);
    event ModifyCardPrototype(address indexed _address, uint32 indexed _cardPrototypeId);
    event AddAction(address indexed _creator, uint8 indexed _actionKey, bytes32 indexed _action);
    event AddSet(address indexed _creator, uint32 indexed _setId, bytes32 indexed _setTitle, uint8 _setRarity);
    event SetTotemToSet(address indexed _creator, uint32 indexed _cardPrototypeId, uint32 indexed _setId);
    event UseTotem(address indexed _owner, uint256 indexed _tokenId, uint32 indexed _setId);
    event MintCard(address indexed _owner, uint256 indexed _tokenId, uint32 indexed _cardPrototypeId);
    event MintArtCard(address indexed _owner, uint256 indexed _tokenId, uint32 indexed _cardPrototypeId);
    event CreateAuction(address indexed _owner, uint256 indexed _auctionId, uint256 indexed _tokenId);
    event CloseAuction(uint256 indexed _auctionId);
    event BuyAuction(address indexed _buyer, uint256 indexed _auctionId, uint256 indexed _price);
    event SetAuctionPrice(uint256 indexed _auctionId, uint256 indexed _price);
    
    /* ----------------------- Constructor -----------------------*/
    constructor() public {
        
        owner = msg.sender;
        setAdmin(msg.sender);
        setGovernance(msg.sender);
    }
    
    /* ----------------------- Utility Functions -----------------------*/
    //checkBalance - Checks balance of contract
    //getRandomCard - Returns a random card. Used in buying packs to make random cards.
    //getRandomCardFromSet - Returns a random card from a set. Used in generating cards using totems.
    //getCardSetArrayLength - Returns number of cards in a given set
    //getCardSetArrayCard - Returns a card in a set array given an index
    //getOwnerArray - Returns an array of tokens owned by an address
    //getOwnerCardSetArray - Returns an array of card prototypes in a given set owned by a given owner
    //getOwnerCardSetArrayCard - Returns a card from a given set that is owned by a given owner by index
    //getTotemUsed - Get a boolean value for whether or not a totem has been used with a given set.
    //getCardRarityCount - Returns the number of card prototypes of a given rarity
    //getCardRarityArray - Returns an array of all cardPrototypeIds of a given rarity
    //getCardByRarity - Returns a card of a given rarity by index
    //claimSales - Allows an auction owner to claim balanceOwed from a successful auction
    
    function checkBalance() public constant returns(uint256) {
        return address(this).balance;
    }
    
    function getRandomCard(uint256 _amount) internal returns (uint32) {
        //Card rarities: Common - 50%, Rare - 35%, Epic - 14%, Legendary - 1%
        //Probably ok to use sha3 for randomness. Cards would need to be worth a lot to throw away a block reward.
        //See https://ethereum.stackexchange.com/questions/419/when-can-blockhash-be-safely-used-for-a-random-number-when-would-it-be-unsafe
        
        uint64 _seed = uint64(sha3(sha3(block.blockhash(block.number), _amount), now)) % 100;
        
        if (_seed == 99) {
            return legendaryCardPrototypes[uint64(sha3(sha3(block.blockhash(block.number), _amount), now)) % legendaryCardPrototypes.length];

        }
        
        if(_seed >= 85 && _seed <= 98) {
            return epicCardPrototypes[uint64(sha3(sha3(block.blockhash(block.number), _amount), now)) % epicCardPrototypes.length];
        }
        
        if(_seed >= 50 && _seed <= 84) {
            return rareCardPrototypes[uint64(sha3(sha3(block.blockhash(block.number), _amount), now)) % rareCardPrototypes.length];
        }
        
        else {
            return commonCardPrototypes[uint64(sha3(sha3(block.blockhash(block.number), _amount), now)) % commonCardPrototypes.length];
        }
    }
    
    function getRandomCardFromSet(uint32 _setId) internal returns(uint32) {
        return cardSetArrays[_setId][uint64(sha3(sha3(block.blockhash(block.number), _setId), now)) % cardSetArrays[_setId].length];
    }
    
    function getCardSetArrayLength(uint32 _setId) public view returns(uint256) {
        return cardSetArrays[_setId].length;
    }
    
    function getCardSetArrayCard(uint32 _setId, uint256 _index) public view returns(uint32) {
        return cardSetArrays[_setId][_index];
    }
    
    function getOwnerArray(address _address) public view returns(uint256[]) {
        return ownerToTokenIdArray[_address];
    }
    
    function getOwnerCardSetArray(address _address, uint32 _setId) public view returns(uint32[]) {
        return ownerToCardSetArray[_address][_setId];
    }
    
    function getOwnerCardSetArrayCard(address _address, uint32 _setId, uint256 _index) public view returns(uint32) {
        return ownerToCardSetArray[_address][_setId][_index];
    }
    
    function getTotemUsed(uint256 _tokenId, uint32 _setId) public view returns(bool) {
        return totemUsed[_tokenId][_setId];
    }

    function getCardRarityCount(uint256 _rarity) public view returns(uint256) {
        if (_rarity == 0) {
            return totemCardPrototypes.length;
        }
        if (_rarity == 1) {
            return commonCardPrototypes.length;
        }
        if (_rarity == 2) {
            return rareCardPrototypes.length;
        }
        if (_rarity == 3) {
            return epicCardPrototypes.length;
        }
        if (_rarity == 4) {
            return legendaryCardPrototypes.length;
        }
        if (_rarity == 100) {
            return promoCardPrototypes.length;
        }
        if (_rarity == 200) {
            return artCardPrototypes.length;
        }
    }

    function getCardRarityArray(uint256 _rarity) public view returns(uint32[]) {
        if (_rarity == 0) {
            return totemCardPrototypes;
        }
        if (_rarity == 1) {
            return commonCardPrototypes;
        }
        if (_rarity == 2) {
            return rareCardPrototypes;
        }
        if (_rarity == 3) {
            return epicCardPrototypes;
        }
        if (_rarity == 4) {
            return legendaryCardPrototypes;
        }
        if (_rarity == 100) {
            return promoCardPrototypes;
        }
        if (_rarity == 200) {
            return artCardPrototypes;
        }
    }

    function getCardByRarity(uint256 _rarity, uint256 _index) public view returns(uint32) {
        if (_rarity == 0) {
            return totemCardPrototypes[_index];
        }
        if (_rarity == 1) {
            return commonCardPrototypes[_index];
        }
        if (_rarity == 2) {
            return rareCardPrototypes[_index];
        }
        if (_rarity == 3) {
            return epicCardPrototypes[_index];
        }
        if (_rarity == 4) {
            return legendaryCardPrototypes[_index];
        }
        if (_rarity == 100) {
            return promoCardPrototypes[_index];
        }
        if (_rarity == 200) {
            return artCardPrototypes[_index];
        }
    }

    function claimSales(uint256 _auctionId) public payable {
        //Allow an auction owner to claim owed sales from an auction

        //Sender should be auction owner
        //Auction should be closed (inactive)
        //Auction should have balanceOwed
        //Must wait at least 7 blocks before claiming auction balance owed
        //Contract balance owed must be >= requested amount
        //Contract balance must be >= requested amount

        auctionPrototype auction = auctionIdToAuction[_auctionId];
        require(msg.sender == auctionIdToOwner[_auctionId]);
        require(auctionActive[_auctionId] == false);
        require(auction.balanceOwed > 0 wei);
        require(auctionIdToBalanceOwed[_auctionId] > 0 wei);
        require(auction.lastActiveBlock + 6 < block.number);
        require(contractBalanceOwed >= auction.balanceOwed);
        require(address(this).balance >= auction.balanceOwed);

        //Update contract balance owed
        contractBalanceOwed = contractBalanceOwed - auction.balanceOwed;

        //Clear auction balance owed
        uint256 balanceTemp = auction.balanceOwed;
        auctionIdToAuction[_auctionId].lastActiveBlock = block.number;
        auctionIdToAuction[_auctionId].balanceOwed = 0;
        auctionIdToBalanceOwed[_auctionId] = 0;
        
        //Transfer value
        msg.sender.transfer(balanceTemp);
    }
    
    /* ----------------------- Modifiers -----------------------*/
    //Owner is only one who can cash out ether
    //Owner is only one who can add admin
    //Owner is only one who can assign governance access
    //Admin don't do nothin right now..
    //Governance is for a separate contract that will allow voting on new cards and card attributes
    //Governance and owner are only ones who can create and modify card prototypes
    
    modifier onlyOwner() {
        require(msg.sender == owner); 
        _;
    }
    
    modifier onlyAdmin() {
        require(admin[msg.sender]);
        _;
    }
    
    modifier onlyGovernance() {
        require(governance[msg.sender]);
        _;
    }
    
    /* ----------------------- Administrative Functions -----------------------*/
    // Payable fallback function 
    // Owner can cash out contract ether to another address (parameter value in wei)
    // Owner can set another owner, set admin, remove admin, set governance, remove governance 
    // The governance contract will be a voting system allowing players to vote on new cards and modify existing cards
    // Owner can set price of cards in packs (cardPackPrice)
    // Owner can set price of individual cards (cardPrices[card])
    // Owner can set maximum number of cards that can be purchased in a pack
    // Owner can set whether totem use is allowed (turned off during new set addition)
    // Owner can set the art address that tracks fine art prints associated with Merkle Bros
    // Governance can set the art url that links to art and other metadata for a given cardPrototypeId
    // Owner can set the auction address 
    // Owner can set the flag for whether to allow auction delegation to another contract
    // Owner can set the fee for the auction house to collect when a purchase is made from another player
    // Owner can set an upgrade contract if this one is deprecated
    // Governance can set whether free transfers are allowed
    
    function () payable public {
        //Only owner can send money to contract (let's not take people's money if they aren't buying anything)
        require(msg.sender == owner);
    }
    
    function cashOut(address _to, uint256 _value) public payable onlyOwner() {
        _to.transfer(_value);
    } 
    
    function setOwner(address _owner) onlyOwner() public {
        owner = _owner;
    }
    
    function setAdmin(address _admin) onlyOwner() public {
        admin[_admin] = true;
    }
    
    function removeAdmin(address _admin) onlyOwner() public {
        delete admin[_admin];
    }
    
    function setGovernance(address _governance) onlyOwner() public {
        governance[_governance] = true;
    }
    
    function removeGovernance(address _governance) onlyOwner() public {
        delete governance[_governance];
    }
    
    function setCardPackPrice(uint256 _price) onlyOwner() public {
        cardPackPrice = _price;
    }
    
    function setCardPriceAndAmount(uint32 _cardPrototypeId, uint256 _price, uint256 _amount) onlyOwner() public {
        cardPrices[_cardPrototypeId] = _price;
        cardAmounts[_cardPrototypeId] = _amount;
    }
    
    function setCardPackAmount(uint256 _amount) onlyOwner() public {
        cardPackAmount = _amount;
    }
    
    function setAllowTotem(bool _allow) onlyGovernance() public {
        allowTotem = _allow;
    }
    
    function setArtAddress(address _address) onlyOwner() public {
        artAddress = _address;
    }
    
    function setArtUrl(uint32 _cardPrototypeId, bytes32 _url) onlyGovernance() public {
        artUrl[_cardPrototypeId] = _url;
    }

    function setAuctionAddress(address _address) onlyOwner() public {
        auctionAddress = _address;
    }

    function setDelegateAuction(bool _delegate) onlyOwner() public {
        delegateAuction = _delegate;
    }

    function setAuctionFee(uint256 _price) onlyOwner() public {
        auctionFee = _price;
    }

    function upgradeContract(address _address) onlyOwner() public {
        upgradeAddress = _address;
    }

    function setFreeTransfer(bool _setting) onlyGovernance() public {
        freeTransferAllowed = _setting;
    }

    function setTransferFee(uint256 _fee) onlyGovernance() public {
        transferFee = _fee;
    }
    
    /* ----------------------- Struct for Card Prototype -----------------------*/
    // Card prototypes represent generic cards (a card plan, not a card instance). Instances of cards are represented by ERC-721 tokens which are mapped to a card prototype in tokenIdToCardPrototypeId;
    // Governance system (separate contract) will allow for voting on and modifying card prototypes
    // cardPrototypeId - Unique id
    // cardSet - Each card belongs to a set with similar themes ex Set 1 - 'Illustrations of Happy the Herbalist'. ALl totems belong to the 0th set, all promo cards to 9999th set, all fine art prints belong to 9000th set.
    // cardRarity - Current rarities are common(1), rare(2), epic(3), legendary(4), totems (0), promo(100), art(200)
    // cardActionPointCost - All cards have an action point cost to play
    // cardAttackValue - Fighter cards have an attack value, this should be 0 for resources
    // cardHealthValue - Fighter cards have a health value, this should be 0 for resources
    // cardActionOne - A key for the actions mapping that describes this action.
    // cardActionTwo - Cards can have up to three actions from the actions mapping
    // cardActionThree
    // cardActionOneValue - Value for the corresponding action ex 2 - 'Heal a friend for 2 health'
    // cardActionTwoValue
    // cardActionThreeValue
    // cardTitle - Title of card, ex "The Wizards of Ethereum"
    // cardArtist - Name of illustrator for the card art
    
    struct cardPrototype {
        uint32 cardPrototypeId;
        uint32 cardSet;
        uint8 cardRarity;
        uint8 cardActionPointCost; 
        uint8 cardAttackValue;
        uint8 cardHealthValue; 
        uint8 cardActionOne; 
        uint8 cardActionTwo;
        uint8 cardActionThree;
        uint8 cardActionOneValue; 
        uint8 cardActionTwoValue;
        uint8 cardActionThreeValue;
        bytes32 cardTitle; 
        bytes32 cardArtist; 
    }

    /* ----------------------- Struct for auctionPrototype -----------------------*/
    // Auctions allow players to list tokens for sale with a 'buy-now' price. 
    // auctionId - Unique id, incremented when an auction is created
    // tokenId - Unique id of the card to be sold.
    // price - Listing price for the card to be sold.
    // lastActiveBlock - Last block where auction was interacted with
    // balanceOwed - Balance owed to auction owner from contract for successful auction
    // owner - Address of auction creator and owner of token for sale
    // cardPrototypeId - Card prototype of card to be sold.
    // auctionActive - Whether auction is active (allows others to buy listed card)

    struct auctionPrototype {
        uint256 auctionId;
        uint256 tokenId;
        uint256 price;
        uint256 lastActiveBlock;
        uint256 balanceOwed;
        address owner;
        uint32 cardPrototypeId;
        bool auctionActive;
    }

    /* ----------------------- Mappings -----------------------*/
    //admin: Return whether an address has administrative rights
    //governance: Return whether an address has governance rights
    //artUrl: Return a url where art and other metadata for a given cardPrototypeId are stored
    //balances: How many tokens an address has
    //tokenIdToCardPrototypeId: Return a card prototype given a tokenId
    //cardPrototytpeIdToCardPrototype: A really long named mapping. Return cardPrototype instance given cardPrototypeId
    //cardPrototypeIdToNumberMinted: Return number of tokens that have been minted with a given cardPrototypeId
    //cardPrices: Return an individual card price given a cardPrototypeId
    //cardAmounts: Return how many of a card can be minted. This is only available for cards that have had their prices individually set by owner
    //cardActions: Return a card action (bytes32 string) given a key (uint8). Card actions are possible actions associated with playing a card (ex draw from deck, heal a friend, damage an enemy, etc)
    //cardSetArrays: Return an array of cardPrototypeIds that make up a set given a set id
    //cardSetToRarity: Return the rarity of a given set id
    //ownerToCardSetArray: Return what cards are owned (cardPrototypeId) in a given set by a given owner. Owner can use this to claim a totem if they have all cards in a set
    //cardSetToTotem: Return a totem (cardPrototypeId) that represents a given set id
    //totemToRarity: Return the rarity associated with a given totem(cardPrototypeId) (rarity is the rarity of cards that a totem generates)
    //totemUsed: Return whether a totem instance (tokenId) has been used to claim a card from a given set
    //tokenIdToOwner: Return address given tokenId
    //tokenIdToApproved: Return approved address given a tokenId
    //ownerToTokenIdArray: Return tokenId given an address
    //tokenIdToOwnerArrayIndex: Return index in owner's token array given tokenId
    //auctionIdToAuction: Return an auctionPrototype given an auctionId
    //auctionIdToTokenId: Return a tokenId given an auctionId
    //tokenIdToAuctionId: Return an auctionId given an tokenId
    //auctionIdToOwner: Return an auction owner given an auctionId
    //auctionIdToPrice: Return a sale price given an auctionId
    //auctionIdToCardPrototypeId: Return a cardPrototypeId given an auctionId
    //auctionActive: Return whether an auction is active (boolean) given an auctionId
    //auctionIdToBalanceOwed: Return balanceOwed to auction owner given an auctionId
    
    mapping (address => bool) public admin;
    mapping (address => bool) public governance;
    mapping (uint32 => bytes32) public artUrl;
    mapping (address => uint256) public balances;
    mapping (uint256 => uint32) public tokenIdToCardPrototypeId;
    mapping (uint32 => cardPrototype) public cardPrototytpeIdToCardPrototype;
    mapping (uint32 => uint256) public cardPrototypeIdToNumberMinted;
    mapping (uint32 => uint256) public cardPrices;
    mapping (uint32 => uint256) public cardAmounts;
    mapping (uint8 => bytes32) public cardActions;
    mapping (uint32 => bytes32) public setTitles;
    mapping (uint32 => bool) public setExists;
    mapping (uint32 => uint32[]) public cardSetArrays;
    mapping (uint32 => uint8) public cardSetToRarity;
    mapping (address => mapping(uint32 => uint32[])) ownerToCardSetArray;
    mapping (uint32 => uint32) public cardSetToTotem;
    mapping (uint32 => uint8) public totemToRarity;
    mapping (uint256 => mapping(uint32 => bool)) public totemUsed;
    mapping (uint256 => address) public tokenIdToOwner;
    mapping (uint256 => address) public tokenIdToApproved;
    mapping (address => uint256[]) public ownerToTokenIdArray;
    mapping (uint256 => uint256) public tokenIdToOwnerArrayIndex;
    mapping (uint256 => auctionPrototype) public auctionIdToAuction;
    mapping (uint256 => uint256) public auctionIdToTokenId;
    mapping (uint256 => uint256) public tokenIdToAuctionId;
    mapping (uint256 => address) public auctionIdToOwner;
    mapping (uint256 => uint256) public auctionIdToPrice;
    mapping (uint256 => uint32) public auctionIdToCardPrototypeId;
    mapping (uint256 => bool) public auctionActive;
    mapping (uint256 => uint256) public auctionIdToBalanceOwed;
    
    //Arrays for tracking whether cardPrototypeIds are common, rare, epic, legendary, totem, promotional, or art
    //Used to generate random cards when buying packs (common, rare, epic, lengendary)
    //Promo and art cards may be purchased after setting price and amount via buyCard function
    uint32[] commonCardPrototypes;
    uint32[] rareCardPrototypes;
    uint32[] epicCardPrototypes;
    uint32[] legendaryCardPrototypes;
    uint32[] totemCardPrototypes;
    uint32[] promoCardPrototypes;
    uint32[] artCardPrototypes;
    
    /* ----------------------- ERC-721 Functions -----------------------*/
    //Functions to implement ERC-721 requirements
    //See https://github.com/ethereum/EIPs/issues/721
    //Functions for name, symbol, supply, balances of tokens, owner of a token
    //Functions for approval, taking ownership, and transfering tokens
    //ownerOf: Check owner of a token
    //tokenOfOwnerByIndex: Return a tokenId given an owner and an index in ownerToTokenIdArray
    //approve: Function for approving another address to take ownership of a token. Only one address can have approval.
    //Approval event must fire on setting new approval, changing approval, reaffirming (self) approval, and clearing approval 
    //takeOwnership: Function for allowing an approved address to claim ownership of a token
    //takeOwnerhsip is just a series of requires() before calling _transfer function
    //transfer: Default transfer function for ERC-721. Should be called by token owner
    //_transfer: Modified internal transfer function to accomodate takeOwnership and transfer

    function name() public pure returns (string){
        return "Merkle Bros";
    }
    
    function symbol() public pure returns (string) {
        return "MRKLBROS";
    }
    
    function totalSupply() public view returns (uint256) {
        return tokenCount - 1;
    }
    
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }
    
    function ownerOf(uint256 _tokenId) public view returns (address) {
        require(tokenIdToOwner[_tokenId] != 0);                 //Token cannot be owned by 0 address (means token was destroyed)
        require(_tokenId < tokenCount);                         //Check if token exists
        return tokenIdToOwner[_tokenId];
    }
    
    function tokenOfOwnerByIndex(address _owner, uint256 _index) public view returns (uint256) {
        require(_index < ownerToTokenIdArray[_owner].length);
        return ownerToTokenIdArray[_owner][_index];
    }
    
    function approve(address _to, uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender);               //Check if token owner is calling function
        require(_tokenId < tokenCount);                         //Check if token exists / is tracked by this contract
        require(msg.sender != _to);                             //Cannot approve yourself
        
        if (_to == 0 && tokenIdToApproved[_tokenId] != 0) {     //Owner may clear approval by approving the 0 address
            delete tokenIdToApproved[_tokenId];
            emit Approval(msg.sender, 0, _tokenId);
            return;
        }

        if (_to == tokenIdToApproved[_tokenId]) {               //Owner can reaffirm approval (just fire Approval event again)
            emit Approval(msg.sender, _to, _tokenId);
            return;
        }

        else {                                                  //Owner can set a new approval
            tokenIdToApproved[_tokenId] = _to;
            emit Approval(msg.sender, _to, _tokenId);
        }
    }
    
    function takeOwnership(uint256 _tokenId) public  {
        require(tokenIdToApproved[_tokenId] == msg.sender);            //Message sender should be approved to take ownership
        require(_tokenId < tokenCount);                                //Check if token exists / is tracked by this contract
        require(msg.sender != tokenIdToOwner[_tokenId]);               //Owner cannot take ownership of a token they already own
        _transfer(tokenIdToOwner[_tokenId], msg.sender, _tokenId);     //Call transfer function
    }

    function payTransfer(address _to, uint256 _tokenId) external payable {
        //Free transfers may be turned off to prevent people endlessly spawning totems
        require(msg.value >= transferFee);                             //Owner must pay fee to transfer
        require(_to != address(this));                                 //Prevent sending cards to the contract address
        require(ownerOf(_tokenId) == msg.sender);                      //Only token owner can call default transfer function, approval is implicit here so no need to call approve

        _transfer(msg.sender, _to, _tokenId);
    }
    
    function transfer(address _to, uint256 _tokenId) external {
        require(freeTransferAllowed);                                  //Free transfers must be allowed
        require(_to != address(this));                                 //Prevent sending cards to the contract address
        require(ownerOf(_tokenId) == msg.sender);                      //Only token owner can call default transfer function, approval is implicit here so no need to call approve
        
        _transfer(msg.sender, _to, _tokenId);
    }
    
    function _transfer(address _from, address _to, uint256 _tokenId) internal {
        require(ownerOf(_tokenId) == _from);
        require(_to != address(0));
        
        tokenIdToOwner[_tokenId] = _to;             //Transfer token
        delete tokenIdToApproved[_tokenId];         //Clear approved for next owner
        
        //Updating token array and index for old owner
        //This finds the array element to delete, sets it to the value of the last array element
        //and then deletes the last array element and decrements array length
        //See https://medium.com/@robhitchens/solidity-crud-part-2-ed8d8b4f74ec
        uint256 indexToDelete = tokenIdToOwnerArrayIndex[_tokenId];
        uint256 arrayLength = ownerToTokenIdArray[_from].length;
        uint256 movingArrayElement = ownerToTokenIdArray[_from][arrayLength - 1];
        
        ownerToTokenIdArray[_from][indexToDelete] = movingArrayElement;
        tokenIdToOwnerArrayIndex[movingArrayElement] = indexToDelete;
        delete ownerToTokenIdArray[_from][arrayLength - 1]; 
        ownerToTokenIdArray[_from].length--;
        
        balances[_from]--;
        
        //Updating token array and array index for new owner
        ownerToTokenIdArray[_to].push(_tokenId);
        tokenIdToOwnerArrayIndex[_tokenId] = ownerToTokenIdArray[_to].length - 1;
        balances[_to]++;

        //Start of logic relating to totems and tracking owned cards in a set
        //This section checks whether _to already owns an instance of this card
        //This is tracked so that _to can claim a totem from the contract if they own all cards in a set
        
        uint32 cardPrototypeId = tokenIdToCardPrototypeId[_tokenId];

        //Set that transfered card belongs to
        uint32 set = cardPrototytpeIdToCardPrototype[cardPrototypeId].cardSet;
        uint32[] ownedCardsInSet = ownerToCardSetArray[_to][set];                  //An array of cardPrototypeIds representing cards in this set that _owner owns
        bool owned = false;                                                        //Flag for whether owner already owns an instance of this card
        
        //Checking if owner already has this card
        if (ownedCardsInSet.length != 0) {
          for (uint256 i = 0; i < ownedCardsInSet.length; i++) {
              if (ownedCardsInSet[i] == cardPrototypeId) {
                //owner already owns this card, no need to check further
                owned = true;
                break;
                }
            }
        }
        
        //If owner did not own card, push card to array in ownerToCardSetArray
        if (owned == false) {
          ownerToCardSetArray[_to][set].push(cardPrototypeId);
        }
        
        emit Transfer(_from, _to, _tokenId);
    }
    
  /* ----------------------- Card Management Functions -----------------------*/
  //Functions for managing cards including buying, minting, and auctions
  //buyCard - Buy a specific card by paying the card price set by owner
  //buyCards - Buy a pack of cards by specifying amount of cards and paying cardPackPrice * amount
  //mintCard - Mints an ERC-721 token (tokenId) representing a card instance
  //mintCardOwner - Owner can mint promo and art cards for giveaways
  //claimTotem - Owner can claim a totem if they have all cards of a given set
  //useTotem - Use a totem to claim a random card from a given set
  //createCardPrototype - Create a new cardPrototype, only callable by owner and governance contract
  //modifyCardPrototype - Modify an existing card prototype, only callable by owner and governance contract
  //createSet - Mark a set as existing with setExists, give set a title with setTitles, set rarity with cardSetToRarity
  //setTotemToSet - Set the totem that a player can claim after collecting all cards in a given set
  //createAction - Create an action to use for card prototypes. These will require logic server-side (for game), so only contract owner can modify these
  //createAuction - Create an auction given a price and tokenId
  //closeAuction - Close an auction given an auctionId (public callable only by auction owner)
  //_closeAuction - Close an auction when a card is sold via buyAuction (internal callable only in buyAuction)
  //buyAuction - Player buys a specific card by paying the auction price. This closes the auction.
  
    function buyCard(uint32 _cardPrototype) public payable {
        require(cardPrices[_cardPrototype] <= msg.value);            //Buyer must pay at least the purchase price
        require(cardPrices[_cardPrototype] != 0);                    //Can only buy cards that have prices set
        require(cardAmounts[_cardPrototype] > 0);                    //Must be cards available to buy
        
        cardAmounts[_cardPrototype]--;
        mintCard(msg.sender, _cardPrototype);
    }
    
    function buyCards(uint256 _amount) public payable {
        require(_amount <= cardPackAmount);                    //Buyer can only buy up to as many cards per pack as is allowed
        require(cardPackPrice * _amount <= msg.value);         //Buyer must pay at least the purchase price

        for (uint256 i = 0; i < _amount; i++) {                //Generate _amount of random cards and mint them
            mintCard(msg.sender, getRandomCard(_amount + i));
        }
    }
    
    function mintCard(address _owner, uint32 _cardPrototype ) internal {
      
        //Start of logic relating to totems and tracking owned cards in a set
        //This section checks whether _owner already owns an instance of this card
        //This is tracked so that _owner can claim a totem from the contract if they own all cards in a set
        
        uint32 set = cardPrototytpeIdToCardPrototype[_cardPrototype].cardSet;         //Set that the minted card belongs to
        uint32[] ownedCardsInSet = ownerToCardSetArray[_owner][set];                  //An array of cardPrototypeIds representing cards in this set that _owner owns
        bool owned = false;                                                           //Flag for whether owner already owns an instance of this card
        
        //Checking if owner already has this card
        if (ownedCardsInSet.length != 0) {
          for (uint256 i = 0; i < ownedCardsInSet.length; i++) {
              if (ownedCardsInSet[i] == _cardPrototype) {
                //owner already owns this card, no need to check further
                owned = true;
                break;
                }
            }
        }
        
        //If owner did not own card, push card to array in ownerToCardSetArray
        if (owned == false) {
          ownerToCardSetArray[_owner][set].push(_cardPrototype);
        }
        
        //End of logic relating to totems and tracking owned cards in a set
        
        //Updating data structures related to owner and token
        tokenIdToOwner[tokenCount] = _owner;
        ownerToTokenIdArray[_owner].push(tokenCount);
        tokenIdToOwnerArrayIndex[tokenCount] = ownerToTokenIdArray[_owner].length - 1;
        tokenIdToCardPrototypeId[tokenCount] = _cardPrototype;
        balances[_owner]++;
        
        //temp to store token count for event
        uint256 tempTokenCount = tokenCount;
        tokenCount++;

        cardPrototypeIdToNumberMinted[_cardPrototype] = cardPrototypeIdToNumberMinted[_cardPrototype] + 1;

        //Emit events (MintCard for normal token) and also MintArtCard if the cardPrototype belongs to the art set (set 9000, rarity 200)
        
        if (set == 9000) {
            emit MintArtCard(_owner, tempTokenCount, _cardPrototype);
        }
        emit MintCard(_owner, tempTokenCount, _cardPrototype);
    }

    function mintCardOwner(address _to, uint256 _amount, uint32 _cardPrototype) public onlyOwner() {

        //Owner can mint promo and art cards (and only these types of cards)
        require(cardPrototytpeIdToCardPrototype[_cardPrototype].cardRarity == 100 || cardPrototytpeIdToCardPrototype[_cardPrototype].cardRarity == 200);

        //Mint cards
        for (uint256 i = 0; i < _amount; i++) {                //Generate _amount of cards and mint them
            mintCard(_to, _cardPrototype);
        }
    }
  
    function claimTotem(uint32 _setId) public { 
        //Player can claim a set's totem if they have all cards in the set
        
        require(_setId != 0);                                              //Can't claim totem from the totem set (set 0)
        require(setExists[_setId]);                                        //Set should exist
        require(cardSetArrays[_setId].length != 0);                        //Can't claim totem from a set that has no cards
        
        uint32 totemId = cardSetToTotem[_setId];                           //Totem associated with this set        
        require(totemId != 0);                                             //Set should have a totem assigned to it
        
        uint32[] ownedCards = ownerToCardSetArray[msg.sender][_setId];     //Owned cards in set
        require(ownedCards.length == cardSetArrays[_setId].length);        //Player should own all cards in the set (duplicates are prevented in mintCards)

        uint32[] ownedTotems = ownerToCardSetArray[msg.sender][0];         //Array of owned totems (all totems belong to set 0)
        for (uint256 i = 0; i < ownedTotems.length; i++) {
            require(ownedTotems[i] != totemId);                            //Player should not already own the totem for this set
        }
        mintCard(msg.sender, totemId);
    }
    
    function useTotem(uint256 _totemId, uint32 _setId) public {
        //Use totem to generate a card of a certain rarity from a given set
        
        //Totem use must be enabled
        //Caller must own this totem
        //Totems cannot be used to generate from set 0 (totems belong to set 0), and can only generate from existing sets
        //Totem must not have been used to claim a card from this set already
        //Totem must be an existing token (tokenIds are 1 to tokenCount - 1)
        require(allowTotem);
        require(tokenIdToOwner[_totemId] == msg.sender);
        require(_setId != 0 && setExists[_setId]);
        require(!totemUsed[_totemId][_setId]);
        require(_totemId > 0 && _totemId < tokenCount);
        
        uint32 cardPrototypeId = tokenIdToCardPrototypeId[_totemId];
        
        //_totemId must be a totem (totems have rarity == 0)
        //The card rarity that the totem generates must be the same as the set rarity to generate from (cardActionPointCost is overriden for tracking this)
        require(cardPrototytpeIdToCardPrototype[cardPrototypeId].cardRarity == 0); 
        require(cardPrototytpeIdToCardPrototype[cardPrototypeId].cardActionPointCost == cardSetToRarity[_setId]);
        
        mintCard(msg.sender, getRandomCardFromSet(_setId));
        totemUsed[_totemId][_setId] = true;

        emit UseTotem(msg.sender, _totemId, _setId);
    }
  
    function createCardPrototype(
        //Note, if creating a totem prototype, use _cardActionPointCost to set rarity of cards the totem will generate(1 = common, 2 = rare, 3 = epic)
        //All other values for totems will be 0 except for _cardTitle and _cardArtist (0, 0, [1,2,3], [1,2,3..n], 0, 0, 0, 0, 0, 0, 0, _cardTitle, _cardArtist)
        //Promo cards should be _cardRarity == 100 and _cardSet == 9999
        //Fine art prints should be _cardRarity == 200 and _cardSet == 9000
        uint32 _cardSet,
        uint8 _cardRarity,
        uint8 _cardActionPointCost,
        uint8 _cardAttackValue,
        uint8 _cardHealthValue,
        uint8 _cardActionOne,
        uint8 _cardActionTwo,
        uint8 _cardActionThree, 
        uint8 _cardActionOneValue,
        uint8 _cardActionTwoValue,
        uint8 _cardActionThreeValue, 
        bytes32 _cardTitle, bytes32 _cardArtist) public onlyGovernance() {
        
        //Card rarity must be one of totems = 0, common = 1, rare = 2, epic = 3, legendary = 4, promo = 100, art = 200
        require(_cardRarity == 0 || _cardRarity == 1 || _cardRarity == 2 || _cardRarity == 3 || _cardRarity == 4 || _cardRarity == 100 || _cardRarity == 200);
            
       //Only totem cards (rarity 0) belong to set 0 
       if(_cardSet == 0) { require(_cardRarity == 0); } 
       
       //Only promo cards (rarity 100) belong to set 9999
       if(_cardSet == 9999) { require(_cardRarity == 100); } //Only promo cards can belong to set 9999      
       
       //Only art cards (rarity 200) belong to set 9000
       if(_cardSet == 9000) { require(_cardRarity == 200); }

       //Set should exist. If does not exist, add set using createSet. This was necessary because of 'stack too deep here'..
       //Also card rarity should be the same as its set
       require(setExists[_cardSet]);
       require(_cardRarity == cardSetToRarity[_cardSet]);
        
       //Only allow setting actions that exist
       require(_cardActionOne < cardActionsCount);
       require(_cardActionTwo < cardActionsCount);
       require(_cardActionThree < cardActionsCount);
       
       //Logic for updating totem data structures
        if(_cardRarity == 0) {          
            require(_cardSet == 0); //Totems belong to set 0
            require(_cardActionPointCost == 1 || _cardActionPointCost == 2 || _cardActionPointCost == 3); //Totems can only generate common, rare, and epic cards
            
            //Store rarity of the sets that totem can generate a card from
            totemToRarity[cardPrototypeCount] = _cardActionPointCost;

            //Store totem in totems array
            totemCardPrototypes.push(cardPrototypeCount);
        }
        
        //Logic for updating common cards data structures
        if(_cardRarity == 1) {

            //Store card in common cards array
            commonCardPrototypes.push(cardPrototypeCount);
        }
        
        //Logic for updating rare cards data structures
        if(_cardRarity == 2) {

            //Store card in rare cards array
            rareCardPrototypes.push(cardPrototypeCount);
        }    
        
        //Logic for updating epic cards data structures
        if(_cardRarity == 3) {

            //Store card in epic cards array
            epicCardPrototypes.push(cardPrototypeCount);
        }
        
        //Logic for updating legendary cards data structures
        if(_cardRarity == 4) {
            
            //Store card in legendary cards array
            legendaryCardPrototypes.push(cardPrototypeCount);
        }
        

        //Logic for updating promo card data structure
        if(_cardRarity == 100) {
            require(_cardSet == 9999);
            
            //Store promo card in promo cards array
            promoCardPrototypes.push(cardPrototypeCount);
        }

        //Logic for updating art card data structure
        if(_cardRarity == 200) {
            require(_cardSet == 9000);
            
            //Store art card in art cards array
            artCardPrototypes.push(cardPrototypeCount);
        }

        
        //Store card in its set
        cardSetArrays[_cardSet].push(cardPrototypeCount);
        
        //Make a new cardPrototype
        cardPrototytpeIdToCardPrototype[cardPrototypeCount] = cardPrototype(cardPrototypeCount, _cardSet, _cardRarity, _cardActionPointCost, _cardAttackValue, _cardHealthValue, _cardActionOne, _cardActionTwo, _cardActionThree, _cardActionOneValue, _cardActionTwoValue,  _cardActionThreeValue, _cardTitle, _cardArtist);

        uint32 tempCount = cardPrototypeCount;      //Temp count so we can call event last
        cardPrototypeCount++;
        
        emit CreateCardPrototype(msg.sender, tempCount);
    }
    
    function modifyCardPrototype(
        uint32 _cardPrototypeId, uint8 _cardActionPointCost, uint8 _cardAttackValue,
        uint8 _cardHealthValue, uint8 _cardActionOne, uint8 _cardActionTwo, uint8 _cardActionThree, uint8 _cardActionOneValue,
        uint8 _cardActionTwoValue, uint8 _cardActionThreeValue) 
        public onlyGovernance() {
            
        //Cannot delete card prototypes but can modify them by governance vote
        //Can't modify card prototype id, card set, card rarity, card title, card artist
        //Can modify action point cost, attack value, health value, card actions one, two three, card action values one, two , three
        
        //Card prototype should exist
        //Cannot modify totems
        //Updated actions must be actions that exist
        require(_cardPrototypeId > 0 && _cardPrototypeId < cardPrototypeCount);
        require(cardPrototytpeIdToCardPrototype[_cardPrototypeId].cardSet != 0);
        require(_cardActionOne < cardActionsCount);
        require(_cardActionTwo < cardActionsCount);
        require(_cardActionThree < cardActionsCount);
        
        //Set new attributes (one at a time to avoid stack too deep)
        cardPrototytpeIdToCardPrototype[_cardPrototypeId].cardActionPointCost = _cardActionPointCost;
        cardPrototytpeIdToCardPrototype[_cardPrototypeId].cardAttackValue = _cardAttackValue;
        cardPrototytpeIdToCardPrototype[_cardPrototypeId].cardHealthValue = _cardHealthValue;
        cardPrototytpeIdToCardPrototype[_cardPrototypeId].cardActionOne = _cardActionOne;
        cardPrototytpeIdToCardPrototype[_cardPrototypeId].cardActionTwo = _cardActionTwo;
        cardPrototytpeIdToCardPrototype[_cardPrototypeId].cardActionThree = _cardActionThree;
        cardPrototytpeIdToCardPrototype[_cardPrototypeId].cardActionOneValue = _cardActionOneValue;
        cardPrototytpeIdToCardPrototype[_cardPrototypeId].cardActionTwoValue = _cardActionTwoValue;
        cardPrototytpeIdToCardPrototype[_cardPrototypeId].cardActionThreeValue = _cardActionThreeValue;
        
        emit ModifyCardPrototype(msg.sender, _cardPrototypeId);
    }

    function createSet(uint32 _setId, bytes32 _setTitle, uint8 _cardRarity) public onlyGovernance() {
        require(!setExists[_setId]);    //Set shouldn't already exist
        setExists[_setId] = true;
        setTitles[_setId] = _setTitle;
        cardSetToRarity[_setId] = _cardRarity;

        emit AddSet(msg.sender, _setId, _setTitle, _cardRarity);
    }
    
    function setTotemToSet(uint32 _totemId, uint32 _setId) public onlyGovernance() {
        //Require that the set exists
        //Require that the set is the same rarity as the cards the totem will generate
        require(setExists[_setId]);
        require(totemToRarity[_totemId] == cardSetToRarity[_setId]);
        cardSetToTotem[_setId] = _totemId;

        emit SetTotemToSet(msg.sender, _totemId, _setId);
    }    
   
    function createAction(bytes32 _action) public onlyOwner() {
        
        //New action should not already exist
        for (uint8 i = 0; i < cardActionsCount; i++) {
            require(cardActions[i] != _action);
        }
        
        cardActions[cardActionsCount] = _action;
        uint8 tempActionsCount = cardActionsCount; //Store actions count for event
        
        cardActionsCount++;
        emit AddAction(msg.sender, tempActionsCount, _action);
    }

    function createAuction(uint256 _tokenId, uint256 _price) public {
        //Function for creating an auction stuct and listing a card for sale
        //    struct auctionPrototype {
        //    uint256 auctionId;
        //    uint256 tokenId;
        //    uint256 price;
        //    address owner;
        //    uint32 cardPrototypeId;
        //    bool auctionActive; }

        //Require delegate auction is off
        require(!delegateAuction);

        //Require auction creator is owner of this token
        require(ownerOf(_tokenId) == msg.sender);

        //Require token exists
        require(_tokenId > 0 && _tokenId < 2**255);

        //Require auction price is >0 and < 2^255
        require(_price > 0 && _price < 2**255);

        uint256 auctionId = tokenIdToAuctionId[_tokenId];

        //If auctionId == 0, token has never been auctioned before
        //If token has been auctioned before, check that the last auction is inactive
        if(auctionId != 0) {
            auctionPrototype auction = auctionIdToAuction[auctionId];
            require(auction.auctionActive != true);
        }

        //Create a new auction
        auctionIdToAuction[auctionCount] = auctionPrototype(auctionCount, _tokenId, _price, block.number, 0, msg.sender, tokenIdToCardPrototypeId[_tokenId], true);

        //Update auction mappings:
        auctionIdToTokenId[auctionCount] = _tokenId;
        tokenIdToAuctionId[_tokenId] = auctionCount;
        auctionIdToOwner[auctionCount] = msg.sender;
        auctionIdToPrice[auctionCount] = _price;
        auctionIdToCardPrototypeId[auctionCount] = tokenIdToCardPrototypeId[_tokenId];
        auctionActive[auctionCount] = true;

        uint256 tempAuctionCount = auctionCount;
        auctionCount++;

        emit CreateAuction(msg.sender, tempAuctionCount, _tokenId);
        emit SetAuctionPrice(tempAuctionCount, _price);
    }

    function closeAuction(uint256 _auctionId) public {
        //Wrapper function for closing an auction used for auction owner to close auction without a sale

        //Require delegate auction is off
        require(!delegateAuction);

        //Require auction exists
        require(_auctionId > 0 && _auctionId < auctionCount);

        //Require auction is active
        require(auctionActive[_auctionId]);

        //Require owner is auction owner
        require(auctionIdToOwner[_auctionId] == msg.sender);

        _closeAuction(_auctionId);
    }

    function _closeAuction(uint256 _auctionId) internal {
        //Function for closing an auction, called by closeAuction and by buyAuction when an auction sale occurs

        //Set auction inactive (mapping and auction instance)
        auctionActive[_auctionId] = false;
        auctionIdToAuction[_auctionId].auctionActive = false;

        emit CloseAuction(_auctionId);
    }

    function buyAuction(uint256 _auctionId) public payable {
        //Function for buying a listed card for the given price + auction house fee

        //Require delegate auction is off
        require(!delegateAuction);

        //Require auction exists
        require(_auctionId > 0 && _auctionId < auctionCount);

        //Require auction is active
        require(auctionActive[_auctionId]);

        //Require auction price is >0 and < 2^255
        require(msg.value > 0 && msg.value < 2**255);


        //Require paid amount is == listing price + auction house fee
        require(msg.value == auctionIdToPrice[_auctionId] + auctionFee);

        //Maybe protecting against oveflows, make sure value sent is >= listing price
        require(msg.value >= auctionIdToPrice[_auctionId]);

        //Require caller is not the owner of the auction
        require(auctionIdToOwner[_auctionId] != msg.sender);

        //Close auction (set inactive)
        _closeAuction(_auctionId);

        //Transfer token to new owner
        _transfer(auctionIdToOwner[_auctionId], msg.sender, auctionIdToTokenId[_auctionId]);

        //Update auction balance owed to auction owner address (allow addresses to claim owed funds via new function)
        auctionIdToAuction[_auctionId].balanceOwed = auctionIdToPrice[_auctionId];
        auctionIdToBalanceOwed[_auctionId] = auctionIdToPrice[_auctionId];

        auctionIdToAuction[_auctionId].lastActiveBlock = block.number;

        //Update sum total owed for contract
        contractBalanceOwed = contractBalanceOwed + auctionIdToPrice[_auctionId];

        emit BuyAuction(msg.sender, _auctionId, auctionIdToPrice[_auctionId]);
    }
}