// import functions from Food model

import {
    getshopRentsTemp,
    getshopRentsByIdTemp,
    insertshopRentsTemp,
    // updateFoodById,
    deleteshopRentsByIdTemp,
} from "../models/ShopRentTempModel.js";

// get all shopRents
export const showshopRentsTemp=(req,res)=>{
    getshopRentsTemp((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single shopRents
export const showshopRentsByIdTemp=(req,res)=>{
    getshopRentsByIdTemp(req.params.cusnic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create shopRents
export const createshopRentsTemp=(req,res)=>{
    const data = req.body;
    insertshopRentsTemp(data,(err,results)=> {
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
export const deleteshopRentsTemp=(req,res)=>{
    const id = req.params.id;
    deleteshopRentsByIdTemp(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};