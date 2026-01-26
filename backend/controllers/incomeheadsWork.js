import{
    // getAllIncomeHeads,
    // insertIncomeHead,
    getHeadByHeadId,
    getHeadBySubject,
    // getSabhaIheads,
    // deleteRateBySabha,
    getPrograms,
    getProgramHeads,
    getRevenueType,
    insertVoteNew,
    getAllNewVotes,
    deleteNewVotes,
    getAllNewVotesview
    
} from "../models/IncomeHeadsModel.js";

// export const allIncomeHeads=(req,res)=>{
//     getAllIncomeHeads((err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };

// create income head
// export const createHead=(req,res)=>{
//     const data = req.body;
//     insertIncomeHead(data,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };
// get single user
export const showAHeadIds = (req,res)=>{
    const sbcode =req.params.sbcode;
    const ratehead =req.params.ratehead;
    getHeadByHeadId(sbcode,ratehead,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// export const showAHeadIds = (req,res)=>{
//     getHeadByHeadId(req.params.rate_head_id	,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };
///get subjects income heads by sabha
export const subByNicOfSabha=(req,res)=>{
    const id = req.params.id;
    const sbcode = req.params.sbcode;
    getHeadBySubject(id,sbcode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get income heads of each sabha
// export const sabhaIheads=(req,res)=>{
//     const scode = req.params.scode;
//     getSabhaIheads(scode,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };
//delete sabha rate by id
// export const deleteRbySabha=(req,res)=>{
//     const sid = req.params.sid;
//     const rid = req.params.rid;
//     const vid = req.params.vid;
//     deleteRateBySabha(sid,rid,vid,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };
export const allPrograms=(req,res)=>{
    getPrograms((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const allProgramHeads=(req,res)=>{
    getProgramHeads((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//getRevenueType
export const revenueType=(req,res)=>{
    const rty = req.params.rty;
    getRevenueType(rty,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const createVoteNew=(req,res)=>{
    const data = req.body;
    insertVoteNew(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const allNewVotes=(req,res)=>{
    
    getAllNewVotes(req.params.sbcode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const allNewVotesdata=(req,res)=>{
    
    getAllNewVotesview(req.params.sbcode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const deleteVotes=(req,res)=>{
    const id = req.params.id;
    deleteNewVotes(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};