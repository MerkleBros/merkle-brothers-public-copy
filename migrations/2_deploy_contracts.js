var MerkleBros = artifacts.require('./MerkleBros');
module.exports = function(deployer) {
	deployer.deploy(MerkleBros);
};