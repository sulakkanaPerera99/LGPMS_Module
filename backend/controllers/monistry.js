// import functions from User model

import {
    getProvinceIncome,
    getSabhaInfoByProID,
    getIncomebySbHead,
    getIncomeBySabha,
    getsecretaries,
    getemployees,
    getmonthlyIncome,
    getProvinceIncomemonthly
    // insertprovince
} from "../models/MinistryModel.js";

// get all Users
export const ProvinceIncome=(req,res)=>{
    getProvinceIncome(req.params.province,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
    
};
//get details of sabha by province id getIncomebySbHead
export const sabhaInfoByProvince=(req,res)=>{
    getSabhaInfoByProID(req.params.proid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
    
};

// get single user
export const IncomeBysabhaHead= (req,res)=>{
    getIncomebySbHead(req.params.sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// // cincome by Sabha
export const IncomeBysabha=(req,res)=>{
    getIncomeBySabha(req.params.sabaid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//get details of secretaries
export const prosecretaries=(req,res)=>{
    getsecretaries(req.params.pro,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
    
};
//get details of secretaries
export const proemployees=(req,res)=>{
    getemployees(req.params.pro,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
    
};

//get Monthly report by province
export const monthlyincomeByProvince=(req,res)=>{
    getmonthlyIncome(req.params.proid,req.params.repyear,req.params.repmonth,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
    
};
//get Monthly Totla income report by province
export const monthlyTotalincomeByProvince=(req,res)=>{
    getProvinceIncomemonthly(req.params.province,req.params.repyear,req.params.repmonth,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
    
};

