
// // get single Sabha
import{
  setpaygate
  
} from "../models/paymentclassModel.js";
export const paymentgate = (req,res)=>{
  setpaygate(req.params.id,req.params.amont,(err,results)=> {
      if (err) {
          res.send(err);
      }else {
          res.json(results);
      }
  });
};



