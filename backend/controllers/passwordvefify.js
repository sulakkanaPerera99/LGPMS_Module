// Import necessary modules
import bcrypt from 'bcrypt';

// ... (other imports and code)

// Function to hash a password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Function to verify a password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// ... (other code)

// When inserting a new user (e.g., in insertUser function)
const hashedPassword = await hashPassword(data.cus_password);
data.cus_password = hashedPassword;
