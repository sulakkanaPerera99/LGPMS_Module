// import functions from User model

import {
    getAllUser,
    getUserByNIC,
    insertUser,
    updateProfileByNic,
    getUserByNICPass,
    updatepassword,
    getsabhaByNIC,
    insertUsersabha,
    deleteCusSabha
} from "../models/CustomerModel.js";

// get all Users
export const Users=(req,res)=>{
    getAllUser((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single user
export const AUser = (req,res)=>{
    getUserByNIC(req.params.nic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get single user
export const AUsersabha = (req,res)=>{
    getsabhaByNIC(req.params.nic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get single user
export const VerifyPass = (req,res)=>{
    getUserByNICPass(req.params.nic,req.params.pass,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create usersabha
export const registerusersabha=(req,res)=>{
    const data = req.body;
    insertUsersabha(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// delete usersabha
export const Deleteusersabha=(req,res)=>{
    const sabha = req.params.sabha;
    deleteCusSabha(sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// create user
export const register=(req,res)=>{
    const data = req.body;
    insertUser(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// update user
export const updateUser=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    updateProfileByNic(data,id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// update user
export const Passwordupdate=(req,res)=>{
    const data = req.body;
    const usernic = req.params.usernic;
    updatepassword(data,usernic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

