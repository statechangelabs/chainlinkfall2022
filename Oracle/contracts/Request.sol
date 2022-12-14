// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Request is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private priceJobId;
    uint256 private fee;
    mapping(string => uint256) public prices;
    mapping(string => uint256) public blocks;
    // @TODO: Check if the increase in mapping size (more txns/requests) makes it more gassy
    mapping(bytes32 => string) public requests;
    mapping(address => bool) private requesters;

    constructor() {
        requesters[msg.sender] = true;
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB); // for mumbai network
        oracle = 0xe9eF1f50fa2748864B7c78Da60C609e1eD567D9f;
        priceJobId = "bb6c3660d0b2479990b1028fc04d1e";
        fee = 0.1 * 10**18; // (Varies by network and job)
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestPrice(string memory symbol)
        public
        onlyRequester
        returns (bytes32 requestId)
    {
        Chainlink.Request memory request = buildChainlinkRequest(
            priceJobId,
            address(this),
            this.fulfill.selector
        );

        request.add("string_1", symbol);
        // Sends the request
        bytes32 _requestId = sendChainlinkRequestTo(oracle, request, fee);
        requests[_requestId] = symbol;
        return _requestId;
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfill(bytes32 _requestId, uint256 _returnedPrice)
        public
        recordChainlinkFulfillment(_requestId)
    {
        // volume = _volume;

        string storage _symbol = requests[_requestId];

        prices[_symbol] = _returnedPrice;
        blocks[_symbol] = block.number;
    }

    function getPriceandBlock(string memory _symbol)
        external
        view
        returns (uint256, uint256)
    {
        return (prices[_symbol], blocks[_symbol]);
    }

    modifier onlyRequester() {
        require(
            requesters[_msgSender()] == true,
            "Only Requester: Caller is not a requester"
        );
        _;
    }

    function setRequester(address _requester) public onlyOwner {
        requesters[_requester] = true;
    }

    function isRequester(address _requester) public view returns (bool) {
        return requesters[_requester];
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
