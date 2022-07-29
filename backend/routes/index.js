var express = require('express');
var router = express.Router();
var axios = require('axios');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const dweb = (cid) => `https://${cid}.ipfs.dweb.link/`;
const web3storage_API_KEY = process.env['WEB3STORAGE_API_KEY'];
const pexels_API_KEY = process.env["PEXELS_API_KEY"];
const nftport_API_KEY = process.env["NFTPORT_API_KEY"];
const MINT_ADDRESS = "0x2028879b223444A417D239616fE060a15aef46A9";

async function listUploads() {
  const requestURL = `https://api.web3.storage/user/uploads`;
  return axios.get(requestURL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${web3storage_API_KEY}`
      }
    })
    .catch((err) => console.error("listUploads error ", err));
}

router.get('/search', async function (req, res, next) {
  let results = await listUploads();
  let uniqueCode = req.query.uniqueCode.replaceAll(" ", "");
  console.log("results", results.data);
  let files = await Promise.all(results.data.map(upload => axios.get(dweb(upload.cid))));
  console.log(files.filter(resp => resp.data.device_pinValue !== undefined).map(resp => resp.data));
  let filtered = files.filter(resp => resp.data.device_pinValue !== undefined && resp.data.device_pinValue.replaceAll(" ", "") === uniqueCode);
  res.json({
    "filtered": filtered.map(resp => resp.data),
    "uniqueCode": uniqueCode
  })
});

router.get('/nfts/images', async function (req, res, next) {
  let page = req.query.page;
  let per_page = req.query.per_page;
  let query = req.query.query;
  const imageResp = await axios
    .get(`https://api.pexels.com/v1/search?query=${query}&page=${page}&per_page=${per_page}`, {
      headers: {
        "Authorization": pexels_API_KEY
      }
    });
  console.log("imageResp", imageResp.data);
  res.json({
    "photos": imageResp.data.photos
  });
});

router.get('/nfts/owned', async function (req, res, next) {
  const chain = req.query.chain;
  const include = req.query.include;
  const url = `https://api.nftport.xyz/v0/accounts/${MINT_ADDRESS}?chain=${chain}&include=${include}`;
  const owned = await axios.get(url, {
    headers: {
      "Authorization": nftport_API_KEY
    }
  });
  res.json(owned.data);
});

router.post('/nfts/mint', async function (req, res, next) {
  const uniqueCode = req.body.uniqueCode;
  const imgUrl = req.body.imgUrl;

  const mintUrl = "https://api.nftport.xyz/v0/mints/easy/urls";

  const data = {
    "chain": "rinkeby",
    "name": `Trail Completionist No. ${uniqueCode}`,
    "description": "A Trail Completionist NFT is awarded to those that volunteer to help sustain trails and report activity in them.",
    "file_url": imgUrl,
    "mint_to_address": MINT_ADDRESS
  };

  const mintResp = await axios.post(mintUrl, data, {
    headers: {
      "Authorization": nftport_API_KEY
    }
  });

  res.json(mintResp.data);
});

router.get('/nfts/mint/poll', async function (req, res, next) {
  const hash = req.query.hash;
  const mineUrl = `https://api.nftport.xyz/v0/mints/${hash}?chain=rinkeby`
  const mineStatus = await axios.get(mineUrl, {
    headers: {
      "Authorization": nftport_API_KEY
    }
  });

  res.json(mineStatus.data);
});

module.exports = router;