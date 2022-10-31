// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './the-creator-product.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract TheCreatorProductFactory is Ownable {
    event Deployed(address indexed from, TheCreatorProduct indexed product);

    Collector immutable collector;
    address immutable trustedForwarder;

    constructor(Collector _collector, address _forwarder) {
        collector = _collector;
        trustedForwarder = _forwarder;
    }

    function create(
        string memory _name,
        string memory _symbol,
        IERC20 _baseToken
    ) external {
        TheCreatorProduct product = new TheCreatorProduct(
            _name,
            _symbol,
            _baseToken,
            collector,
            trustedForwarder
        );
        emit Deployed(_msgSender(), product);
    }
}
