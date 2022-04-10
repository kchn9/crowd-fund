import React, { useEffect, useState } from "react";
import getWeb3 from "./getWeb3";

export const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const establishWeb3 = async () => {
      try {
        const web3 = await getWeb3();
        setWeb3(web3);
      } catch (error) {
        console.log("Web3 thrown error during connection");
        setConnectionError(true);
        console.error(error);
      }
    };
    establishWeb3();
  }, [])


  if (!web3) {
    return (
      <p style={{ textAlign: "center" }}>
        { connectionError ? 
          "Error occured - please check your wallet / refresh this site to try again" : 
          "Loading Web3, accounts, and contract..." 
        }
      </p>
    );
    }

  return (
    <section className="App">
      <small style={{ display: "block", marginTop: "12px", textAlign: "center", color: "yellowgreen"}}>
        Connection established!
      </small>
      <h1 style={{ textAlign: "center" }}>
        More coming soon...
      </h1>
    </section>
  )
}