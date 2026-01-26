// import functions from User model

import {
    getAlldistric,
    getdistrictByID,
    getSabhaOfProvince,
} from "../models/DistrictModel.js";

// get all Districts
export const getAllDistrict=(req,res)=>{
    getAlldistric((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single Districts
export const showDistrict= (req,res)=>{
    getdistrictByID(req.params.pro,(err,results)=> {
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
// Get  Prasabha of District
export const showSabhaOfProvince= (req,res)=>{
    getSabhaOfProvince(req.params.provid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};



