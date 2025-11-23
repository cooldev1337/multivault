const endpointService = require("../services/endpoint.service");

exports.getorCreateWallet = async (req, res) => {
  try {
    const wallet = await endpointService.getorCreateWallet(req.body);
    res.status(200).json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.listTokenBalances = async (req, res) => {
  try {
    const result = await endpointService.listTokenBalances(req.body.address);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBalanceinusdc = (req,res) =>{
try {
    const balanceInusdc =  endpointService.getBalanceinusdc(req.body.address);
    res.status(200).json(balanceInusdc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
     
}