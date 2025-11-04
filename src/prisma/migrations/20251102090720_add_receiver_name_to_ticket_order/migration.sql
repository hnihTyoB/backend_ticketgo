/*
  Warnings:

  - Added the required column `receiverName` to the `ticket_orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Bước 1: Thêm column nullable trước
ALTER TABLE `ticket_orders` ADD COLUMN `receiverName` VARCHAR(255) NULL;

-- Bước 2: Cập nhật giá trị cho các row hiện có (lấy từ receiverPhone hoặc 'Khách hàng')
UPDATE `ticket_orders` SET `receiverName` = 'Khách hàng' WHERE `receiverName` IS NULL;

-- Bước 3: Đổi column thành NOT NULL
ALTER TABLE `ticket_orders` MODIFY COLUMN `receiverName` VARCHAR(255) NOT NULL;
