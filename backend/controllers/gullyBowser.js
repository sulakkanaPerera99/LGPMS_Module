// import functions from Food model

import {
    getGullyReqest,
    getGullyReqestById,
    GullyReqestAdd,
    updateGullyReqest,
    getGullyReqestBygId,
    deleteGullyReqest,
    getOnlineServiceHeads,
    updateAmountOfBooking,
    updateFeedbackOfBooking
} from "../models/GullyBowserModel.js";

// get all gully_bowser Request
export const showGullyReqest=(req,res)=>{
    const sbcode = req.params.sbcode;
    const stype = req.params.stype;
    getGullyReqest(sbcode,stype,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single gully_bowser Request
export const showGullyReqestById=(req,res)=>{
    getGullyReqestById(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get single gully_bowser Request
export const showGullyReqestBygId=(req,res)=>{
    getGullyReqestBygId(req.params.gid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// insert details of  gully_bowser Request
export const addGullyReqestDetails=(req,res)=>{
    const data = req.body;
    GullyReqestAdd(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// update gully_bowser Request
export const GullyReqestUp=(req,res)=>{
    const Stdata = req.body;
    const gid = req.params.gid;
    updateGullyReqest(Stdata,gid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//delete ully_bowser Request
export const GullyReqestdelete=(req,res)=>{
    const delid = req.params.delid;
    deleteGullyReqest(delid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const onlineServiceHeadsofEmp=(req,res)=>{
    const nic = req.params.nic;
    const scode = req.params.scode;
    getOnlineServiceHeads(nic,scode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//Update amount
export const UpdateBookingAmount=(req,res)=>{
    const amountup = req.body;
    const pstate  = req.body;
    const gid = req.params.gid;
    updateAmountOfBooking(amountup,pstate,gid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//update feedback
export const UpdateBookingFeedback=(req,res)=>{
    const feed = req.body;
    const paystate = req.body;
    const obid = req.params.obid;
    updateFeedbackOfBooking(feed,paystate,obid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};