pragma solidity ^0.4.20;

contract Lotto {
    
    address public owner;
    
    // minimum allowed bet
    uint public minimumBet = 100 finney;
    
    // total bet so far
    uint public totalBet = 0;
    
    // total number of bets so fat
    uint public numberOfBets = 0;
    
    // maximum number of bets
    uint public constant maxAmountOfBets = 5;
    
    uint public constant range = 10;
    
    // list of players
    address[] public players;
    

    struct Bet {
        uint[] amountBet;
        uint[] numberSelected;
        uint countOfBets;
    }
    
    event EndOfBet(uint winningNumber,uint winningAmount);
    
    mapping(address => Bet) playerInfo;
    
    function Lotto(uint _minumBet) public {
        if (_minumBet > 0) {
            minimumBet = _minumBet;
        }
        owner = msg.sender;
    }
    
    function getPlayers() constant returns (address[]) {
        return players;
    }

    // place a Bet
    function pickNumber( uint numberSelected) public payable {
        require(numberSelected >= 1 && numberSelected <= range);
        require(msg.value >= minimumBet);
        require(playerInfo[msg.sender].countOfBets <= 4);
        
        if (!checkPlayerExist(msg.sender)) {
            players.push(msg.sender);
        }

        uint index = indexOfNumber(msg.sender,numberSelected);
        if (index != uint(-1)) {
            playerInfo[msg.sender].amountBet[index] += msg.value;
        } else {
            playerInfo[msg.sender].numberSelected.push(numberSelected);
            playerInfo[msg.sender].amountBet.push(msg.value);
        }

        playerInfo[msg.sender].countOfBets++;
        totalBet += msg.value;
        numberOfBets++;
        if (numberOfBets >= maxAmountOfBets) {
            generateWinner();
        }
    }

    function indexOfNumber(address player, uint number) public returns (uint) {
        for (uint i = 0; i < playerInfo[player].numberSelected.length; i++) {
            if (playerInfo[player].numberSelected[i] == number) {
                return i;
            }
        }
        return uint(-1);
    }

    
    function checkPlayerExist( address player) public returns (bool) {
        for (uint i = 0; i < players.length; i++) {
            if (players[i] == player) {
                return true;
            }
        }
        return false;
    }

    function random() private returns (uint) { 
        return uint8(uint(keccak256(block.timestamp, block.difficulty))%10); 
    }

    // generate the Winner
    function generateWinner() public {

        uint winningNumber = random(); // selected at random

            distributePrizes(winningNumber);

    }

    function checkWinnerExist(uint winningNumber) private returns (uint,address[]) {
        uint count = 0; // number of winners
        address[] storage winners;
        for (uint i = 0; i < players.length ; i++) {
            address playerAddress = players[i];
            for (uint x = 0; x < playerInfo[playerAddress].numberSelected.length; x++) {
                if (playerInfo[playerAddress].numberSelected[x] == winningNumber) {
                    winners.push(playerAddress);
                    count++;
                }
            }
        }
        return (count,winners);
    }
    
    // distribute the prize
    function distributePrizes(uint winningNumber) public {

        uint count = 0; // number of winners
        address[range] memory winners;
        for (uint i = 0; i < players.length ; i++) {
            address playerAddress = players[i];
            for (uint x = 0; x < playerInfo[playerAddress].numberSelected.length; x++) {
                if (playerInfo[playerAddress].numberSelected[x] == winningNumber) {
                    winners[count] = playerAddress;
                    count++;
                }
            }
            delete playerInfo[playerAddress];
        }

        uint totalWinner = winners.length;

      
      //Reset players list to 0. Remove all players after distributed prizes
        
        //BUG: invalid opcode
        if (count > 0) {
            players.length = 0;
            uint winnerEtherAmount = totalBet / totalWinner;
            
            for (uint j = 0; j < totalWinner; j++) {
                if (winners[j] != address(0)) {
                    winners[j].transfer(winnerEtherAmount);
                }
            }
            EndOfBet(winningNumber,winnerEtherAmount);
            players.length = 0;
            totalBet = 0;
            numberOfBets = 0;
        }

        if (numberOfBets >= maxAmountOfBets) {

        }


    }
    function kill() public {
        require (msg.sender == owner);
        // selfdestruct();
    }
}