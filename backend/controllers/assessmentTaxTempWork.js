// import functions from Food model

import {
    getAssessmentTaxTemp,
    getAssessmentTaxByIdTemp,
    insertAssessmentTaxTemp,
    deleteTaxTempById,
    // deleteshopRentsByIdTemp,
} from "../models/AssessmentTaxTempModel.js";

// get all shopRents
export const showAssessmentTaxTemp=(req,res)=>{
    getAssessmentTaxTemp((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single shopRents
export const showAssessmentTaxByIdTemp=(req,res)=>{
    getAssessmentTaxByIdTemp(req.params.cusnic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create shopRents
export const createAssessmentTaxTemp=(req,res)=>{
    const data = req.body;
    insertAssessmentTaxTemp(data,(err,results)=> {
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


// delete Ass temp
export const deleteAssessmentTaxTemp=(req,res)=>{
    const id = req.params.id;
    deleteTaxTempById(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};