// import functions from Employee model

import {
    getAllUser,
    getUserByNic,
    insertUser,
    updateProfileByNic,
    updatePassword,
    updateLevel,
    getUserByLevel,
    getSabhaEmployees,
    getUserByNicPass,
    updateLevelbySabha,
    getAdminsByProv,
    inactiveEmp,
    deleteSabhaEmployee,
    getAllProvinceAdmins,
    getSecretariesByProv,
    updateEmppassword,
    updateEmpAdmin
} from "../models/EmployeeModel.js";

// get all Users
export const allUsers=(req,res)=>{
    getAllUser((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single user
export const showAUser = (req,res)=>{
    getUserByNic(req.params.emp_nic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get login passwords for single user
export const VerifyHashPass = (req,res)=>{
    getUserByNicPass(req.params.enic,req.params.epass,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create user
export const createAccount=(req,res)=>{
    const data = req.body;
    insertUser(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// update Profile
export const updateProfile=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    updateProfileByNic(data,id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// update PAssword
//this one not working
export const updatePass=(req,res)=>{
    const data = req.body;
    const passnic = req.params.passnic;
    updatePassword(data,passnic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//new update password
export const empUpdatePass=(req,res)=>{
    const data = req.body;
    const employnic = req.params.employnic;
    updateEmppassword(data,employnic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// update status old
export const updateState=(req,res)=>{
    const data = req.body;
    const levid = req.params.levid;
    updateLevel(data,levid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// update status by sabha new
export const updateStatebySabha=(req,res)=>{
    const data = req.body;
    const stat = req.params.stat;
    const levid = req.params.levid;
    updateLevelbySabha(data,stat,levid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get users whose level>5
export const UserByLevel = (req,res)=>{
    getUserByLevel(req.params.sbcode,(err,results)=> {
            if (err) {
                res.send(err);
            }else {
                res.json(results);
            }
        });
    };
// get employees of a specific sabha
export const sabhaEmployees =(req,res)=>{
    getSabhaEmployees(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//get admins of province
export const adminsByProv= (req,res)=>{
    
    const prov = req.params.prov;
    const lev = req.params.lev;
    getAdminsByProv(prov,lev,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// inactive employee

export const setInactiveEmp=(req,res)=>{
    const data = req.body;
    const enic = req.params.enic;
   
    inactiveEmp(data,enic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//delete employee of sabha
export const deleteEmpBySabha=(req,res)=>{
    const eid = req.params.eid;
    deleteSabhaEmployee(eid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get province admins
export const allProvinceAdmins = (req,res)=>{
    getAllProvinceAdmins(req.params.levl,(err,results)=> {
            if (err) {
                res.send(err);
            }else {
                res.json(results);
            }
        });
    };
    //get secreataries by province
    export const secretariesByProv= (req,res)=>{
    
        const pr = req.params.pr;
     
        getSecretariesByProv(pr,(err,results)=> {
            if (err) {
                res.send(err);
            }else {
                res.json(results);
            }
        });
    };
//update employee --for admins
    export const updateEmpForAdmin=(req,res)=>{
        const data = req.body;
        const id = req.params.id;
        updateEmpAdmin(data,id,(err,results)=> {
            if (err) {
                res.send(err);
            }else {
                res.json(results);
            }
        });
    };