-- Rename ipAddress to anonymousId in Post table
ALTER TABLE "Post" RENAME COLUMN "ipAddress" TO "anonymousId";
ALTER TABLE "Post" ALTER COLUMN "anonymousId" SET DEFAULT 'anonymous';

-- Rename ipAddress to anonymousId in Stamp table
ALTER TABLE "Stamp" RENAME COLUMN "ipAddress" TO "anonymousId";

-- Rename ipAddress to anonymousId in DeletedPost table
ALTER TABLE "DeletedPost" RENAME COLUMN "ipAddress" TO "anonymousId"; 