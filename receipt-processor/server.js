const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// In-memory storage for receipts
const receipts = {};

// Function to calculate points
function calculatePoints(receipt) {
    let points = 0;

    // Rule 1: Alphanumeric characters in retailer name
    points += receipt.retailer.replace(/[^a-zA-Z0-9]/g, "").length;

    // Rule 2: Round dollar total
    if (receipt.total % 1 === 0) {
        points += 50;
    }

    // Rule 3: Total is a multiple of 0.25
    if (receipt.total % 0.25 === 0) {
        points += 25;
    }

    // Rule 4: 5 points for every two items
    points += Math.floor(receipt.items.length / 2) * 5;

    // Rule 5: Item descriptions as multiples of 3 characters
    receipt.items.forEach(item => {
        if (item.shortDescription.trim().length % 3 === 0) {
            points += Math.ceil(item.price * 0.2);
        }
    });

    // Rule 6: Odd purchase day
    const day = parseInt(receipt.purchaseDate.split("-")[2]);
    if (day % 2 === 1) {
        points += 6;
    }

    // Rule 7: Purchase time between 2 PM and 4 PM
    const [hour, minute] = receipt.purchaseTime.split(":").map(Number);
    if (hour === 14) {
        points += 10;
    }

    return points;
}

// POST /receipts/process
app.post("/receipts/process", (req, res) => {
    const receipt = req.body;

    // Validate receipt structure
    if (!receipt.retailer || !receipt.total || !receipt.purchaseDate || !receipt.purchaseTime || !receipt.items) {
        return res.status(400).json({ error: "Invalid receipt format" });
    }

    // Calculate points
    const points = calculatePoints(receipt);

    // Generate unique ID
    const id = uuidv4();

    // Store the receipt and points
    receipts[id] = points;

    res.status(200).json({ id });
});

// GET /receipts/:id/points
app.get("/receipts/:id/points", (req, res) => {
    const { id } = req.params;

    if (!receipts[id]) {
        return res.status(404).json({ error: "Receipt not found" });
    }

    res.status(200).json({ points: receipts[id] });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
