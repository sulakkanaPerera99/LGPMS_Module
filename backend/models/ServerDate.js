export function getServerDate() {
    return new Date().toISOString(); // Returns current date in ISO format
}

export function saveServerDate(callback) {
    const serverDate = new Date();
    db.query("INSERT INTO server_dates (date) VALUES (?)", [serverDate], (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}