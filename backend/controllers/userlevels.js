import{
    getAllLevels,
    getAllProvinces,
    getAllLevelsbyLID
} from "../models/UserLevelsModel.js";

// export const allLevels=(req,res)=>{
//     getAllLevels((err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };
export const allLevels=(req,res)=>{
    getAllLevels(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const LevelsbyLID=(req,res)=>{
    getAllLevelsbyLID(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//
export const allProvinces=(req,res)=>{
    getAllProvinces((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};