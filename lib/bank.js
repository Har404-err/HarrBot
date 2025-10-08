
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'db.json');

function readDb() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}));
    }
    const db = JSON.parse(fs.readFileSync(dbPath));
    if (!db.users) {
        db.users = {};
    }
    return db;
}

function writeDb(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function createAccount(userId) {
    const db = readDb();
    if (db.users[userId] && db.users[userId].bank) {
        return { success: false, message: 'You already have a bank account.' };
    }
    if (!db.users[userId]) {
        db.users[userId] = {};
    }
    db.users[userId].bank = {
        balance: 0,
        transactions: []
    };
    writeDb(db);
    return { success: true, message: 'Bank account created successfully.' };
}

function getBalance(userId) {
    const db = readDb();
    if (!db.users[userId] || !db.users[userId].bank) {
        return { success: false, message: 'You do not have a bank account.' };
    }
    return { success: true, balance: db.users[userId].bank.balance };
}

function deposit(userId, amount) {
    if (amount <= 0) {
        return { success: false, message: 'Deposit amount must be positive.' };
    }
    const db = readDb();
    if (!db.users[userId] || !db.users[userId].bank) {
        return { success: false, message: 'You do not have a bank account.' };
    }
    db.users[userId].bank.balance += amount;
    db.users[userId].bank.transactions.push({
        type: 'deposit',
        amount: amount,
        date: new Date().toISOString()
    });
    writeDb(db);
    return { success: true, message: `Successfully deposited ${amount}.` };
}

function withdraw(userId, amount) {
    if (amount <= 0) {
        return { success: false, message: 'Withdrawal amount must be positive.' };
    }
    const db = readDb();
    if (!db.users[userId] || !db.users[userId].bank) {
        return { success: false, message: 'You do not have a bank account.' };
    }
    if (db.users[userId].bank.balance < amount) {
        return { success: false, message: 'Insufficient balance.' };
    }
    db.users[userId].bank.balance -= amount;
    db.users[userId].bank.transactions.push({
        type: 'withdrawal',
        amount: amount,
        date: new Date().toISOString()
    });
    writeDb(db);
    return { success: true, message: `Successfully withdrew ${amount}.` };
}

function transfer(fromUserId, toUserId, amount) {
    if (amount <= 0) {
        return { success: false, message: 'Transfer amount must be positive.' };
    }
    const db = readDb();
    if (!db.users[fromUserId] || !db.users[fromUserId].bank) {
        return { success: false, message: 'You do not have a bank account.' };
    }
    if (!db.users[toUserId] || !db.users[toUserId].bank) {
        return { success: false, message: 'The recipient does not have a bank account.' };
    }
    if (db.users[fromUserId].bank.balance < amount) {
        return { success: false, message: 'Insufficient balance.' };
    }
    db.users[fromUserId].bank.balance -= amount;
    db.users[toUserId].bank.balance += amount;
    db.users[fromUserId].bank.transactions.push({
        type: 'transfer-out',
        amount: amount,
        to: toUserId,
        date: new Date().toISOString()
    });
    db.users[toUserId].bank.transactions.push({
        type: 'transfer-in',
        amount: amount,
        from: fromUserId,
        date: new Date().toISOString()
    });
    writeDb(db);
    return { success: true, message: `Successfully transferred ${amount} to ${toUserId}.` };
}

module.exports = {
    createAccount,
    getBalance,
    deposit,
    withdraw,
    transfer
};
