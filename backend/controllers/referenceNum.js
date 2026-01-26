import {
    getSabhaRefNum,
    updateSabhaRefNum
    
} from "../models/ReferenceNumModel.js";

//get Sabha reference number
export const SabhaRefNum =(req,res)=>{
    getSabhaRefNum(req.params.refsabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//update reference number for nextexport const sabhaupdateInvNum=(req,res)=>{
    export const UpdateRefNumbySabha=(req,res)=>{
        const data = req.body;
        const sbid = req.params.sbid;
        updateSabhaRefNum(data,sbid,(err,results)=> {
            if (err) {
                res.send(err);
            }else {
                res.json(results);
            }
        });
    };
    