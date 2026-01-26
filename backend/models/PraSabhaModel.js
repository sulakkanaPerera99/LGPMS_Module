// import connection
import db from "../config/database.js";

// get single user
export const getSabhaByCode = (data,result) => {
    //emp_prs_code
    db.query("SELECT * FROM pra_sabha WHERE sb_code  = ?",[data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

//update Sabha Profile
export const updateSabhaByCode = (data,sb_code,result) => {
    db.query("UPDATE pra_sabha SET fax = ?, sb_contact = ?, sb_email = ?, sb_address = ?, vat_num = ?, saba_ipg = ?,fine_date=?,fine_rate=?,assess_vote=?,assess_fine_vote=?,assess_arrears_vote=? WHERE sb_code = ?",[data.fax, data.sb_contact, data.sb_email, data.sb_address,data.vat_num,data.saba_ipg,data.fine_date,data.fine_rate,data.assess_vote,data.assess_fine_vote,data.assess_arrears_vote, sb_code], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get pra sabha's of Province
//SELECT pr.sb_code,pr.sb_name_en, pr.sb_name_sin FROM `district` AS d, province AS p, pra_sabha AS pr WHERE d.dist_province = p.pro_code AND pr.sb_distcode =d.dist_code AND p.pro_code= 'PRO2';
export const getSabhaOfProv = (data,result) => {
    //emp_prs_code
    db.query("SELECT pr.sb_code,pr.sb_name_en, pr.sb_name_sin FROM `district` AS d, province AS p, pra_sabha AS pr WHERE d.dist_province = p.pro_code AND pr.sb_distcode =d.dist_code AND p.pro_code= ?;",[data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
