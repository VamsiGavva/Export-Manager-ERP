-- Insert Seed User (gavvavamsikrishna@gmail.com / 534002@Elr)
INSERT INTO "User" ("id", "email", "password", "name", "createdAt") 
VALUES (
    'seed-user-123', 
    'gavvavamsikrishna@gmail.com', 
    '9541540f81ff29545dc7bc618c4ec56750ed328851b1a7f0010a41a9082fe5e7', 
    'GMR', 
    1784260800000
);

-- Insert Cities
INSERT INTO "City" ("id", "userId", "name", "country") VALUES ('city-mumbai-123', 'seed-user-123', 'Mumbai', 'India');
INSERT INTO "City" ("id", "userId", "name", "country") VALUES ('city-delhi-123', 'seed-user-123', 'Delhi', 'India');
INSERT INTO "City" ("id", "userId", "name", "country") VALUES ('city-ahmedabad-123', 'seed-user-123', 'Ahmedabad', 'India');

-- Insert Agents
INSERT INTO "Agent" ("id", "userId", "cityId", "name", "phone", "email", "address", "commissionType", "commissionValue") 
VALUES (
    'agent-rawat-123', 
    'seed-user-123', 
    'city-mumbai-123', 
    'Rawat & Sons Corp', 
    '+91 98765 43210', 
    'rawat@mumbai.com', 
    'APMC Market-II, Vashi, Navi Mumbai', 
    'Percentage', 
    5.0
);

INSERT INTO "Agent" ("id", "userId", "cityId", "name", "phone", "email", "address", "commissionType", "commissionValue") 
VALUES (
    'agent-patel-123', 
    'seed-user-123', 
    'city-ahmedabad-123', 
    'Patel Agro Corp', 
    '+91 76543 21098', 
    'contact@patelagro.com', 
    'Grain Market, Kalupur, Ahmedabad', 
    'PerBag', 
    20.0
);

INSERT INTO "Agent" ("id", "userId", "cityId", "name", "phone", "email", "address", "commissionType", "commissionValue") 
VALUES (
    'agent-goyal-123', 
    'seed-user-123', 
    'city-delhi-123', 
    'Goyal Traders Ltd', 
    '+91 87654 32109', 
    'goyal@delhi.com', 
    'Naya Bazar, Old Delhi', 
    'Fixed', 
    8000.0
);

-- Insert Shipments
INSERT INTO "Shipment" ("id", "userId", "shipmentNo", "cityId", "agentId", "product", "purchasePrice", "labourPrice", "bags", "lorryCharges", "otherCharges", "totalInvestment", "breakEvenPrice", "status", "createdAt") 
VALUES (
    'ship-1', 
    'seed-user-123', 
    'SHP2026001', 
    'city-mumbai-123', 
    'agent-rawat-123', 
    'Premium Basmati Rice', 
    1200.0, 
    40.0, 
    500, 
    35000.0, 
    5000.0, 
    660000.0, 
    1320.0, 
    'Sold', 
    1784260800000
);

INSERT INTO "Shipment" ("id", "userId", "shipmentNo", "cityId", "agentId", "product", "purchasePrice", "labourPrice", "bags", "lorryCharges", "otherCharges", "totalInvestment", "breakEvenPrice", "status", "createdAt") 
VALUES (
    'ship-2', 
    'seed-user-123', 
    'SHP2026002', 
    'city-ahmedabad-123', 
    'agent-patel-123', 
    'Groundnut Kernels', 
    950.0, 
    30.0, 
    800, 
    42000.0, 
    8000.0, 
    834000.0, 
    1042.5, 
    'Sold', 
    1784260800000
);

INSERT INTO "Shipment" ("id", "userId", "shipmentNo", "cityId", "agentId", "product", "purchasePrice", "labourPrice", "bags", "lorryCharges", "otherCharges", "totalInvestment", "breakEvenPrice", "status", "createdAt") 
VALUES (
    'ship-3', 
    'seed-user-123', 
    'SHP2026003', 
    'city-delhi-123', 
    'agent-goyal-123', 
    'Organic Soybean Bags', 
    1100.0, 
    35.0, 
    600, 
    29000.0, 
    6000.0, 
    716000.0, 
    1193.33, 
    'Waiting for Sale', 
    1784260800000
);

-- Insert Sales
INSERT INTO "Sale" ("id", "userId", "shipmentId", "sellingPrice", "bagsSold", "saleAmount", "commission", "netSale", "profit", "soldAt") 
VALUES (
    'sale-1', 
    'seed-user-123', 
    'ship-1', 
    1500.0, 
    500, 
    750000.0, 
    37500.0, 
    712500.0, 
    52500.0, 
    1784260800000
);

INSERT INTO "Sale" ("id", "userId", "shipmentId", "sellingPrice", "bagsSold", "saleAmount", "commission", "netSale", "profit", "soldAt") 
VALUES (
    'sale-2', 
    'seed-user-123', 
    'ship-2', 
    1100.0, 
    800, 
    880000.0, 
    16000.0, 
    864000.0, 
    30000.0, 
    1784260800000
);

-- Insert Statement Ledgers
INSERT INTO "Statement" ("id", "userId", "agentId", "shipmentId", "transactionType", "description", "debit", "credit", "runningBalance", "transactionDate") 
VALUES (
    'state-1', 
    'seed-user-123', 
    'agent-rawat-123', 
    'ship-1', 
    'Shipment', 
    'Sold Premium Basmati Rice - Inv #SHP2026001', 
    712500.0, 
    0.0, 
    712500.0, 
    1784260800000
);

INSERT INTO "Statement" ("id", "userId", "agentId", "shipmentId", "transactionType", "description", "debit", "credit", "runningBalance", "transactionDate") 
VALUES (
    'state-2', 
    'seed-user-123', 
    'agent-patel-123', 
    'ship-2', 
    'Shipment', 
    'Sold Groundnut Kernels - Inv #SHP2026002', 
    864000.0, 
    0.0, 
    864000.0, 
    1784260800000
);
