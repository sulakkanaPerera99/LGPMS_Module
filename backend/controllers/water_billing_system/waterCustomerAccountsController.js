import { getProjectNumberByCode } from '../../models/water_billing_system/waterprojectsModel.js';
import { getCustomerCountBySabhaAndProject, insertCustomer, getCustomersBySabha, updateCustomer ,getSabhaCustomerByNIC , insertSabhaCustomer } from '../../models/water_billing_system/waterCustomerAccountsModel.js';

export const registerCustomer = async (req, res) => {
    try {
        const {
            customerType,
            oldBillNumber,
            currentReading,
            fullName,
            nic,
            propertyAddress,
            mailingAddress,
            contactInfo,
            connectionType,
            projectCode,
            isSamurdhi,
            samurdhiNumber,
            isMetered,
            sabha_code,
            sabhaCustomerId // Frontend එකෙන් එන ID එක
        } = req.body;

        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        // --- 1. Bill Number Generation Logic ---
        // 1. Sabha Code (අග ඉලක්කම් 3)
const sabhaSuffix = String(sabha_code).slice(-3);
let projectPart = 'GEN'; // Project Code එකක් නැත්නම් Default අගයක්
if (projectCode) {
    // Project Code එක String එකක් බවට හරවා, Capital Akuru වලට හැරවීම
    projectPart = String(projectCode).toUpperCase(); 
}

// 3. Account Type Code
let accountTypeCode = '1'; 
if (connectionType) {
    const type = connectionType.toLowerCase();
    if (type === 'domestic') accountTypeCode = 'D';
    else if (type === 'commercial') accountTypeCode = 'C';
    else if (type.includes('industrial') || type.includes('construction')) accountTypeCode = 'I';
}

// 4. Samurdhi Status (S or N) 
const isSamurdhiBool = (isSamurdhi === true || isSamurdhi === 'true' || isSamurdhi === 1);
const samurdhiCode = isSamurdhiBool ? 'S' : 'N'; // True නම් 'S', නැත්නම් 'N'

// 5. Metered Status (M or N)
const isMeteredBool = (isMetered === true || isMetered === 'true' || isMetered === 1);
const meteredCode = isMeteredBool ? 'M' : 'N'; // True නම් 'M', නැත්නම් 'N'

// 6. Serial Number (Count + 1)
const customerCount = await getCustomerCountBySabhaAndProject(sabha_code, projectCode);
const serialNum = String(customerCount + 1).padStart(3, '0'); // ඉලක්කම් 3කට හැදීම (උදා: 001)

// --- Final Bill Number ---
const newBillNumber = `${sabhaSuffix}${projectPart}${accountTypeCode}${samurdhiCode}${meteredCode}${serialNum}`;


        // --- 2. ✅ Sabha Customer ID Setup Logic (New Part) ---
        let finalSabhaCustomerId = sabhaCustomerId;

        // ID එකක් Frontend එකෙන් ආවේ නැත්නම්, අලුතෙන් Sabha Customer කෙනෙක් හදන්න
        if (!finalSabhaCustomerId) {
            const newSabhaData = {
                sabha_code: sabha_code,
                cus_nic: nic,
                cus_name: fullName,
                cus_address: mailingAddress,
                cus_contact: contactInfo
            };

            // Model එකට යවලා Save කරනවා
            const sabhaResult = await insertSabhaCustomer(newSabhaData);
            
            // අලුතෙන් ලැබුණ ID එක ගන්නවා
            finalSabhaCustomerId = sabhaResult.insertId;
            console.log("New Sabha Customer Created with ID:", finalSabhaCustomerId);
        }


        // --- 3. Prepare Water Account Data ---
        const customerData = {
            customer_type: customerType,
            old_bill_number: oldBillNumber,
            current_reading: currentReading,
            new_bill_number: newBillNumber,
            full_name: fullName,
            nic: nic,
            property_address: propertyAddress,
            mailing_address: mailingAddress,
            contact_info: contactInfo,
            connection_type: connectionType,
            project_code: projectCode,
            is_samurdhi: isSamurdhiBool ? 1 : 0,
            samurdhi_number: samurdhiNumber,
            is_metered: isMeteredBool ? 1 : 0,
            sabha_code: sabha_code,
            status: 1,
            sabha_customer_id: finalSabhaCustomerId 
        };

        // Insert into DB
        await insertCustomer(customerData);

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            data: { new_bill_number: newBillNumber }
        });

    } catch (error) {
        console.error("Error registering customer:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const getAllCustomers = async (req, res) => {
    try {
        const { sabha_code } = req.params;
        const { search, sort, connectionTypes, samurdhi, metered, status, projectCode } = req.query;

        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        const filters = {};
        if (search && search.trim()) filters.search = search.trim();
        if (sort) filters.sort = sort;
        if (connectionTypes) filters.connectionTypes = connectionTypes.split(',').map(type => type.trim()).filter(Boolean);

        if (samurdhi) {
            filters.isSamurdhi = samurdhi.split(',').map(val => {
                if (val.trim() === 'Samurdhi') return 1;
                if (val.trim() === 'Not Samurdhi') return 0;
                return null;
            }).filter(val => val !== null);
        }

        if (metered) {
            filters.isMetered = metered.split(',').map(val => {
                if (val.trim() === 'Metered') return 1;
                if (val.trim() === 'Not Metered') return 0;
                return null;
            }).filter(val => val !== null);
        }

        if (status) {
            filters.status = status.split(',').map(val => {
                const v = val.trim().toLowerCase();
                if (v === 'active' || v === '1') return 1;
                if (v === 'inactive' || v === '0') return 0;
                return null;
            }).filter(val => val !== null);
        }

        const customers = await getCustomersBySabha(sabha_code, projectCode, filters);
        return res.status(200).json(customers);

    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


export const editCustomerDetails = async (req, res) => {
    try {
        const { id } = req.params; 
        
        const {
            fullName,
            nic,
            contactInfo,
            isSamurdhi,
            samurdhiNumber,
            status
        } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Customer ID is required" });
        }

        const updateData = {
            full_name: fullName,
            nic: nic,
            contact_info: contactInfo,
            is_samurdhi: (isSamurdhi === true || isSamurdhi === 'true' || isSamurdhi === 1) ? 1 : 0,
            samurdhi_number: samurdhiNumber,
            status: status 
        };

        // Model එකට යවන්න
        const result = await updateCustomer(id, updateData);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error("Error updating customer:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const checkSabhaCustomer = async (req, res) => {
    try {
        const { nic } = req.params;
        
        if (!nic) {
            return res.status(400).json({ success: false, message: "NIC is required" });
        }

        const customer = await getSabhaCustomerByNIC(nic);

        if (customer) {
            // Data හමු වුනා
            return res.status(200).json({
                success: true,
                data: customer 
            });
        } else {
            // Data හමු වුනේ නෑ (මෙය error එකක් නෙවෙයි)
            return res.status(200).json({
                success: false,
                message: "No existing sabha customer found"
            });
        }

    } catch (error) {
        console.error("Error fetching sabha customer:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};