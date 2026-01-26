import {
    insertData,

} from "../models/EstModel.js";

// create user
export const addData=(req,res)=>{
    const data = req.body;
    insertData(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};