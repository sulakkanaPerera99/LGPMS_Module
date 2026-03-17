import { getProjectNumberByCode } from '../../models/water_billing_system/waterprojectsModel.js';
import { sendMobitelSMS } from '../../utils/mobitelSmsService.js';
import db from '../../config/database.js';
import { 
    getCustomerCountBySabhaAndProject, 
    insertCustomer, 
    getCustomersBySabha, 
    updateCustomer, 
    getSabhaCustomerByNIC, 
    insertSabhaCustomer 
} from '../../models/water_billing_system/waterCustomerAccountsModel.js';

export const registerCustomer = async (req, res) => {
    try {

        const {
            customerType, oldBillNumber, currentReading, lastReadingDate, fullName, nic,
            propertyAddress, mailingAddress, contactInfo, connectionType,
            projectCode, isSamurdhi, samurdhiNumber, isMetered,currentBalance,
            sabha_code, sabhaCustomerId
        } = req.body;

        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        // --- 1. Bill Number Generation Logic ---
        const sabhaSuffix = String(sabha_code).slice(-3);
        let projectPart = 'GEN'; 
        if (projectCode) {
            projectPart = String(projectCode).toUpperCase(); 
        }

        let accountTypeCode = '1'; 
        if (connectionType) {
            const type = connectionType.toLowerCase();
            if (type === 'domestic') accountTypeCode = 'D';
            else if (type === 'commercial') accountTypeCode = 'C';
            else if (type.includes('industrial') || type.includes('construction')) accountTypeCode = 'I';
        }

        const isSamurdhiBool = (isSamurdhi === true || isSamurdhi === 'true' || isSamurdhi === 1);
        const samurdhiCode = isSamurdhiBool ? 'S' : 'N';

        const isMeteredBool = (isMetered === true || isMetered === 'true' || isMetered === 1);
        const meteredCode = isMeteredBool ? 'M' : 'N';

        const customerCount = await getCustomerCountBySabhaAndProject(sabha_code, projectCode);
        const serialNum = String(customerCount + 1).padStart(3, '0');

        const newBillNumber = `${sabhaSuffix}${projectPart}${accountTypeCode}${samurdhiCode}${meteredCode}${serialNum}`;

        // --- 2. Sabha Customer ID Setup Logic ---
        let finalSabhaCustomerId = sabhaCustomerId;

        if (!finalSabhaCustomerId) {
            const newSabhaData = {
                sabha_code: sabha_code,
                cus_nic: nic,
                cus_name: fullName,
                cus_address: mailingAddress,
                cus_contact: contactInfo
            };

            const sabhaResult = await insertSabhaCustomer(newSabhaData);
            finalSabhaCustomerId = sabhaResult.insertId;
        }

        let finalReadingDate = lastReadingDate;

        if (!finalReadingDate || finalReadingDate === '0000-00-00') {
            const today = new Date();
            finalReadingDate = today.toISOString().split('T')[0];
        }

        // --- 3. Prepare Water Account Data ---
        const customerData = {
            customer_type: customerType,
            old_bill_number: oldBillNumber,
            current_reading: currentReading,
            last_reading_date: finalReadingDate,
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
            current_balance: currentBalance,
            sabha_code: sabha_code,
            status: 1,
            sabha_customer_id: finalSabhaCustomerId 
        };

        await insertCustomer(customerData);
        
        try {

            const isSamurdhiUser = (isSamurdhi === true || isSamurdhi === 'true' || isSamurdhi === 1);
            const samurdhiStatus = isSamurdhiUser ? `Yes (No: ${samurdhiNumber})` : 'No';

            const camelCaseName = toTitleCase(fullName);

            const welcomeMsg = 
`Welcome ${camelCaseName} !

Your Water Supply Account has been successfully registered.

Account Details:
 - Bill No: ${newBillNumber}
 - property Address: ${propertyAddress}
 - Mailing Address: ${mailingAddress}
 - Mobile Number: ${contactInfo}
 - NIC: ${nic}
 - Connection Type: ${connectionType}
 - Samurdhi: ${samurdhiStatus}
 - Current Balance : Rs.${currentBalance}

Please use your Bill Number for future inquiries.
${sabha_code} Water Board`;
            
            // මෙය await නොකර යැවීමෙන් response එක වේගවත් වේ (Background process)
            sendMobitelSMS(sabha_code, contactInfo, welcomeMsg)
                .then(() => console.log(`Registration SMS sent to ${contactInfo}`))
                .catch(err => console.error("SMS Error:", err));
        } catch (smsErr) {
            console.error("SMS Trigger Error:", smsErr);
        }

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
            fullName, nic, contactInfo, isSamurdhi, samurdhiNumber, status, sabha_code
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

        const result = await updateCustomer(id, updateData);

        const [customerRows] = await db.query(
                "SELECT new_bill_number FROM water_customer_accounts WHERE id = ?", 
                [id]
            );

            if (customerRows.length === 0) {
                return res.status(404).json({ success: false, message: "Customer not found" });
            }

            const billNumber = customerRows[0].new_bill_number;

        // Update එක සාර්ථක නම් පමණක් SMS එක යැවීමේ logic එක ක්‍රියාත්මක වේ
            try {
                const isSamurdhiUser = (isSamurdhi === true || isSamurdhi === 'true' || isSamurdhi === 1);
                const samurdhiStatus = isSamurdhiUser ? `Yes (No: ${samurdhiNumber})` : 'No';

                const camelCaseName = toTitleCase(fullName);

                const updateMsg = 
`Dear ${camelCaseName},
Your Water Account (Bill No: ${billNumber}) details have been updated successfully.

Updated Details:
- Name: ${fullName}
- NIC: ${nic}
- Contact: ${contactInfo}
- Samurdhi: ${samurdhiStatus}
- Status: ${status === 1 ? 'Active' : 'Inactive'}

If this wasn't you, please contact our office.
- ${sabha_code || 'LGPMS'} Water Board`;

                // SMS යැවීම (Background process - no await)
                sendMobitelSMS(sabha_code, contactInfo, updateMsg)
                    .then(() => console.log(`Update SMS sent to ${contactInfo}`))
                    .catch(err => console.error("SMS Sending Error:", err));

            } catch (smsErr) {
                // SMS එකේ error එකක් ආවත් update එක success නිසා return එකට බලපෑමක් නොවේ
                console.error("SMS Generation Error:", smsErr);
            }

        // අවසාන ප්‍රතිචාරය (Response)
        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error("Error updating customer:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
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
            return res.status(200).json({
                success: true,
                data: customer 
            });
        } else {
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

//camel case

const toTitleCase = (str) => {
    if (!str) return "";
    return str
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 0) 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '); 
};