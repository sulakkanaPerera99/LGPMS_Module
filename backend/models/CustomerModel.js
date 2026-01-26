// import connection
import db from "../config/database.js";
import bcrypt from 'bcrypt';

// get all user
export const getAllUser = (result) => {
    db.query("SELECT * FROM customers", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// get single user
export const getUserByNIC= (data,result) => {
    db.query("SELECT * FROM customers WHERE cus_nic = ?",[data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
// get single user
export const getsabhaByNIC= (data,result) => {
    db.query("SELECT * FROM customer_sabha WHERE cus_nic = ?",[data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// remove customer sabha
export const deleteCusSabha= (sabha,result) => {
    db.query("DELETE FROM customer_sabha WHERE sabha = ?",[sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// insert User
export const insertUsersabha = (data,result) => {
    db.query("INSERT INTO customer_sabha SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  };
  

const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  };
  
  export const getUserByNICPass = (nic, pass, result) => {
    db.query("SELECT cus_nic, cus_name, cus_contact, cus_address, cus_email, cus_password FROM customers WHERE cus_nic = ?", [nic], async (err, results) => {
      if (err) {
        console.log(err);
        result(err, null);
      } else {
        const user = results[0];
        if (user) {
          // Assuming data.password is the entered password
          const hashedPasswordFromDB = user.cus_password; // Adjust this line based on your actual data structure
          const isPasswordMatch = await verifyPassword(pass, hashedPasswordFromDB);
  
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
}

// insert User with hashed password
export const insertUser = async (data, result) => {
    const { cus_nic,cus_name,cus_contact,cus_address,cus_email,cus_password} = data;

    try {
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(cus_password, 10);

        // Replace the plain password with the hashed one
        const userData = {cus_nic,cus_name,cus_contact,cus_address,cus_email, cus_password: hashedPassword };

        db.query("INSERT INTO customers SET ?", userData, (err, results) => {
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
    db.query("UPDATE customers SET cus_name = ?, cus_contact = ?, cus_address = ?, cus_email = ? WHERE cus_nic = ?",[data.cus_name, data.cus_contact, data.cus_address, data.cus_email, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


//update Password
export const updatepassword=async (data,usernic,result) => {
    const { cus_password} = data;

    try {
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(cus_password, 10);

        // Replace the plain password with the hashed one
        const userData = {cus_password: hashedPassword };

        db.query("UPDATE customers SET cus_password=? WHERE cus_nic = ?",[hashedPassword, usernic], (err,results)=> {
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
