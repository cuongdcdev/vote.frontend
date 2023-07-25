import TokenContract from '../abi/TokenContract.json'
import VotingContract from '../abi/VotingContract.json'

console.log("Env file: " , process.env.VOTING_TOKEN_ADDRESS);

export const tokenContractInstance = (web3) => {
    return new web3.eth.Contract(
        TokenContract.abi, // abi of SC voting token
        // process.env.VOTING_TOKEN_ADDRESS // address of Voting token
        "0x5B2d6FacfCe334Aa6Ee815fec9316b7e55a48086" // address of Voting token
    )
}

export const votingContractInstance = web3 => {
    return new web3.eth.Contract(
        VotingContract.abi, // abi of SC governance contract
    //    process.env.VOTING_CONTRACT_ADDRESS // address of governance contract
       "0x4105CA95Ff80316C8962d2aD22Ef5bbe1e3376A6" // address of governance contract
    )
}