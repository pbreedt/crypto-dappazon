// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/*
 TODO:
    - check atr of mem
    - check atr of block
    - check other available objects
*/

contract Dappazon {
    address public owner;
    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;
    
    event List(string name, uint256 cost, uint256 stock);

    struct Item {
        uint256 id;
        string name; 
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
    }

    constructor() {
        owner = msg.sender;
    }

    modifier mustBeOwner() {
        require(msg.sender == owner);
        _;
    }

    // List products
    function list(
        uint256 _id, 
        string memory _name, 
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public mustBeOwner() {
        Item memory item = Item(_id, _name, _category, _image, _cost, _rating, _stock);
        items[_id] = item;

        // emit List(_name, _cost, _stock);
    }

    // Buy product
    // Simply making it 'payable' allows us to do '.buy(ID, { value: COST } )' and send crypto to contract
    function buy(uint256 _id) public payable {
        Item memory item = items[_id];
        Order memory order = Order(block.timestamp, item);
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;

        items[_id].stock--;
    }
    
    // Withdraw funds

}
