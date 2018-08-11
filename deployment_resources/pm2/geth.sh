#!/bin/bash
geth --testnet --cache 6000 --unlock "0x000000000000000000000000000" --password /home/ubuntu/.ethereum/testnet/password --rpc --rpcapi "eth,net,web3,personal" --rpccorsdomain "*" --datadir /home/ubuntu/.ethereum/testnet 2>/home/ubuntu/geth.log
