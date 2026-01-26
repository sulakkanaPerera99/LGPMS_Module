
import {
    insertlogin

} from "../models/LogModel.js";// create ward
export const addonlinelog=(req,res)=>{
    const data = req.body;
    insertlogin(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
