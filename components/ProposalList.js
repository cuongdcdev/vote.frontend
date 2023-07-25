import { useEffect, useState } from "react";
import { VToast } from "../service/helper";

const Proposal = ({ id, votingContract, address, web3 }) => {
  const [proposalInfo, setProposalInfo] = useState(null);
  const [resultProposal, setResult] = useState(0);

  async function fetchData() {
    console.log("Web3" , web3);
    const proposal = await votingContract.methods.proposals(id).call();
    setProposalInfo(proposal);
    const result = await votingContract.methods.resultProposals(id).call();
    setResult(result);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function toBigNumber(n){
    return BigInt(n * 10**18);
  }

  async function handleVote(isAgree, amount, lockedMonth) {
    // await votingContract.methods.castVote(id, value, Number(amount)*10**18, Number(lockedMonth)*10**18).send({
    //   from: address,
    // }).catch( err => {
    //   console.log("user rejected " ,err);
    //   alert( err.toString() );
    // } );

    // await votingContract.methods.castVote(toBigNumber(id), toBigNumber(value ), toBigNumber(amount ), toBigNumber(lockedMonth))
    await votingContract.methods.castVote( id, isAgree, toBigNumber(amount), lockedMonth )
    .send({
      from: address,
    }).catch( err => {
      console.log("user rejected " ,err);
      // alert( err.toString() );
      VToast( err.toString() );
    } );


    await fetchData();
  }

  async function handleFinalize() {
    await votingContract.methods.finalizeProposal(id).send({
      from: address,
    }).catch( err =>{ 
      console.log("there is an error, maybe user canceled" , err);

    } )
    await fetchData();
  }

  async function withdrawlTokenFromProposal(){
    await votingContract.methods.withdrawlTokenFromProposal(id).send({
      from:address
    }).catch( err => {
      console.log("Withdrawl token error: " , err );
      VToast( "Withdrawl error : " +  err.toString() );
    } );

    await fetchData();
  }

  return (
    <div>
      {proposalInfo && (
        <div className="my-3 proposal card">
          <p className="card-header-title">Proposal #{id + 1}</p>
          
          <div className="card-content">
            <div className="content">
              {proposalInfo.description}
            </div>
          </div>

          <div className="card-footer">
            {proposalInfo.timestamp >
              Math.floor(new Date().getTime() / 1000) ? (
              <div className="card-footer-item">
                <button
                  onClick={() => handleVote(true, 999, 6)}
                  className=" button is-primary mt-3 mr-5"
                >
                  Agree :{" "}
                  {Number(web3.utils.fromWei(proposalInfo.yesCount, "ether"))}
                </button>
                <button
                  onClick={() => handleVote(false, 999, 6)}
                  className=" button is-danger mt-3 mr-5"
                >
                  {" "}
                  Disagree :
                  {Number(
                    Number(web3.utils.fromWei(proposalInfo.noCount, "ether"))
                  )}
                </button>
              </div>
            ) : (
              <div className="card-footer-item">
                <button disabled={resultProposal != 0 ? true : false} onClick={handleFinalize} className=" button is-primary">
                  Finallize
                </button>
                <p className=" mt-3">{Number(resultProposal) == 1 ? "Proposal accepted" : Number(resultProposal) == 2 ? "Proposal denied" : ""}</p>

                <button disabled={resultProposal != 0 ? true : false} onClick={withdrawlTokenFromProposal} className="button">
                  Withdrawl token
                </button>
              </div>

              
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Proposal;
