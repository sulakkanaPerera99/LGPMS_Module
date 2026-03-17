// import connection
import db from "../config/database1.js";

export const getProvinceIncome = (province, result) => {
    db.query(
        `SELECT d.dist_province, SUM(i.total_amount) AS invoice_count 
         FROM pra_sabha AS s 
         LEFT JOIN invoice AS i ON s.sb_code = i.sabha 
         LEFT JOIN district AS d ON d.dist_code = s.sb_distcode 
         WHERE d.dist_province = ? AND i.invoice_status='0' AND YEAR(i.date) = YEAR(NOW()) AND i.sabha NOT IN ('PRA000', 'PR1000')
         ORDER BY invoice_count DESC`, 
        [province], 
        (err, results) => {
            if (err) {
                console.log(err);
                result(err, null);
            } else {
                result(null, results);
            }
        }
    );
};
// get details of sabha by province id
// export const getSabhaInfoByProID = (proid,result) => {
//     db.query("SELECT s.sb_code, s.sb_name_en, SUM(i.total_amount) AS invoice_count FROM pra_sabha AS s LEFT JOIN invoice AS i ON s.sb_code = i.sabha LEFT JOIN district AS d ON d.dist_code = s.sb_distcode WHERE d.dist_province = ? AND YEAR(i.date) = YEAR(NOW()) GROUP BY s.sb_code, s.sb_name_en  ORDER BY invoice_count DESC;",[proid], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
export const getSabhaInfoByProID = (proid, result) => {
    db.query(
        `SELECT s.sb_code, s.sb_name_en, SUM(i.total_amount) AS invoice_count 
         FROM pra_sabha AS s 
         LEFT JOIN invoice AS i ON s.sb_code = i.sabha 
         LEFT JOIN district AS d ON d.dist_code = s.sb_distcode 
         WHERE d.dist_province = ? AND i.invoice_status='0' AND YEAR(i.date) = YEAR(NOW()) AND i.sabha NOT IN ('PRA000', 'PR1000')
         GROUP BY s.sb_code, s.sb_name_en  
         ORDER BY invoice_count DESC`, 
        [proid], 
        (err, results) => {
            if (err) {
                console.log(err);
                result(err, null);
            } else {
                result(null, results);
            }
        }
    );
};
// get details of sabha by province id

// export const getIncomebySbHead = (sabha,result) => {
//     db.query("SELECT i.sb_rate_head,s.sb_rate_head_name,SUM(i.amount) AS summary,SUM(i.stamp) AS st_sum,SUM(i.vat) AS vat_sum,SUM(i.discount) AS dis_sum FROM sb_rates_new AS s LEFT JOIN tempory_invoice_save AS i ON s.rate_sb_code = i.sabha  AND s.sb_rate_head=i.sb_rate_head WHERE i.sabha =? AND YEAR(i.date) = YEAR(NOW())  GROUP BY i.sb_rate_head ORDER BY summary DESC",[sabha], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
export const getIncomebySbHead = (sabha, result) => {
    db.query(
        `SELECT i.sb_rate_head, s.sb_rate_head_name, SUM(i.amount) AS summary, 
                SUM(i.stamp) AS st_sum, SUM(i.vat) AS vat_sum, SUM(i.discount) AS dis_sum 
         FROM sb_rates_new AS s 
         LEFT JOIN tempory_invoice_save AS i ON s.rate_sb_code = i.sabha AND s.sb_rate_head = i.sb_rate_head 
         WHERE i.sabha = ? AND i.invoice_status='0' AND YEAR(i.date) = YEAR(NOW()) 
         GROUP BY i.sb_rate_head 
         ORDER BY summary DESC`, 
        [sabha], 
        (err, results) => {
            if (err) {
                console.log(err);
                result(err, null);
            } else {
                result(null, results);
            }
        }
    );
};

// get single income by sabha
export const getIncomeBySabha= (sabaid,result) => {
    db.query("SELECT s.sb_code,s.sb_name_en, SUM(i.total_amount) AS invoice_count FROM pra_sabha AS s LEFT JOIN invoice AS i ON s.sb_code = i.sabha WHERE s.sb_code=? AND i.invoice_status='0'",[sabaid], (err,results)=> {
        
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// get details of secretaries
export const getsecretaries = (pro,result) => {
    // db.query("SELECT * FROM employee WHERE user_level='4' AND emp_pro_code=?",[pro], (err,results)=> {
        db.query("SELECT * FROM pra_sabha AS s LEFT JOIN employee AS i ON s.sb_code = i.emp_prs_code LEFT JOIN district AS d ON d.dist_code = s.sb_distcode WHERE d.dist_province =? AND  i.user_level=4 AND i.emp_prs_code NOT IN ('PRA000', 'PR1000') ORDER BY s.sb_code  DESC",[pro], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get details of employees
export const getemployees= (pro,result) => {
    db.query("SELECT * FROM pra_sabha AS s LEFT JOIN employee AS i ON s.sb_code = i.emp_prs_code LEFT JOIN district AS d ON d.dist_code = s.sb_distcode WHERE d.dist_province =? AND  i.user_level>4 AND i.emp_prs_code NOT IN ('PRA000', 'PR1000') ORDER BY s.sb_code  DESC",[pro], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// // get Monthly report by province
export const getmonthlyIncome = (proid,repyear,repmonth,result) => {
    db.query(
        `SELECT s.sb_code, s.sb_name_en, SUM(i.total_amount) AS invoice_count 
         FROM pra_sabha AS s 
         LEFT JOIN invoice AS i ON s.sb_code = i.sabha 
         LEFT JOIN district AS d ON d.dist_code = s.sb_distcode 
         WHERE d.dist_province = ?
         AND i.invoice_status='0' 
         AND YEAR(i.date) = ?
         AND MONTH(i.date) = ?
         AND i.sabha NOT IN ('PRA000', 'PR1000')
         GROUP BY s.sb_code, s.sb_name_en  
         ORDER BY invoice_count DESC`, 
        [proid,repyear,repmonth], 
        (err, results) => {
            if (err) {
                console.log(err);
                result(err, null);
            } else {
                result(null, results);
            }
        }
    );
};
///get province Total Income in Monthly
export const getProvinceIncomemonthly = (province,repyear,repmonth, result) => {
    db.query(
        `SELECT d.dist_province, SUM(i.total_amount) AS invoice_count 
         FROM pra_sabha AS s 
         LEFT JOIN invoice AS i ON s.sb_code = i.sabha 
         LEFT JOIN district AS d ON d.dist_code = s.sb_distcode 
         WHERE d.dist_province = ? 
         AND i.invoice_status='0' 
        AND YEAR(i.date) = ?
         AND MONTH(i.date) = ?
         AND i.sabha NOT IN ('PRA000', 'PR1000')
         ORDER BY invoice_count DESC`, 
        [province,repyear,repmonth], 
        (err, results) => {
            if (err) {
                console.log(err);
                result(err, null);
            } else {
                result(null, results);
            }
        }
    );
};




