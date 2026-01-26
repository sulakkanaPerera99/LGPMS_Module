// import functions from User model

import {
    getAllIncomeHeads,
    getIncomeHeadID
} from "../models/PayHeadModel.js";

// get all Income Heads
export const AllIncomeHeads=(req,res)=>{
    getAllIncomeHeads((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single income head
export const showIncomeHead= (req,res)=>{
    getIncomeHeadID(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

