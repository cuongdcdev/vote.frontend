import Head from "next/head";
import "bulma/css/bulma.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { VToast } from "../../service/helper";
import Web3 from "web3";
import {
    tokenContractInstance,
    votingContractInstance,
} from "../../service/service";
import Header from "../../components/Header";

export default function Proposal() {
    const router = useRouter();
    const data = router.query;
    const proposalId = data.proposalId;


    const [web3, setWeb3] = useState();
    const [address, setAddress] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);
    const [votingContract, setVotingContract] = useState(null);
    const [proposalInfo, setProposalInfo] = useState(null);
    const [resultProposal, setResult] = useState(0);
    const [yesCount, setYesCount] = useState(0);
    const [noCount, setNoCount] = useState(0);

    const [lockMonth, setLockMonth] = useState(12);
    const [voteAmount, setVoteAmount] = useState(1000);

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
                console.log("user logged in ! ", web3, web3Instance);

            } catch (error) {
                console.log(error);
                VToast("Error: " + error.toString(), "is-danger");
            }
        } else {
            VToast("Not install Metamask! Please install wallet: https://metamask.io", "is-danger");
        }
    };


    useEffect(() => {

        if (!proposalId) return;
        //  handleConnectWallet().then( async ()=>{
        //      loadContract();
        //  } );
        window.ethereum ?
            ethereum.request({ method: "eth_requestAccounts" }).then(accounts => {

                setAddress(accounts[0]);
                let w3 = new Web3(ethereum);
                setWeb3(w3);
                console.log("fetch dataaaaaa", web3, "proposal Id : " + proposalId);

                w3.eth.getAccounts().then((accounts) => {

                    console.log("Accounts: ", accounts);
                    setAddress(accounts[0]);
                    const tokenContractInst = tokenContractInstance(w3);
                    setTokenContract(tokenContractInst);

                    const votingContractInst = votingContractInstance(w3);
                    setVotingContract(votingContractInst);

                    votingContractInst.methods.proposals(proposalId).call().then(proposal => {
                        setProposalInfo(proposal);
                        console.log("Proposal info: ", proposal);
                        setYesCount(w3.utils.fromWei(proposal.yesCount, "ether"));
                        setNoCount(w3.utils.fromWei(proposal.noCount, "ether"));

                        votingContractInst.methods.resultProposals(proposalId).call().then(result => {
                            setResult(result);
                        });
                    });

                });


            }).catch((err) => console.log(err))
            : console.log("Please install MetaMask")


    }, [proposalId]);


    async function fetchData() {
        const proposal = await votingContract.methods.proposals(proposalId).call();
        setProposalInfo(proposal);
        const result = await votingContract.methods.resultProposals(proposalId).call();
        setResult(result);
    }



    function toBigNumber(n) {
        return BigInt(n * 10 ** 18);
    }

    async function handleVote(isAgree, amount, lockedMonth) {

        const allowance = await tokenContract.methods
            .allowance(address, votingContract._address)
            .call();

        console.log( "allowance number: " +  Number(web3.utils.fromWei(allowance, "ether")) + " | Vote amount: " + voteAmount + "| Locked month: " + lockedMonth);

        if (Number(web3.utils.fromWei(allowance, "ether")) < voteAmount) {
            await tokenContract.methods
                .approve(votingContract._address, BigInt( voteAmount * 10 ** 18))
                .send({
                    from: address,
                });
        }

        // await votingContract.methods.castVote(toBigNumber(id), toBigNumber(value ), toBigNumber(amount ), toBigNumber(lockedMonth))
        await votingContract.methods.castVote(proposalId, isAgree, toBigNumber(amount), lockedMonth)
            .send({
                from: address,
            }).catch(err => {
                console.log("user rejected ", err);
                // alert( err.toString() );
                VToast(err.toString());
            });


        await fetchData();
        window.location.href = window.location.href;
    }

    async function handleFinalize() {
        await votingContract.methods.finalizeProposal(proposalId).send({
            from: address,
        }).catch(err => {
            console.log("there is an error, maybe user canceled", err);

        })
        await fetchData();
    }

    async function withdrawlTokenFromProposal() {

        await votingContract.methods.withdrawlTokenFromProposal(proposalId).send({
            from: address
        }).catch(err => {
            console.log("Withdrawl token error: ", err);
            VToast("Withdrawl error : " + err.toString());
        });

        await fetchData();
    }


    const changePageDeposit = () => {
        setCurrentPage("deposit");
    }

    const changePageCreateProposal = () => {
        setCurrentPage("home");
    }


    return (
        <>
            <Header handleConnectWallet={handleConnectWallet} changePageDeposit={changePageDeposit} changePageCreateProposal={changePageCreateProposal} address={address} />
            <div className="container">

                <div>
                    {proposalInfo && (
                        <div className="my-3 proposal card">
                            <a href={`/proposal/${proposalId}`} className="card-header-title panel-heading is-link">Proposal #{parseInt(proposalId) + 1}</a>

                            <div className="card-content">
                                <div className="content">
                                    {proposalInfo.description}
                                </div>

                                <div className="section-voting-process">
                                    <h2 className="subtitle mb-2"> Vote status </h2>
                                    <div className="bd-snippet-wrap">
                                        <p className="bd-snippet-title">
                                            <span className="bd-snippet-tag">Yes:  {Math.ceil(yesCount)}</span>
                                        </p>
                                        <div className="bd-snippet-preview">
                                            <progress className="progress is-success" value={(parseInt(yesCount) / (parseInt(yesCount) + parseInt(noCount))) * 100} max="100"></progress>
                                        </div>
                                    </div>

                                    <div className="bd-snippet-wrap mt-3">
                                        <p className="bd-snippet-title">
                                            <span className="bd-snippet-tag">No: {Math.ceil(parseInt(noCount))}</span>
                                        </p>
                                        <div className="bd-snippet-preview">
                                            <progress className="progress is-danger" value={(parseInt(noCount) / (parseInt(yesCount) + parseInt(noCount))) * 100} max="100"></progress>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="card-footer">
                                {proposalInfo.timestamp >
                                    Math.floor(new Date().getTime() / 1000) ? 
                                    (
                                    <div className="card-footer-item">
                                        <div className="section-voting-option">
                                            <div className="section-voting-input">
                                                <b>Voting amount:</b>
                                                <input className="my-2 input is-primary" type="number" min={1} placeholder="Enter amount" defaultValue={1000}
                                                    onChange={(e) => {
                                                        setVoteAmount(e.target.value);
                                                    }} />
                                                <b>Lock token for </b>

                                                <div className="control my-2">
                                                    <label className="radio">
                                                        <input type="radio" name="lockMonth" checked={lockMonth == 1} onChange={(e) => {
                                                            setLockMonth(1);
                                                        }} />
                                                        1 month
                                                    </label>

                                                    <label className="radio">
                                                        <input type="radio" name="lockMonth" checked={lockMonth == 6} onChange={(e) => {
                                                            setLockMonth(6);
                                                        }} />
                                                        6 months
                                                    </label>

                                                    <label className="radio">
                                                        <input type="radio" name="lockMonth" checked={lockMonth == 12} onChange={(e) => {
                                                            setLockMonth(12);
                                                        }} />
                                                        12 months
                                                    </label>
                                                </div>

                                                <p className="small">[Voting point = amount x month] <br /> longer lock time, bigger voting point </p>

                                                <b className="">Expected voting point: {voteAmount * lockMonth} </b>
                                            </div>

                                            <div className="card-footer-item section-voting-buttons">
                                                <button
                                                    onClick={() => handleVote(true, voteAmount, lockMonth)}
                                                    className=" button is-primary mt-3 mr-5"
                                                >
                                                    Agree :{" "}
                                                    {yesCount}
                                                </button>

                                                <button
                                                    onClick={() => handleVote(false, voteAmount, lockMonth)}
                                                    className=" button is-danger mt-3 mr-5"
                                                >
                                                    {" "}
                                                    Disagree :
                                                    {Number(
                                                        Number(web3.utils.fromWei(proposalInfo.noCount, "ether"))
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="card-footer-item">
                                        <button disabled={resultProposal != 0 ? true : false} onClick={handleFinalize} className=" button is-danger mr-3">
                                            Finallize the vote
                                        </button>
                                        <p className=" mt-3">{Number(resultProposal) == 1 ? "Proposal accepted" : Number(resultProposal) == 2 ? "Proposal denied" : ""}</p>

                                        <button disabled={resultProposal != 0 ? true : false} onClick={withdrawlTokenFromProposal} className="button is-primary">
                                            Withdraw all my tokens
                                        </button>
                                    </div>


                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}