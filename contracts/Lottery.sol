// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.1;

contract Lottery {
    address public manager; 
    address [] public players; 

    constructor(){
        manager = msg.sender; 
    }

    function enter() public payable {
        require(msg.value >= .01 ether, "Minimum entry fee .01 ether required.");
        players.push(msg.sender); 
    }

    function pickWinner() public {
        require(msg.sender == manager, "Only manager can call pick winner."); 
        uint winnerIndex = random() % players.length; 
        payable(players[winnerIndex]).transfer(address(this).balance);
        players = new address [](0);
    }

    function random() public view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function getPlayers() public view returns (address[] memory) {
        return players; 
    }
}

