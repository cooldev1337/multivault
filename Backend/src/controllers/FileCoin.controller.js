const fileCoinService = require("../services/fileCoin.service");

exports.buy = (req,res) => {
  const bot = fileCoinService.buy();
  return bot;
};

exports.upload = (req,res) => {
const { pieceCid, size }= fileCoinService.upload(req.body);

  return  res.json({pieceCid: pieceCid, size: size }) ;
};

exports.download = (req,res) => {
  res = fileCoinService.download(req.body);
  return res;
};