-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emotionTagId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL DEFAULT '127.0.0.1',

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EmotionTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stamp" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,

    CONSTRAINT "Stamp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_ipAddress_idx" ON "Post"("ipAddress");

-- CreateIndex
CREATE INDEX "Stamp_postId_idx" ON "Stamp"("postId");

-- CreateIndex
CREATE INDEX "Stamp_ipAddress_idx" ON "Stamp"("ipAddress");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_emotionTagId_fkey" FOREIGN KEY ("emotionTagId") REFERENCES "EmotionTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
