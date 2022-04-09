import React, { useEffect, useState } from "react";
import getWeb3 from "./getWeb3";

export const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(async () => {
    (async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
  
      } catch (error) {
        // Catch any errors for any of the above operations.
        console.error(error);
      }
    })();
  }, [])

  if (!web3) {
    return (
      <section>
        Loading Web3, accounts, and contract...
      </section>
    );
  }

  return (
    <section className="App">
      <h1>Hello world!</h1>
    </section>
  )
}