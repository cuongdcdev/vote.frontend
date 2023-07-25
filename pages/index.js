import Head from "next/head";
import "bulma/css/bulma.css";
import "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { VToast } from "../service/helper";

import Web3 from "web3";
import {
  tokenContractInstance,
  votingContractInstance,
} from "../service/service";
import Proposal from "../components/Proposal";
import Header from "../components/Header";


export default function Index() {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [votingContract, setVotingContract] = useState(null);
  const [addressBalance, setAddressBalance] = useState(null);
  const [balance, setBalance] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");

  const [amountDeposit, setAmountDeposit] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [description, setDescription] = useState(null);
  const [countProposal, setCount] = useState(null);
  const [allProposals, setAllProposals] = useState([]);



  const updateAddressBalance = (e) => {
    setAddressBalance(e.target.value);
  };

  const updateAmountDeposit = (e) => {
    setAmountDeposit(e.target.value);
  };

  const updateDescription = (e) => {
    setDescription(e.target.value);
  };

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
        console.log("user logged in ! " , web3);
      } catch (error) {
        console.log(error);
        // VToast("Error: " + error.toString(), "is-danger");
      }
    } else {
      VToast("Not install Metamask! Please install wallet: https://metamask.io", "is-danger");
    }
  };

  useEffect(()=>{
    handleConnectWallet();
  }, []);

  
  useEffect(() => {
    if (!web3) return;
    console.log("init: web3: ", web3);

    let loading = async () => {
      const accounts = await web3.eth.getAccounts();
      setAddress(accounts[0]);

      const tokenContractInst = await tokenContractInstance(web3);
      setTokenContract(tokenContractInst);

      const votingContractInst = await votingContractInstance(web3);
      setVotingContract(votingContractInst);

      let pall = await votingContractInst.methods.proposalCount().call();
      let parr = [];
      console.log("Pall : ", pall);
      for (var i = 0; i < pall; i++) {
        let p = await votingContractInst.methods.proposals(i).call();
        console.log("p ", p);
        parr.push(p);
      }
      setAllProposals(parr);
      console.log("all proposals ", allProposals, parr);
      setCount(parr.length);

    }

    loading().catch((er) => {
      console.log("Error happens ", er);
      // VToast("Error" + er.toString(), "is-danger");
    });
  }, [web3]);




  const handleGetAllProposals = async () => {
    let pall = await votingContract.methods.proposalCount().call();
    let parr = [];
    console.log("Pall : ", pall);
    for (var i = 0; i < pall; i++) {
      let p = await votingContract.methods.proposals(i).call();
      console.log("p ", p);
      parr.push(p);
    }
    setAllProposals(parr);
    console.log("all proposals ", allProposals, parr);
    setCount(parr.length);

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
    setCurrentPage("deposit");
    try {
      await tokenContract.methods.deposit().send({
        from: address,
        value: Number(amountDeposit) * 10 ** 18,
      });
      await handleGetBalance();
      VToast("Deposit successfully! ");
      
    } catch (error) {
      setErrorMessage(error.message);
      VToast("Something wrong: " + error.message , "is-danger");
    }
  };

  const handleSumbitProposal = async () => {
    if( description.trim().length == 0  ){
      VToast(  "Proposal can not be empty!", "is-danger" );
      return;
    }

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

  const changePageCreateProposal = () => {
    setCurrentPage("home");
  }

  const changePageDeposit = () => {
    setCurrentPage("deposit");
    handleGetBalance();
  }

  return (
    <>
      <Header handleConnectWallet={handleConnectWallet} changePageDeposit={changePageDeposit} changePageCreateProposal={changePageCreateProposal} address={address} />
      <div className="container">

        {/* default home page  */}
        <main className={currentPage != 'home' ? "is-hide" : ""}>
          <section className="mt-5 create-proposal">
            <div className=" container">
              <div className=" field">
                <h1 className="title">
                  Create proposal
                </h1>

                <div className="controle mt-2">
                  <textarea
                    onChange={updateDescription}
                    className=" textarea is-primary"
                    rows="5"
                    type="type"
                    placeholder="Enter proposal..."
                  ></textarea>
                </div>
                <button
                  onClick={handleSumbitProposal}
                  className=" button is-primary mt-2"
                >
                  Submit proposal
                </button>

                <button className="ml-3 button is-secondary mt-2"
                  onClick={handleGetAllProposals}
                >
                  Get all proposals
                </button>
              </div>
            </div>
          </section>

          <section className="mt-5">
            <div className=" container mb-5">
              <div className="field">
                <h2 className="title">List Proposals {countProposal}</h2>
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
                    }).reverse()}

                  {allProposals.length == 0 ? (
                    <>
                      <b> There are no proposal yet! </b>
                    </>) : ""}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className=" container has-text-danger">
              <p>{VToast(errorMessage , "is-danger")}</p>
            </div>
          </section>
        </main>
        {/* end default home page  */}

        {/* start deposit  */}
        <main className={currentPage != 'deposit' ? 'is-hide' : ''}>
          <section className="section-deposit mt-5">
            <div className="container">
              <div className=" field">
                <h2 className="title">Deposit</h2>

                <div className="controle mt-2">
                  <input
                    onChange={updateAmountDeposit}
                    className="input"
                    type="number"
                    placeholder=" Enter amount you want..."
                  />
                  <p>Current rate: 1 KLAYTN = 10000 token </p>
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

          <section className="mt-5 section-check-balance">
            <div className=" container">

              <div className="">
                <h2 className="subtitle mb-0">
                  Check my balance
                </h2>
                {/* <label className=" lable">Balance of </label>
              <div className=" control">
                <input
                  className=" input"
                  type="type"
                  placeholder="Enter address to check balance..  "
                  onChange={updateAddressBalance}
                ></input>
              </div> */}
                <button
                  onClick={handleGetBalance}
                  className=" my-2 button is-info mt-2"
                >
                  Get balance
                </button>
              </div>
              <div className=" container has-text-success mt-5">
                {balance && (
                  <p className="subtitle is-5">
                    💰 Your current balance: {balance} <br /><br /> 👛 Your wallet address: {address}
                  </p>
                )}
              </div>
            </div>
          </section>
        </main>
        {/* end deposit */}

        {/* <main className={  currentPage != 'create-proposal' ? 'is-hide'  : '' }>
            <Deposit/>
        </main> */}

      </div>

    </>
  );
}
