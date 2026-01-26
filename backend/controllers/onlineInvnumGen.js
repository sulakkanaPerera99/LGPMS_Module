// import functions from User model

import {
    getgenNum,
    insertGenNum,
    updateGenNum,
     getgenNum2,
    insertGenNum2,
    updateGenNum2,
    
} from "../models/OnlineInvNumGenModel.js";

// get all Users
export const getInvNum=(req,res)=>{
    getgenNum((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get all Users
export const getInvNum2=(req,res)=>{
    getgenNum2(req.params.sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// create user
export const InsertInvNum=(req,res)=>{
    const data = req.body;
    insertGenNum(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const InsertInvNum2=(req,res)=>{
    const data = req.body;
    insertGenNum2(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};



// update user
export const updateInvNum=(req,res)=>{
    const data = req.body;
    updateGenNum(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const updateInvNum2=(req,res)=>{
    const data = req.body;
    const sabha=req.params.sabha
    updateGenNum2(data,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


