// import functions from User model

import {
    getAllsabha,
    getsabhaByID,
    getsabhaByCode
} from "../models/SabhaModel.js";

// get all Users
export const getAllprSabha=(req,res)=>{
    getAllsabha((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single Sabha Using dist_code
export const Sabha= (req,res)=>{
    getsabhaByID(req.params.dis_code,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get single Sabha
export const showSabhaDetails= (req,res)=>{
    getsabhaByCode(req.params.Sabha_code,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// // create user
// export const createDistrict=(req,res)=>{
//     const data = req.body;
//     insertdistrict(data,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };




