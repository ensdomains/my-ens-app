
This is a sample app showcasing [`ensjs`](https://www.npmjs.com/package/@ensdomains/ensjs) library to interact with ENS.
This project was bootstrapped with [Create Eth App](https://github.com/paulrberg/create-eth-app).

### How to setup

```
git clone https://github.com/ensdomains/my-ens-app.git
cd my-ens-app
yarn
cd packages/react-app
yarn start
```

### Code guide

This demo app shows three basic ways to integrate ENS into your dapp.

- Resolve ENS name
- Support reverse resolution
- Let users name things

All the logic is in [App.js](https://github.com/ensdomains/my-ens-app/blob/master/packages/react-app/src/App.js)


## Instantiate ENS 

```
import ENS, { getEnsAddress } from '@ensdomains/ensjs'
const ensAddress = getEnsAddress('1') // Pass chainId
const ens = new ENS({ provider, ensAddress })
```

## Resolve ENS name

```
await ens.name(name).getAddress()
```

## Support reverse resolution

Getting reverse name

```
ens.getName(address)
```

Setting reverser name

```
let tx = await ens.setReverseRecord(address)
tx.wait()
```

## Let users name things

```

let tx = await ens.name(myName).createSubdomain(subdomain)
tx.wait()
```

As an extra bonus, it shows how to query [ENS subgraph](https://thegraph.com/explorer/subgraph/ensdomains/ens) to retrieve events such as list of subdomains

```
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
```


For more detail, please look into our [guide](https://docs.ens.domains/dapp-developer-guide/working-with-ens)