//IOU ROOTS tokens will be exchanged into ROOTS tokens during the ICO

let IouRootsToken = artifacts.require("./IouRootsToken.sol")

module.exports = (deployer, network) => {
    if (network == 'live') {
        deployer.deploy(
            IouRootsToken,
            15000,
            '0x6fE56527Be2AAf18347dd772fc333504B83c4447',
            'ROOTS IOU',
            'IOR',
            18
        )
    }
    else {
        deployer.deploy(
            IouRootsToken,
            15000,
            '0xA0279AF590d94405e20Fa9127646034D8d67D827',
            'ROOTS IOU',
            'IOR',
            18
        )
    }
}

