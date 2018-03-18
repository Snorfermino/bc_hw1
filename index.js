
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:7545"));


var abi = JSON.parse('[{"constant":false,"inputs":[{"name":"player","type":"address"},{"name":"number","type":"uint256"}],"name":"indexOfNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"generateWinner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"numberSelected","type":"uint256"}],"name":"pickNumber","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"numberOfBets","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"player","type":"address"}],"name":"checkPlayerExist","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"winningNumber","type":"uint256"}],"name":"distributePrizes","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getPlayers","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minimumBet","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxAmountOfBets","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"range","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"players","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalBet","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_minumBet","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"winningNumber","type":"uint256"},{"indexed":false,"name":"winningAmount","type":"uint256"}],"name":"EndOfBet","type":"event"}]');
var contract = web3.eth.contract(abi);
var contractInstance = contract.at('0xf25186b5081ff5ce73482ad761db0eb0d25abfbf');

var endofBet = contractInstance.EndOfBet({_from: web3.eth.accounts[0]});
endofBet.watch(function(err, result) {
    if(err) {
        console.log(err);
        return;
    }
    generateWinner(result.args.winningNumber,result.args.winningAmount)
    console.log("Number: " + result.args.winningNumber);
    console.log("Win Amount: " + result.args.winningAmount);

    endofBet.stopWatching();
});
function callPickNumber() {
    // call the contract
    var number = parseInt(document.getElementById('number').value);
    var value = parseInt(document.getElementById('value').value);
    console.log('Account: ', web3.eth.accounts[0])
    console.log('Value: ', web3.toWei(value, 'ether'))
    console.log('Number: ', number)
    var random = ""
    randomPlayer(function(playerAddress) {
        random = playerAddress
        console.log(playerAddress);
    });
    contractInstance.pickNumber(number, { from: random, gas: 4700000, value: web3.toWei(value, 'ether') }, (error) => {
        console.log('err', error);
    });
    updateUI();
}

function randomPlayer(callback){
    var max = web3.eth.accounts.length;
    var i =  Math.floor(Math.random()*(max-1-0+1)+0);
    console.log('Max Index: ',max);
    console.log('Random Index: ',i);
    callback(web3.eth.accounts[i]);
}

function generateWinner(winningNumber,prize) {
    $("#result").html("The winning number is: " + winningNumber );
    $("#winAmount").html("Prize: " + prize / Math.pow(10, 18));
}

function updateUI(){
    var totalBet = parseInt(contractInstance.numberOfBets(), 10);
    if (totalBet == 5) {
        $("#result").html("There is no winner.");
    }
    $("#totalBet").html(parseInt(contractInstance.numberOfBets(), 10));
    $("#totalEther").html(contractInstance.totalBet() / Math.pow(10, 18));
}



$(document).ready(function () {
        updateUI();
      $("#minBet").html(contractInstance.minimumBet() / Math.pow(10, 18));
      $("#maxBet").html(parseInt(contractInstance.maxAmountOfBets(), 10));
});