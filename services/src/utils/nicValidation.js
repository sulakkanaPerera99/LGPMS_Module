// පැරණි NIC එක අලුත් එකට හරවන function එක
export function convertToNewNic(nic) {
    if (!nic) return "";
    
    let nicStr = nic.toString();

    // පරණ NIC එකක්ද කියා පරීක්ෂා කිරීම (දිග 10 සහ අග V හෝ X)
    if (nicStr.length === 10 && 
       (nicStr.charAt(9).toUpperCase() === 'V' || nicStr.charAt(9).toUpperCase() === 'X')) {
        
        // පරිවර්තනය කිරීම (19 + මුල් අංක 5 + 0 + ඉතිරි අංක)
        return '19' + nicStr.slice(0, 5) + '0' + nicStr.slice(5, -1);
    }

    // දැනටමත් අලුත් NIC එකක් නම් එය එලෙසම යවන්න
    return nicStr;
}