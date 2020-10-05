import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
});

const endpoints = {
  'homestead': new ApolloClient({ uri: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens'}),
  'ropsten': new ApolloClient({ uri: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensropsten'}),
  'rinkeby': new ApolloClient({ uri: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensrinkeby'}),
  'goerli': new ApolloClient({ uri: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli'})
}
ReactDOM.render(
  <ApolloProvider client={client}>
    <App endpoints = { endpoints } />
  </ApolloProvider>,
  document.getElementById("root"),
);
