-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "algorithm" TEXT,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "difficulty" "Difficulty" DEFAULT 'BEGINNER',
ADD COLUMN     "examples" TEXT,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "inputDescription" TEXT,
ADD COLUMN     "outputDescription" TEXT,
ADD COLUMN     "problemStatement" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "spaceComplexity" TEXT,
ADD COLUMN     "timeComplexity" TEXT;

-- CreateTable
CREATE TABLE "AlternativeSolution" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "fileName" TEXT,
    "authorId" TEXT,
    "submissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlternativeSolution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlternativeSolution_submissionId_key" ON "AlternativeSolution"("submissionId");

-- CreateIndex
CREATE INDEX "AlternativeSolution_programId_languageId_idx" ON "AlternativeSolution"("programId", "languageId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlternativeSolution" ADD CONSTRAINT "AlternativeSolution_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlternativeSolution" ADD CONSTRAINT "AlternativeSolution_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlternativeSolution" ADD CONSTRAINT "AlternativeSolution_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlternativeSolution" ADD CONSTRAINT "AlternativeSolution_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
