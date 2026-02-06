import { getProjectNumberByCode } from '../../models/water_billing_system/waterprojectsModel.js';
import { getCustomerCountBySabhaAndProject, insertCustomer, getCustomersBySabha, updateCustomer } from '../../models/water_billing_system/waterCustomerAccountsModel.js';

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
            sabha_code
        } = req.body;

        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        // Bill Number Generation Logic
        const sabhaSuffix = String(sabha_code).slice(-3);

        let projectNum = '00';
        if (projectCode) {
            const fetchedProjectNum = await getProjectNumberByCode(projectCode, sabha_code);
            if (fetchedProjectNum !== null && fetchedProjectNum !== undefined) {
                projectNum = String(fetchedProjectNum).padStart(2, '0');
            }
        }

        let accountTypeCode = '1'; 
        if (connectionType) {
            const type = connectionType.toLowerCase();
            if (type === 'domestic') accountTypeCode = '1';
            else if (type === 'commercial') accountTypeCode = '2';
            else if (type.includes('industrial') || type.includes('construction')) accountTypeCode = '3';
        }

        const isSamurdhiBool = (isSamurdhi === true || isSamurdhi === 'true' || isSamurdhi === 1);
        const samurdhiCode = isSamurdhiBool ? '1' : '0';

        const isMeteredBool = (isMetered === true || isMetered === 'true' || isMetered === 1);
        const meteredCode = isMeteredBool ? '1' : '0';

        const customerCount = await getCustomerCountBySabhaAndProject(sabha_code, projectCode);
        const serialNum = String(customerCount + 1).padStart(3, '0');

        const newBillNumber = `${sabhaSuffix}${projectNum}${accountTypeCode}${samurdhiCode}${meteredCode}${serialNum}`;

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
            status: 1 
        };

        // Insert into DB (This now triggers the Transaction in Model)
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
        
        // Frontend එකෙන් එන Data වලින් අපිට ඕන ටික විතරක් Destructure කරගන්නවා
        const {
            fullName,
            nic,
            contactInfo,
            isSamurdhi,      // අයිතිකරු මාරු වෙද්දි මේකත් වෙනස් වෙන්න පුළුවන් නිසා ගත්තා
            samurdhiNumber
        } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Customer ID is required" });
        }

        // Database එකට යවන්න ඕන දත්ත ටික විතරක් Object එකක් විදිහට හදාගන්නවා.
        // මෙතන Address නැති නිසා, Database එකේ Address වෙනස් වෙන්නේ නෑ.
        const updateData = {
            full_name: fullName,
            nic: nic,
            contact_info: contactInfo,
            is_samurdhi: (isSamurdhi === true || isSamurdhi === 'true' || isSamurdhi === 1) ? 1 : 0,
            samurdhi_number: samurdhiNumber
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