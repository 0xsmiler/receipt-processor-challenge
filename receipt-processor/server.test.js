const request = require("supertest");
const app = require("./server"); // Import the server

describe("Receipt Processor API", () => {
    it("should process a receipt and return an ID", async () => {
        const response = await request(app)
            .post("/receipts/process")
            .send({
                retailer: "Target",
                purchaseDate: "2022-01-01",
                purchaseTime: "13:01",
                items: [
                    { shortDescription: "Item A", price: 12.34 },
                    { shortDescription: "Item B", price: 20.0 }
                ],
                total: 32.34
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
    });

    it("should return points for a processed receipt", async () => {
        const processResponse = await request(app)
            .post("/receipts/process")
            .send({
                retailer: "Target",
                purchaseDate: "2022-01-01",
                purchaseTime: "13:01",
                items: [
                    { shortDescription: "Item A", price: 12.34 },
                    { shortDescription: "Item B", price: 20.0 }
                ],
                total: 32.34
            });

        const receiptId = processResponse.body.id;

        const pointsResponse = await request(app).get(`/receipts/${receiptId}/points`);

        expect(pointsResponse.status).toBe(200);
        expect(pointsResponse.body).toHaveProperty("points");
    });
});
