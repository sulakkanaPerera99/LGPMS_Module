// import functions from User model

import {
    getAllKeys,
    getKeyBySabha,
    insertKey
   
} from "../models/SabhaKeyModel.js";

// get all sabha Keys
export const getKeys=(req,res)=>{
    getAllKeys((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single sabha Keys
export const sabhaKeys = (req,res)=>{
    getKeyBySabha(req.params.sbid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create sabha Keys
export const AddKeys=(req,res)=>{
    const data = req.body;
    insertKey(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// update user
// export const updateUser=(req,res)=>{
//     const data = req.body;
//     const id = req.params.id;
//     updateProfileByNic(data,id,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };


