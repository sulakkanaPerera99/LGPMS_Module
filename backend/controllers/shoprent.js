// import functions from Food model

import {
    getshopRents,
    getshopRentsById,
    insertshopRents,
    // updateFoodById,
    deleteshopRentsById,
    getshopRentsReceipt,
    getshopRentsByDate,
} from "../models/ShopRentModel.js";

// get all shopRents
export const showshopRents=(req,res)=>{
    getshopRents((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single shopRents
export const showshopRentsById=(req,res)=>{
    getshopRentsById(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get single shopRents
export const showshopRentsReciept=(req,res)=>{
    getshopRentsReceipt(req.params.receipt,req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create shopRents
export const createshopRents=(req,res)=>{
    const data = req.body;
    insertshopRents(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get single shopRents by DATE 
export const showRentsByDATE=(req,res)=>{
    const sabhaid = req.params.sabhaid;
    const payyear = req.params.payyear;
    const paymonth = req.params.paymonth;
    const cusnic = req.params.cusnic;
    const placeid = req.params.placeid;
    const shopid = req.params.shopid;
    getshopRentsByDate(sabhaid,payyear,paymonth,cusnic,placeid,shopid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// // update Food
// export const updateFood=(req,res)=>{
//     const data = req.body;
//     const id = req.params.id;
//     updateFoodById(data,id,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };


// delete shopRents
export const deleteshopRents=(req,res)=>{
    const id = req.params.id;
    deleteshopRentsById(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};