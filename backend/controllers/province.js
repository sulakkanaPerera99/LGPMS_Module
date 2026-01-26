// import functions from User model

import {
    getAllprovince,
    getprovinceByID,
    insertprovince
} from "../models/ProvinceModel.js";

// get all Users
export const AllProvince=(req,res)=>{
    getAllprovince((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
    
};


// get single user
export const showAprovince= (req,res)=>{
    getprovinceByID(req.params.provid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create user
export const createAccount=(req,res)=>{
    const data = req.body;
    insertprovince(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};




