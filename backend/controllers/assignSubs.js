// import functions from temporyInvoiceModel 

import {
    insertTempSubject,
    getTemporyAssigns,
    deleteSingleSubById,
    insertsubject,
    deleteAllSubs,
    getSavedSubs,
    deleteAssignSub
} from "../models/AssignSubsModel.js";

export const assignTempSubject=(req,res)=>{
    const data = req.body;
    insertTempSubject(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get temp assignations of a specific sabha
export const tempAssigns =(req,res)=>{
    getTemporyAssigns(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//Delete single subject
export const deleteSingleSub=(req,res)=>{
    const id = req.params.id;
    deleteSingleSubById(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//save asign subjects to perment table
export const createSubject=(req,res)=>{
    const data = req.body;
    insertsubject(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// delete all subs in temp subs table
export const deleteSubjects=(req,res)=>{
   
    deleteAllSubs((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get saved subjects of sabha
export const savedSubs =(req,res)=>{
    const sid = req.params.sid;
    const rsid = req.params.rsid;
    getSavedSubs(sid,rsid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//Delete assign subs
export const deleteAssignedSub=(req,res)=>{
    const aid = req.params.aid;
    deleteAssignSub(aid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};