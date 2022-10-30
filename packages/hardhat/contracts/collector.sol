// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './the-creator-product.sol';

/**
@title Collector
@author Haruki Nazawa
@notice Collects fees from Creator Product Contracts.
*/
contract Collector is Ownable {
    using SafeMath for uint256;

    event SetFee(uint16 rate, uint240 min);
    event SetPaymentTo(address indexed to);
    event PayAFee(
        IERC20 indexed token,
        address indexed from,
        address indexed to,
        uint256 fee
    );

    /**
     * @notice  Fee rate of uint from 0 to 10000. percent to two decimal places. So 10000 is 100%, 1000 is 10%, 1 is 0.01%.
     * @return uint from 0 to 10000
     **/
    uint16 public rate;
    /**
     * @notice Minimum amount of fee. If pay amount*rate*0.01 is less than min, the amount specified in min will be the fee.
     * @return uint Minimum fee
     **/
    uint240 public min;
    /**
     * @notice Fee payable to.
     * @return address payment to
     **/
    address public paymentTo;

    /**
    @notice Specify the Fee and its destination.
    @param _rate Fee rate of uint from 0 to 10000.
    @param _min Minimum amount of fee.
    @param _to Fee payable to.
    @dev _rate must be uint from 0 to 10000. percent to two decimal places. So 10000 is 100%, 1000 is 10%, 1 is 0.01%. 
    */
    constructor(
        uint16 _rate,
        uint240 _min,
        address _to
    ) {
        setFee(_rate, _min);
        setPaymentTo(_to);
    }

    /**
    @notice Specify the Fee.
    @param _rate Fee rate of uint from 0 to 10000. percent to two decimal places. 
    @param _min Minimum amount of fee.
    */
    function setFee(uint16 _rate, uint240 _min) public virtual onlyOwner {
        require(_rate <= 10000, 'Collector: Invalid rate');
        rate = _rate;
        min = _min;
        emit SetFee(_rate, _min);
    }

    /**
    @notice Specify the fee destination.
    @param _to Fee payable to.
    */
    function setPaymentTo(address _to) public virtual onlyOwner {
        paymentTo = _to;
        emit SetPaymentTo(_to);
    }

    /**
    @notice Calculate fee
    @param _amount Original amount to calculate fee
    @return _fee Calculated fee
    */
    function calculateFee(uint256 _amount)
        public
        view
        virtual
        returns (uint256 _fee)
    {
        if (_amount < 1) {
            return 0;
        }
        if (_amount < min) {
            return min;
        }
        return _amount.div(uint256(rate).div(100));
    }

    /**
    @notice Fees are collected based on the ERC20 balance of the sending contract.
    @dev It is necessary to calculate the fee in the withdraw function of the Product contract and then transfer the money. This function by itself does not calculate the fee.
    */
    function payAFee(IERC20 token, uint256 fee) external virtual {
        require(fee > 0, 'Collector: Amount is 0.');
        require(token.transferFrom(_msgSender(), paymentTo, fee));
        emit PayAFee(token, _msgSender(), paymentTo, fee);
    }
}
