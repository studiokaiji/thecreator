// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@studiokaiji/meltprotocol-contracts/product.sol';
import '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import './collector.sol';

contract TheCreatorProduct is Product, ERC1155Holder {
    using SafeMath for uint256;

    string constant AMOUNT_IS_LOW_ERR = 'TheCreatorProduct: Amount is low';

    Collector collector;

    constructor(
        string memory _name,
        string memory _symbol,
        IERC20 _baseToken,
        Collector _collector,
        address _trustedForwarder
    ) Product(_name, _symbol, _baseToken, _trustedForwarder) {
        collector = _collector;
    }

    function withdraw() public virtual override onlyAdmin {
        uint256 balance = baseToken.balanceOf(address(this));
        require(balance > 0, 'TheCreatorProduct: No balance');

        uint256 fee = collector.calculateFee(baseToken, balance);
        baseToken.approve(address(collector), fee);
        collector.payAFee(baseToken, fee);

        Product.withdraw();
    }

    function subscribe(uint256 _planId, uint256 _tokenId)
        public
        virtual
        override
    {
        require(
            plans(_planId).usage.mul(30) <= customers(_msgSender()).balance,
            AMOUNT_IS_LOW_ERR
        );
        Product.subscribe(_planId, _tokenId);
    }

    function deposit(address _customer, uint256 _baseTokenAmount)
        public
        virtual
        override
    {
        Customer memory customer = customers(_customer);
        require(
            plans(customer.planId).usage.mul(30) <=
                _baseTokenAmount.add(customer.balance),
            AMOUNT_IS_LOW_ERR
        );
        Product.deposit(_customer, _baseTokenAmount);
    }

    /**
    @dev NFT ownership must be in this contract.
    */
    function subscribeAndDepositAfterTransferOfNFT(
        uint256 _planId,
        uint256 _tokenId,
        uint256 _baseTokenAmount
    )
        public
        virtual
        onlyValidAccount(_msgSender())
        onlyApprovedForAllOnNFT(_msgSender(), _planId)
    {
        IERC1155(_plans[_planId].nft).safeTransferFrom(
            address(this),
            _msgSender(),
            _tokenId,
            1,
            bytes('')
        );
        subscribeAndDeposit(_planId, _tokenId, _baseTokenAmount);
    }

    function getAllPlans() public view virtual returns (Plan[] memory plans) {
        for (uint256 i = 0; i < plansCounter; i++) {
            plans[i] = _plans[i];
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Receiver, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
