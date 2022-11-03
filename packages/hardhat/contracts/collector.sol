// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol';
import './the-creator-product.sol';

/**
@title Collector
@author Haruki Nazawa
@notice Collects fees from Creator Product Contracts.
*/
contract Collector is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    using SafeMath for uint256;

    event SetFeeSingle(
        IERC20 indexed token,
        uint16 indexed rate,
        uint240 indexed min
    );
    event SetFeeBatch(
        IERC20[] tokens,
        uint16[] rates,
        uint240[] mins
    );
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
    mapping(IERC20 => uint16) public rates;
    /**
     * @notice Minimum amount of fee. If pay amount*rate*0.01 is less than min, the amount specified in min will be the fee.
     * @return uint Minimum fee
     **/
    mapping(IERC20 => uint240) public mins;
    /**
     * @notice Fee payable to.
     * @return address payment to
     **/
    address public paymentTo;

    /**
    @notice Specify the Fee and its destination.
    @param _tokens ERC20 token addresses.
    @param _rates Fees rate of uint from 0 to 10000.
    @param _mins Minimum amount of fees.
    @param _to Fees payable to.
    @dev _rate must be uint from 0 to 10000. percent to two decimal places. So 10000 is 100%, 1000 is 10%, 1 is 0.01%. 
    */
    function initialize(
        IERC20[] memory _tokens,
        uint16[] memory _rates,
        uint240[] memory _mins,
        address _to
    ) public initializer {
        __Ownable_init();
        setFeeBatch(_tokens, _rates, _mins);
        setPaymentTo(_to);
    }

    /**
    @notice Specify the Fee.
    @param _token ERC20 token address
    @param _rate Fee rate of uint from 0 to 10000. percent to two decimal places. 
    @param _min Minimum amount of fee.
    */
    function setFee(
        IERC20 _token,
        uint16 _rate,
        uint240 _min
    ) public virtual onlyOwner {
        _setFee(_token, _rate, _min);
        emit SetFeeSingle(_token, _rate, _min);
    }

    /**
    @notice Specify the Fee and its destination.
    @param _tokens ERC20 token addresses.
    @param _rates Fees rate of uint from 0 to 10000.
    @param _mins Minimum amount of fees.
    */
    function setFeeBatch(
        IERC20[] memory _tokens,
        uint16[] memory _rates,
        uint240[] memory _mins
    ) public virtual onlyOwner {
        require(
            _tokens.length == _rates.length && _rates.length == _mins.length
        );
        for (uint256 i = 0; i < _tokens.length; i++) {
            _setFee(_tokens[i], _rates[i], _mins[i]);
        }
        emit SetFeeBatch(_tokens, _rates, _mins);
    }

    function _setFee(
        IERC20 _token,
        uint16 _rate,
        uint240 _min
    ) internal virtual {
        require(_rate <= 10000, 'Collector: Invalid rate');
        rates[_token] = _rate;
        mins[_token] = _min;
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
    function calculateFee(IERC20 _token, uint256 _amount)
        public
        view
        virtual
        returns (uint256 _fee)
    {
        if (_amount < 1) {
            return 0;
        }
        if (_amount < mins[_token]) {
            return mins[_token];
        }
        return _amount.div(uint256(rates[_token]).div(100));
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

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
