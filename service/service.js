import TokenContract from '../abi/TokenContract.json'
import VotingContract from '../abi/VotingContract.json'
require("dotenv").config();

export const tokenContractInstance = (web3) => {
    return new web3.eth.Contract(
        TokenContract.abi, // abi of SC voting token
        process.env.VOTING_TOKEN_ADDRESS // address of Voting token
    )
}

export const votingContractInstance = web3 => {
    return new web3.eth.Contract(
        VotingContract.abi, // abi of SC governance contract
       process.env.VOTING_CONTRACT_ADDRESS // address of governance contract
    )
}