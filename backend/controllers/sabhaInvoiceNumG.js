// import functions from User model

import {
    sabhagetgenNum,
    sabhainsertGenNum,
    sabhaupdateGenNum,
    
} from "../models/SabhaInvoiceNumGModel.js";

// get all Users
// export const sabhagetInvNum=(req,res)=>{
//     sabhagetgenNum((err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };
//by sabha
export const sabhagetInvNum =(req,res)=>{
    sabhagetgenNum(req.params.sid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create user
export const sabhaInsertInvNum=(req,res)=>{
    const data = req.body;
    sabhainsertGenNum(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// update user
// export const sabhaupdateInvNum=(req,res)=>{
//     const data = req.body;
//     sabhaupdateGenNum(data,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };
//update sabha inv num by sabha
export const sabhaupdateInvNum=(req,res)=>{
    const data = req.body;
    const sbid = req.params.sbid;
    sabhaupdateGenNum(data,sbid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

