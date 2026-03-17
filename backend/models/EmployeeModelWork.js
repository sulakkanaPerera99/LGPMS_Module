// import connection
import db from "../config/database1.js";
import bcrypt from 'bcrypt';

// get all user
export const getAllUser = (result) => {
    db.query("SELECT emp_nic ,emp_name,emp_contact,emp_address,emp_email,emp_prs_code,emp_pro_code,emp_password,emp_status,emp_date,user_level FROM employee", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// get single user
export const getUserByNic = (data,result) => {
    db.query("SELECT * FROM employee WHERE emp_nic = ?",[data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};


// optional helper if you need to hash new passwords
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};
const VerifyHashPass = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  };
export const getUserByNicPass = (enic, epass, result) => {
    db.query("SELECT * FROM employee WHERE emp_nic = ?",[enic],async (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            const user = results[0];
            if (user) {
                // Assuming data.password is the entered password
                const hashedPasswordFromDB = user.emp_password; // Adjust this line based on your actual data structure
                const isPasswordMatch = await VerifyHashPass(epass, hashedPasswordFromDB);
        
                if (isPasswordMatch) {
                  result(null, user);
                } 
                else {
                  result("error", null);
                }
              } else {
                result("not", null);
              }
        }
    });
};
// Verify hashed password///////////////////////
// export const getUserByNicPass = (enic, epass, result) => {
//     db.query("SELECT * FROM employee WHERE emp_nic = ?", [enic], async (err, results) => {
//         if (err) return result(err, null);

//         const user = results[0];
//         if (!user) return result(null, null); // NIC not found

//         const match = await bcrypt.compare(epass, user.emp_password);
//         if (!match) return result(null, null); // password incorrect

//         result(null, user); // success
//     });
// };

// insert User b4 hashed password//////////////////////
// export const insertUser = (data,result) => {
//     db.query("INSERT INTO employee SET ?",data, (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results[0]);
//         }
//     });
// };
// insert User with hashed password
export const insertUser = async (data, result) => {
    const { emp_nic , emp_password, ...otherData } = data;

    try {
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(emp_password, 10);

        // Replace the plain password with the hashed one
        const userData = { ...otherData, emp_nic , emp_password: hashedPassword };

        db.query("INSERT INTO employee SET ?", userData, (err, results) => {
            if (err) {
                console.log(err);
                result(err, null);
            } else {
                result(null, results[0]);
            }
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        result(error, null);
    }
};


// update Profile
export const updateProfileByNic = (data,id,result) => {
    db.query("UPDATE employee SET emp_name = ?, emp_contact = ?, emp_address = ?, emp_email = ? WHERE emp_nic = ?",[data.emp_name, data.emp_contact, data.emp_address, data.emp_email, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// updatePasswordByNic
export const updatePassword = (data,passnic,result) => {
    db.query("UPDATE employee SET emp_password = ? WHERE emp_nic = ?",[ data.emp_password, passnic], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const updateEmppassword=async (data,employnic,result) => {
    const { emp_password} = data;

    try {
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(emp_password, 10);

        // Replace the plain password with the hashed one
        const userData = {emp_password: hashedPassword };

        db.query("UPDATE employee SET emp_password=? WHERE emp_nic = ?",[hashedPassword, employnic], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
    } catch (error) {
        console.error('Error hashing password:', error);
        result(error, null);
    }
};
//update Status
export const updateLevel = (data,levid,result) => {
    db.query("UPDATE employee SET status = ? WHERE user_level >= ?",[ data.status, levid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//update Status by sabha
export const updateLevelbySabha = (data,stat,levid,result) => {
    db.query("UPDATE employee SET status = ? WHERE emp_prs_code = ? AND user_level >= ?",[data.status, stat,levid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get employees whose level is grateer than 5
export const getUserByLevel = (sbcode,result) => {
    db.query("SELECT * FROM employee WHERE user_level >= 6 AND emp_prs_code = ? ORDER BY user_level",[sbcode], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get employees of specific sabha

export const getSabhaEmployees = (id,result) => {
    db.query("SELECT * FROM employee WHERE emp_prs_code = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// select all admis of a province
export const getAdminsByProv= (prov,lev,result) => {
    db.query("SELECT * FROM employee AS e, pra_sabha AS p WHERE e.emp_pro_code = ? AND e.user_level = 5 AND e.emp_prs_code=p.sb_code ",[prov,lev], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//inactive employees
export const inactiveEmp = (data,enic,result) => {
    db.query("UPDATE employee SET emp_status = ? WHERE emp_nic = ?",[ data.emp_status,enic], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//delete employee of sabha
export const deleteSabhaEmployee = (eid,result) =>  {
    db.query("DELETE FROM employee WHERE emp_nic = ?",[eid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get province admins
export const getAllProvinceAdmins = (levl,result) => {
    db.query("SELECT * FROM employee AS e, province AS p WHERE e.user_level = 2 AND e.emp_pro_code=p.pro_code",[levl], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// export const getSecretariesByProv= (pr,result) => {
//     db.query("SELECT * FROM employee WHERE emp_pro_code = ? AND user_level = 4 ",[pr], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
export const getSecretariesByProv= (pr,result) => {
    db.query("SELECT * FROM employee As e, pra_sabha AS p WHERE e.emp_pro_code = ? AND e.user_level = 4 AND e.emp_prs_code=p.sb_code",[pr], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//update employee --for admins
export const updateEmpAdmin = (data,id,result) => {
    db.query("UPDATE employee SET emp_name = ?, emp_contact = ?, emp_address = ?, emp_email = ?, user_level= ? WHERE emp_nic = ?",[data.emp_name, data.emp_contact, data.emp_address, data.emp_email, data.user_level, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};