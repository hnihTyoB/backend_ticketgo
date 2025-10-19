/*
  Warnings:

  - Added the required column `description` to the `ticket_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ticket_types` ADD COLUMN `description` MEDIUMTEXT NOT NULL;
