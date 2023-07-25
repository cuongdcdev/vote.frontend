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



  return (
    <div>
      {proposalInfo && (
        <div className="my-5 proposal card">
          <a href={`/proposal/${id}`}  className="card-header-title panel-heading is-link">Proposal #{id + 1}</a>
          
          <div className="card-content">
            <div className="content">
              {proposalInfo.description}
            </div>
          </div>

          <div className="card-footer">
            
              <div className="card-footer-item">
                <a href={`/proposal/${id}`} className=" button is-link">
                  View Detail
                </a>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proposal;
