const fileCoinService = require("../services/fileCoin.service");

exports.buy = () => {
  const bot = fileCoinService.buy();
};

exports.upload = (req,res) => {
const { pieceCid, size }= fileCoinService.upload(req.body);
 
  return  res.json({pieceCid: pieceCid, size: size }) ;
};

exports.download = (req,res) => {
  res = fileCoinService.download(req.body);
  return res;
};