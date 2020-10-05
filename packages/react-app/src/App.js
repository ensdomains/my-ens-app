import React, { useCallback, useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { Web3Provider, getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, Image, Link } from "./components";
import { web3Modal, logoutOfWeb3Modal } from './utils/web3Modal'

import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";
import ENS, { getEnsAddress, namehash } from '@ensdomains/ensjs'
import { gql } from "apollo-boost";

const imgData = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNzIuNTIgODAuOTUiPjxkZWZzPjxzdHlsZT4uY2xzLTN7ZmlsbDojYTBhOGQ0fTwvc3R5bGU+PGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXItZ3JhZGllbnQiIHgxPSI0MS45NSIgeTE9IjIuNTciIHgyPSIxMi41NyIgeTI9IjM0LjQyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIuNTgiIHN0b3AtY29sb3I9IiNhMGE4ZDQiLz48c3RvcCBvZmZzZXQ9Ii43MyIgc3RvcC1jb2xvcj0iIzg3OTFjNyIvPjxzdG9wIG9mZnNldD0iLjkxIiBzdG9wLWNvbG9yPSIjNjQ3MGI0Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudC0yIiB4MT0iNDIuNTciIHkxPSI4MS42NiIgeDI9IjcxLjk2IiB5Mj0iNDkuODEiIHhsaW5rOmhyZWY9IiNsaW5lYXItZ3JhZGllbnQiLz48bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudC0zIiB4MT0iNDIuMjYiIHkxPSIxLjI0IiB4Mj0iNDIuMjYiIHkyPSI4Mi44NCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzUxM2VmZiIvPjxzdG9wIG9mZnNldD0iLjE4IiBzdG9wLWNvbG9yPSIjNTE1N2ZmIi8+PHN0b3Agb2Zmc2V0PSIuNTciIHN0b3AtY29sb3I9IiM1Mjk4ZmYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1MmU1ZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyBzdHlsZT0iaXNvbGF0aW9uOmlzb2xhdGUiPjxnIGlkPSJMYXllcl8xIiBkYXRhLW5hbWU9IkxheWVyIDEiPjxwYXRoIGQ9Ik0xNS4yOCAzNC4zOWMuOCAxLjcxIDIuNzggNS4wOSAyLjc4IDUuMDlMNDAuOTUgMS42NGwtMjIuMzQgMTUuNmE5Ljc1IDkuNzUgMCAwIDAtMy4xOCAzLjUgMTYuMTkgMTYuMTkgMCAwIDAtLjE1IDEzLjY1eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTYgLTEuNjQpIiBmaWxsPSJ1cmwoI2xpbmVhci1ncmFkaWVudCkiLz48cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik02LjIxIDQ2Ljg1YTI1LjQ3IDI1LjQ3IDAgMCAwIDEwIDE4LjUxbDI0LjcxIDE3LjIzcy0xNS40Ni0yMi4yOC0yOC41LTQ0LjQ1YTIyLjM5IDIyLjM5IDAgMCAxLTIuNjItNy41NiAxMi4xIDEyLjEgMCAwIDEgMC0zLjYzYy0uMzQuNjMtMSAxLjkyLTEgMS45MmEyOS4zNSAyOS4zNSAwIDAgMC0yLjY3IDguNTUgNTIuMjggNTIuMjggMCAwIDAgLjA4IDkuNDN6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNiAtMS42NCkiLz48cGF0aCBkPSJNNjkuMjUgNDkuODRjLS44LTEuNzEtMi43OC01LjA5LTIuNzgtNS4wOUw0My41OCA4Mi41OSA2NS45MiA2N2E5Ljc1IDkuNzUgMCAwIDAgMy4xOC0zLjUgMTYuMTkgMTYuMTkgMCAwIDAgLjE1LTEzLjY2eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTYgLTEuNjQpIiBmaWxsPSJ1cmwoI2xpbmVhci1ncmFkaWVudC0yKSIvPjxwYXRoIGNsYXNzPSJjbHMtMyIgZD0iTTc4LjMyIDM3LjM4YTI1LjQ3IDI1LjQ3IDAgMCAwLTEwLTE4LjUxTDQzLjYxIDEuNjRzMTUuNDUgMjIuMjggMjguNSA0NC40NWEyMi4zOSAyMi4zOSAwIDAgMSAyLjYxIDcuNTYgMTIuMSAxMi4xIDAgMCAxIDAgMy42M2MuMzQtLjYzIDEtMS45MiAxLTEuOTJhMjkuMzUgMjkuMzUgMCAwIDAgMi42Ny04LjU1IDUyLjI4IDUyLjI4IDAgMCAwLS4wNy05LjQzeiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTYgLTEuNjQpIi8+PHBhdGggZD0iTTE1LjQzIDIwLjc0YTkuNzUgOS43NSAwIDAgMSAzLjE4LTMuNWwyMi4zNC0xNS42LTIyLjg5IDM3Ljg1cy0yLTMuMzgtMi43OC01LjA5YTE2LjE5IDE2LjE5IDAgMCAxIC4xNS0xMy42NnpNNi4yMSA0Ni44NWEyNS40NyAyNS40NyAwIDAgMCAxMCAxOC41MWwyNC43MSAxNy4yM3MtMTUuNDYtMjIuMjgtMjguNS00NC40NWEyMi4zOSAyMi4zOSAwIDAgMS0yLjYyLTcuNTYgMTIuMSAxMi4xIDAgMCAxIDAtMy42M2MtLjM0LjYzLTEgMS45Mi0xIDEuOTJhMjkuMzUgMjkuMzUgMCAwIDAtMi42NyA4LjU1IDUyLjI4IDUyLjI4IDAgMCAwIC4wOCA5LjQzem02MyAzYy0uOC0xLjcxLTIuNzgtNS4wOS0yLjc4LTUuMDlMNDMuNTggODIuNTkgNjUuOTIgNjdhOS43NSA5Ljc1IDAgMCAwIDMuMTgtMy41IDE2LjE5IDE2LjE5IDAgMCAwIC4xNS0xMy42NnptOS4wNy0xMi40NmEyNS40NyAyNS40NyAwIDAgMC0xMC0xOC41MUw0My42MSAxLjY0czE1LjQ1IDIyLjI4IDI4LjUgNDQuNDVhMjIuMzkgMjIuMzkgMCAwIDEgMi42MSA3LjU2IDEyLjEgMTIuMSAwIDAgMSAwIDMuNjNjLjM0LS42MyAxLTEuOTIgMS0xLjkyYTI5LjM1IDI5LjM1IDAgMCAwIDIuNjctOC41NSA1Mi4yOCA1Mi4yOCAwIDAgMC0uMDctOS40M3oiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC02IC0xLjY0KSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOmNvbG9yIiBmaWxsPSJ1cmwoI2xpbmVhci1ncmFkaWVudC0zKSIvPjwvZz48L2c+PC9zdmc+'

const GET_SUBDOMAINS = gql`
query getSubdomains($id: ID!) {
  domain(id: $id) {
    id
    labelName
    subdomains {
      id
      labelName
      labelhash
      name
    }
  }
}
`;

async function readOnChainData() {
  // Should replace with the end-user wallet, e.g. Metamask
  const defaultProvider = getDefaultProvider();
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  const ceaErc20 = new Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
  // A pre-defined address that owns some CEAERC20 tokens
  const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
  console.log({ tokenBalance: tokenBalance.toString() });
}

function WalletButton({ provider, loadWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, setProvider] = useState();
  const [myName, setMyName] = useState();
  const [myAddress, setMyAddress] = useState();
  const [myNameAddress, setMyNameAddress] = useState();
  const [value, setValue] = useState();
  const [address, setAddress] = useState();
  const [reverseRecord, setReverseRecord] = useState();
  const [subdomain, setSubdomain] = useState();
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const { data:subdomainData } = useQuery(GET_SUBDOMAINS, {
    skip: !myName,
    variables: { id: namehash(myName) }
  });
  const [ens, setEns] = useState();
  
  const handleAddress = async(event)=>{
    setValue(event.target.value)
  }

  const handleGetAddress = async()=>{
    const _address = await ens.name(value).getAddress()
    setAddress(_address)
  }

  const handleReverseRecord = async(event)=>{
    setReverseRecord(event.target.value)
  }

  const handleSubmitReverseRecord = async()=>{
    let tx = await ens.setReverseRecord(reverseRecord)
    setPending(true)
    await tx.wait()
    setPending(false)
    setConfirmed(true)
    loadWeb3Modal()
  }

  const handleSubdomain = async(event)=>{
    setSubdomain(event.target.value)
  }

  const handleSubmitSubdomain = async()=>{
    let tx = await ens.name(myName).createSubdomain(subdomain)
    setPending(true)
    await tx.wait()
    setPending(false)
    setConfirmed(true)
    loadWeb3Modal()
  }

  /* Open wallet selection modal. */
  const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect();
    const ensAddress = getEnsAddress(newProvider.networkVersion)
    const _provider = new Web3Provider(newProvider)
    const _ens = new ENS({ provider:newProvider, ensAddress })
    const myName = await _ens.getName(newProvider.selectedAddress)
    console.log({
      networkVersion: newProvider.networkVersion,
      ensAddress
    })
    setMyName(myName.name)
    setMyAddress(newProvider.selectedAddress)
    setMyNameAddress(await _ens.name(myName.name).getAddress())
    setProvider(_provider);
    setEns(_ens)
  }, []);

  /* If user has loaded a wallet before, load it automatically. */
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);
  const networkName = provider && provider._network && provider._network.name || 'Not connected to any network'
  const addressMatched = myAddress && myNameAddress && myAddress.toLocaleLowerCase() === myNameAddress.toLocaleLowerCase()
  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} />
      </Header>
      <Body>
        <img src={imgData} className="App-logo" alt="react-logo" />
        <p>
        </p>
        {/* Remove the "hidden" prop and open the JavaScript console in the browser to see what this function does */}
        <Button hidden onClick={() => readOnChainData()}>
          Read On-Chain Balance
        </Button>
        <p>
          { networkName === 'homestead' ? 'mainnet' : networkName }
        </p>
        <p style={{color: pending ? 'yellow' : 'green'}}>
          { pending ? ('Pending...') : (
            confirmed ? ('Confirmed') : ('')
          )}
        </p>

        {
          ens ? (
           <p>
             <h5>Your information</h5>
              <ul>
                <li>
                  My address: { myAddress && myAddress }...
                </li>
                <li style={{color: addressMatched ? 'white' : 'red'}}>
                  My Name: { myName } ({ myNameAddress && myNameAddress.slice(0, 5) }...
                  {
                    !addressMatched ? (
                      <span > address mismatch</span>
                    ) : ('')
                  }
                  )
                </li>
              </ul>

              <h5>ENS name lookup</h5>
              <input onChange={handleAddress} placeholder="Enter ENS name" value={value} ></input>
              <button onClick={handleGetAddress} >  Lookup Name </button>
              <p>{ address }</p>
              <h5>Set reverse record</h5>
              <input onChange={handleReverseRecord} placeholder="Enter ENS name" value={reverseRecord} ></input>
              <button onClick={handleSubmitReverseRecord} > Set </button>
              {addressMatched ? (
                <p>
                  <h5>Create subdomain</h5>
                  <input onChange={handleSubdomain} placeholder="Enter Subdomain" value={subdomain} ></input>
                  <button onClick={handleSubmitSubdomain} > Create </button>
                  {subdomainData ? (
                    <p>
                      <h5>{myName} subdomains</h5>
                      {subdomainData.domain.subdomains.map((s) => {
                        return (<p>{
                          s.labelName
                        }.{myName}</p>)
                      })}
                    </p>
                  ) : ('')}
                </p>
              ): ('')}
            </p>
          ) : ('')
        }
      </Body>
    </div>
  );
}

export default App;
