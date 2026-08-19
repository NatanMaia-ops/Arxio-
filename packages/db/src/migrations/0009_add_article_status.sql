ALTER TABLE "articles" ADD COLUMN "status" varchar(20) DEFAULT 'published' NOT NULL;--> statement-breakpoint
CREATE INDEX "articles_status_idx" ON "articles" USING btree ("status");
