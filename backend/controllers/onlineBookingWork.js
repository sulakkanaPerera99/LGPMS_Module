// import functions from Food model

import {
    getOnBookingReqest,
    getOnBookingReqestById,
    OnBookingReqestAdd,
    updateOnBookingReqest,
    getOnBookingReqestBygId,
    deleteOnBookingReqest,
    getReqestByserviceType
} from "../models/OnlineBookingModel.js";

// get all online_booking Request
export const showOnBookingReqest=(req,res)=>{
    const sbcode = req.params.sbcode;
    getOnBookingReqest(sbcode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single online_booking Request
export const showOnBookingReqestById=(req,res)=>{
    getOnBookingReqestById(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get single online_booking Request BY Service Type
export const showReqestByType=(req,res)=>{
    getReqestByserviceType(req.params.nic,req.params.stype,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single online_booking Request
export const showOnBookingReqestBygId=(req,res)=>{
    getOnBookingReqestBygId(req.params.gid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// insert details of  online_booking Request
export const addOnBookingReqestDetails=(req,res)=>{
    const data = req.body;
    OnBookingReqestAdd(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// update online_booking Request
export const OnBookingReqestUp=(req,res)=>{
    const Stdata = req.body;
    const gid = req.params.gid;
    updateOnBookingReqest(Stdata,gid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//delete ully_bowser Request
export const OnBookingReqestdelete=(req,res)=>{
    const delid = req.params.delid;
    deleteOnBookingReqest(delid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


