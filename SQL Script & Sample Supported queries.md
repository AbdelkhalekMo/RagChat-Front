## SQL Script for DB Schema

-- SQL Script for Invoice Assistant Chatbot Database Schema (MySQL)

-- Drop tables if they exist to ensure a clean slate (for development/testing)
-- BE CAREFUL: This will delete all existing data in these tables!
DROP TABLE IF EXISTS InvoiceDetails;
DROP TABLE IF EXISTS Invoices;

--
-- Table structure for table `Invoices`
--
CREATE TABLE Invoices (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    InvoiceNumber VARCHAR(50) NOT NULL UNIQUE, 
    Date DATETIME NOT NULL,
    CustomerName VARCHAR(100) NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    Status INT NOT NULL DEFAULT 0, -- 0 for Draft, 1 for Issued, 2 for Paid, 3 for Overdue
    PaymentDate DATETIME NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    IsDeleted BOOLEAN NOT NULL DEFAULT FALSE
);

--
-- Table structure for table `InvoiceDetails`
--
CREATE TABLE InvoiceDetails (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    InvoiceId INT NOT NULL,
    Item VARCHAR(100) NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    CreatedAt DATETIME(6) NOT NULL,
    UpdatedAt DATETIME(6) NULL,
    IsDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT FK_InvoiceDetails_Invoices_InvoiceId FOREIGN KEY (InvoiceId) REFERENCES Invoices (Id) ON DELETE CASCADE
);

-- Optional: Add indexes for frequently queried columns to improve performance
CREATE INDEX IX_Invoices_InvoiceNumber ON Invoices (InvoiceNumber);
CREATE INDEX IX_Invoices_Date ON Invoices (Date);
CREATE INDEX IX_Invoices_CustomerName ON Invoices (CustomerName);
CREATE INDEX IX_Invoices_Status ON Invoices (Status);
CREATE INDEX IX_InvoiceDetails_InvoiceId ON InvoiceDetails (InvoiceId);

-- Optional: Add some sample data for testing purposes
-- INSERT INTO Invoices (InvoiceNumber, Date, CustomerName, Total, Status, CreatedAt, IsDeleted) VALUES
-- ('INV-1001', '2024-06-01 10:00:00', 'ABC Corp', 1500.00, 1, NOW(), FALSE),
-- ('INV-1002', '2024-06-15 11:30:00', 'XYZ Ltd', 250.50, 1, NOW(), FALSE),
-- ('INV-1003', '2024-07-01 09:00:00', 'ABC Corp', 3000.00, 0, NOW(), FALSE),
-- ('INV-1004', '2024-07-05 14:00:00', 'PQR Inc', 75.25, 1, NOW(), FALSE),
-- ('INV-1005', '2024-07-10 16:00:00', 'XYZ Ltd', 1200.00, 3, NOW(), FALSE), 
-- ('INV-1006', '2024-07-18 08:30:00', 'Abdelkhalek', 4000.00, 1, NOW(), FALSE);  

-- INSERT INTO InvoiceDetails (InvoiceId, Item, Quantity, Price, CreatedAt, IsDeleted) VALUES
-- (1, 'Laptop', 1, 1500.00, NOW(), FALSE),
-- (2, 'Mouse', 2, 25.00, NOW(), FALSE),
-- (2, 'Keyboard', 1, 200.50, NOW(), FALSE),
-- (3, 'Monitor', 1, 3000.00, NOW(), FALSE),
-- (4, 'USB Drive', 5, 15.05, NOW(), FALSE),
-- (5, 'Software License', 1, 1200.00, NOW(), FALSE),
-- (6, 'Service Fee', 1, 4000.00, NOW(), FALSE); 



___________________________________________________________________

## Sample Supported Queries

Here are some examples of natural language queries you can ask the chatbot:
-   **English:** "What is the total value of invoices in the last month?"
-   **Arabic:** "كم إجمالي قيمة  في اخر شهر"

### Invoice Summary by Number:
-   **English:** "Give me a summary of invoice INV-1007"
-   **Arabic:** "أعطني ملخص الفاتورة INV-1007"
-   **English:** "Details for invoice 1006"
-   **Arabic:** "تفاصيل فاتورة 1006"

### Invoices by Time Period:
-   **English:** "Show me the total value of invoices this month"
-   **Arabic:** "كم إجمالي الفواتير هذا الشهر؟"
-   **English:** "How many invoices were issued last week?"
-   **Arabic:** "كم عدد الفواتير الصادرة الأسبوع الماضي؟"
-   **English:** "What is the total value of invoices in the last 20 days?"
-   **Arabic:** "ما هو إجمالي قيمة الفواتير في آخر 20 يوم؟"
-   **English:** "Show me invoices from last month."
-   **Arabic:** "أظهر لي فواتير الشهر الماضي."

### Invoices by Value:
-   **English:** "Show me invoices greater than 1500"
-   **Arabic:** "أرني الفواتير التي تتعدى قيمتها 1000"
-   **English:** "List invoices less than 500"
-   **Arabic:** "اذكر الفواتير الأقل من 500"

### Invoices by Customer:
-   **English:** "Show me invoices for customer Abdelkhalek"
-   **Arabic:** "أرني فواتير العميل Abdelkhalek"

