import Head from "next/head";
import "bulma/css/bulma.css";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { VToast } from "../service/helper";
import Web3 from "web3";
import {
  tokenContractInstance,
  votingContractInstance,
} from "../service/service";
import Proposal from "../components/Proposal";

export default function Home() {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [votingContract, setVotingContract] = useState(null);
  const [addressBalance, setAddressBalance] = useState(null);
  const [balance, setBalance] = useState(null);

  const [amountDeposit, setAmountDeposit] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [description, setDescription] = useState(null);
  const [countProposal, setCount] = useState(null);
  const [allProposals, setAllProposals ] = useState([]);


  const updateAddressBalance = (e) => {
    setAddressBalance(e.target.value);
  };

  const updateAmountDeposit = (e) => {
    setAmountDeposit(e.target.value);
  };

  const updateDescription = (e) => {
    setDescription(e.target.value);
  };



  useEffect( ()=>{
    console.log("init! ");
    if(!web3) return;

    let loading = async ()=>{
      let web3Instance = web3;
      const accounts = await web3Instance.eth.getAccounts();
      setAddress(accounts[0]);
  
      const tokenContractInst = tokenContractInstance(web3Instance);
      setTokenContract(tokenContractInst);
  
      const votingContractInst = votingContractInstance(web3Instance);
      setVotingContract(votingContractInst);
  
      await handleGetAllProposals();
    }

    loading().catch( (er) => {
      console.log("Error happens " , er);
      VToast( "Error" + er.toString() , "is-danger"  );
    } );


  }, [web3] );
  
  const handleConnectWallet = async () => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
      } catch (error) {
        console.log(error);
        VToast( "Error: " + error.toString() , "is-danger" );
      }
    } else {
      VToast("Not install Metamask! Please install wallet: https://metamask.io" , "is-danger");
    }
  };

  const handleGetAllProposals = async() => {
    let pall = await votingContract.methods.proposalCount().call();
    let parr = [];
    console.log("Pall : " , pall);
    for( var i = 0 ; i < pall ; i++ ){
      let p = await votingContract.methods.proposals(i).call();
      console.log("p " , p );
      parr.push(p);
    }
    setAllProposals(parr);
    console.log("all proposals " , allProposals , parr );
    setCount( parr.length );

  }

  const handleGetBalance = async () => {
    console.log(tokenContract);

    const balance = await tokenContract.methods
      .balanceOf(addressBalance ? addressBalance : address)
      .call();
    console.log(
      "🚀 ~ file: index.js:60 ~ handleGetBalance ~ balance:",
      balance
    );
    setBalance(web3.utils.fromWei(balance, "ether"));
  };

  const handleDeposit = async () => {
    try {
      await tokenContract.methods.deposit().send({
        from: address,
        value: Number(amountDeposit) * 10 ** 18,
      });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSumbitProposal = async () => {
    try {
      const allowance = await tokenContract.methods
        .allowance(address, votingContract._address)
        .call();
      console.log(Number(web3.utils.fromWei(allowance, "ether")) < 20);
      if (Number(web3.utils.fromWei(allowance, "ether")) < 20) {
        await tokenContract.methods
          .approve(votingContract._address, BigInt(20 * 10 ** 18))
          .send({
            from: address,
          });
      }
      await votingContract.methods.createProposal(description).send({
        from: address,
      });

      handleGetAllProposals();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };



  return (
    <div className={styles.container}>

      <main>
        <nav className=" navbar mt-4 mb4">
          <div className=" container content">
            <div className=" navbar-brand">
              <h1 className=" ">Dapp Voting</h1>
            </div>
            <div className=" navbar-end">
              <button
                className="button is-primary "
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </nav>
        <section>
          <div className=" container mt-2">
            <p>Current account: {address}</p>
          </div>
        </section>

        <section>
          <div className=" container">
            <div className=" field">
              <label className=" lable">Balance of </label>
              <div className=" control">
                <input
                  className=" input"
                  type="type"
                  placeholder="Enter address to check balance..  "
                  onChange={updateAddressBalance}
                ></input>
              </div>
              <button
                onClick={handleGetBalance}
                className=" button is-primary mt-2"
              >
                Get balance
              </button>
            </div>
            <div className=" container has-text-success">
              {balance && (
                <p>
                  The balance that address {addressBalance} has = {balance}
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className=" container">
            <div className=" field">
              <label className=" lable">Deposit</label>
              <div className=" controle mt-2">
                <input
                  onChange={updateAmountDeposit}
                  className=" input"
                  type=" type"
                  placeholder=" Enter amount deposit..."
                />
              </div>
              <button
                onClick={handleDeposit}
                className=" button is-primary mt-2"
              >
                Deposit
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className=" container">
            <div className=" field">
              <label className=" lable">
                Create a proposal for you community
              </label>
              <div className=" controle mt-2">
                <input
                  onChange={updateDescription}
                  className=" input"
                  type=" type"
                  placeholder=" Enter description..."
                />
              </div>
              <button
                onClick={handleSumbitProposal}
                className=" button is-primary mt-2"
              >
                Submit proposal
              </button>

              <button className="button is-secondary mt-2"
                onClick={  handleGetAllProposals}
              >
                Get all proposals
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className=" container mb-5">
            <div className=" field">
              <label>List Proposal: {countProposal}</label>
              <div>
                {allProposals.length > 0 && 
                  Array.from({ length: countProposal }, (_, index) => {
                    return (
                      <Proposal
                        votingContract={votingContract}
                        address={address}
                        id={index}
                        key={index}
                        web3={web3}
                      ></Proposal>
                    );
                  })}

                  { allProposals.length ==0 ? (
                  <>
                    <b> There are no proposals yet! </b>
                  </>) : ""  }
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className=" container has-text-danger">
            <p>{errorMessage}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
