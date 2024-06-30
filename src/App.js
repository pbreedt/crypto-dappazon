import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Dappazon from './abis/Dappazon.json'

// Config
import config from './config.json'

function App() {
  let [account, setAccount] = useState(null)
  let [provider, setProvider] = useState(null)
  let [dappazon, setDappazon] = useState(null)

  const [electronics, setElectronics] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [toys, setToys] = useState(null)
  
  const [toggle, setToggle] = useState(false)
  const [item, setItem] = useState({})

  const loadBlockchainData = async () => {
    // connect blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()
    console.log("network:", network)

    // connect to smart contract (JS version of contract)
    const dappazon = new ethers.Contract(
      config[network.chainId].dappazon.address,
      Dappazon,
      provider
    )
    setDappazon(dappazon)

    // load products
    const items = []
    for (let i = 1; i <= 9; i++){
      const item = await dappazon.items(i)
      items.push(item)
    }
    console.log("Products:", items)

    const electronics = items.filter((item) => item.category === 'electronics' )
    const clothing = items.filter((item) => item.category === 'clothing')
    const toys = items.filter((item) => item.category === 'toys')
    console.log("electronics", electronics)
    console.log("clothing", clothing)
    console.log("toys", toys)

    setElectronics(electronics)
    setClothing(clothing)
    setToys(toys)
  }

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount}/>
      <h2>Best Sellers</h2>

      { electronics && clothing && toys && (
          <>
          <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop} />
          <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop} />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
          </>          
      )}

      {toggle && (
        <Product item={item} provider={provider} account={account} dappazon={dappazon} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
