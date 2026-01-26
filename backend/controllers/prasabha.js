// get single Sabha
import{
    getSabhaByCode,
    updateSabhaByCode
} from "../models/PraSabhaModel.js";

export const showSabha = (req,res)=>{
    getSabhaByCode(req.params.sb_code,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//updateSabha
export const updateSabha=(req,res)=>{
    const data = req.body;
    const sb_code = req.params.sb_code;
    updateSabhaByCode(data,sb_code,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
///get pra sabha's of Province
export const showSabhaOfProv = (req,res)=>{
    getSabhaOfProv(req.params.pro_code,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};