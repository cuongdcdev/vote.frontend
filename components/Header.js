import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import Index from "../pages";
export default function Header({ handleConnectWallet, changePageCreateProposal, changePageDeposit, address }) {

    function stripWalletAddr(str) {
        return str.substr(0, 3) + "..." + str.substr(-3, 3);
    }

    return (
        <>
            <Head>
                <title>KlayVote dapp</title>
                <meta name="description" content="KlayVote" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header>
                <nav className="navbar is-dark" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand navbar-start">
                        <Link className="navbar-item" href="/">
                            <Image src="/icon.png" width="112" height="112" style={{ height: "auto", width: "auto", marginRight: "10px" }} />
                            KlayVote
                        </Link>
                    </div>

                    <div id="navbarBasicExample" className="">
                        <div className="navbar-end">
                            <div className="navbar-item">

                                <div className="buttons">

                                    <Link id="menuCreateProposal" href="/" className="button is-info" onClick={changePageCreateProposal}>
                                        ➕ Create Proposal
                                    </Link>

                                    <Link id="menuDeposit" href="/" className="button is-success" onClick={changePageDeposit}>
                                        💲 Deposit
                                    </Link>

                                    {address ?
                                        <Link id="connectWallet" href="#" className="button is-light">
                                            🦊 Hi {stripWalletAddr(address)}
                                        </Link> :

                                        <Link id="connectWallet" href="#" className="button is-light" onClick={handleConnectWallet}>
                                            🦊 Connect Wallet
                                        </Link>}

                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        </>
    );
}