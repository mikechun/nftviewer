import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState<any[]>([]);


  const lookupNFT = async (address:string) => { 
    setLoading(true);
    const response = await fetch(`https://eth-mainnet.g.alchemy.com/demo/v1/getNFTs/?owner=${address}`)
    //const response = await fetch(`https://eth-mainnet.g.alchemy.com/U42YTQClHQMz1dRyy087pHijX8I2-VTC/v1/getNFTs/?owner=${address}`)
    const data = await response.json();
    const res = [];

    setLoading(false);
    for (let i=0; i < data.ownedNfts.length; i++) {
      const val = data.ownedNfts[i];
      const address = val.contract.address;
      const tokenId = val.id.tokenId;
      const meta = await getNftMeta(address, tokenId);
      // res.push(await getNftMeta(address, tokenId));
      res.push(meta);
      setNfts(res);
    }
    
  } 

  const getNftMeta = async (address:string, tokenId: string) => {
    const response = await fetch(`https://eth-mainnet.g.alchemy.com/demo/v1/getNFTMetadata?contractAddress=${address}&tokenId=${tokenId}&tokenType=erc721`);
    //const response = await fetch(`https://eth-mainnet.g.alchemy.com/U42YTQClHQMz1dRyy087pHijX8I2-VTC/v1/getNFTMetadata?contractAddress=${address}&tokenId=${tokenId}&tokenType=erc721`);
    return response.json();
  }

  const handleAddressChange = (e:React.FormEvent<HTMLInputElement>)=> {
    const val = e.currentTarget.value.trim(); 
    setAddress(val);
    if (val.length == '0xeb834ae72b30866af20a6ce5440fa598bfad3a42'.length) {
      lookupNFT(val);
      return;
    }
    setNfts([]);
  }
  

  return (
    <div className="App">
      <header className="App-header">
        <h6>Enter your NFT address below</h6>
        <input type="text" value={address} onChange={handleAddressChange} />
        { loading && <p>Loading..</p> }
        { nfts.map(nft => {
            return renderNft(nft);
          })
        }
      </header>
    </div>
  );
}

function renderNft(nft:any) {
  let dataJson:any = {};
  const nftData:any = {};

  if ('name' in nft) {
    nftData['name'] = nft['name'];
  }

  if ('metadata' in nft) {
    const imageUrl = nft['metadata']['image'];

    if (imageUrl.startsWith('ipfs://')) {
      nftData['image'] = `https://ipfs.io/ipfs/${imageUrl.split('//')[1]}`;
    }
    else {
      nftData['image'] = imageUrl;
    }
    
  }
  else if ('externalDomainViewUrl' in nft) {
    console.log(nft);
    
    const [_, data] = nft['externalDomainViewUrl'].split(',');
    const dataJson = JSON.parse(atob(data));
    nftData['image'] = dataJson['image'];

  }
  return <div><div>Name: { dataJson['name'] }</div><div><img className='nftImage' src={nftData['image']} /></div></div>;
};

export default App;
