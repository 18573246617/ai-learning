-- CreateTable
CREATE TABLE
    "users" (
        "id" BIGSERIAL NOT NULL,
        "username" VARCHAR(50) NOT NULL,
        "email" VARCHAR(100) NOT NULL,
        "password_hash" VARCHAR(100) NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "tasks" (
        "id" BIGSERIAL NOT NULL,
        "user_id" BIGINT NOT NULL,
        "title" VARCHAR(100) NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "tags" (
        "id" BIGSERIAL NOT NULL,
        "name" VARCHAR(50) NOT NULL,
        CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "task_tags" (
        "task_id" BIGINT NOT NULL,
        "tag_id" BIGINT NOT NULL,
        CONSTRAINT "task_tags_pkey" PRIMARY KEY ("task_id", "tag_id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users" ("username");

-- CreateIndex
CREATE INDEX "tasks_user_id_idx" ON "tasks" ("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags" ("name");

-- CreateIndex
CREATE INDEX "task_tags_task_id_idx" ON "task_tags" ("task_id");

-- CreateIndex
CREATE INDEX "task_tags_tag_id_idx" ON "task_tags" ("tag_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_tags" ADD CONSTRAINT "task_tags_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_tags" ADD CONSTRAINT "task_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE;