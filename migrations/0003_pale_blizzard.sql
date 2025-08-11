CREATE TABLE "file" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" text NOT NULL,
	"blob_url" text NOT NULL,
	"blob_download_url" text,
	"blob_pathname" text NOT NULL,
	"blob_content_disposition" text,
	"blob_cache_control" text,
	"vector_id" text,
	"vector_namespace" text,
	"vector_score" text,
	"embedding" jsonb,
	"extracted_text" text,
	"user_id" text NOT NULL,
	"space_id" text,
	"organization_id" text,
	"visibility" text DEFAULT 'private' NOT NULL,
	"metadata" jsonb,
	"uploaded_at" timestamp NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_permission" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"user_id" text,
	"email" text,
	"permission" text DEFAULT 'view' NOT NULL,
	"granted_by" text NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_file_user" UNIQUE("file_id","user_id"),
	CONSTRAINT "unique_file_email" UNIQUE("file_id","email")
);
--> statement-breakpoint
CREATE TABLE "file_version" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"version_number" text NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"size" text NOT NULL,
	"checksum" text,
	"uploaded_by" text NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_file_version" UNIQUE("file_id","version_number")
);
--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_permission" ADD CONSTRAINT "file_permission_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_permission" ADD CONSTRAINT "file_permission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_permission" ADD CONSTRAINT "file_permission_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_version" ADD CONSTRAINT "file_version_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_version" ADD CONSTRAINT "file_version_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_files" ON "file" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_space_files" ON "file" USING btree ("space_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_org_files" ON "file" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_file_vector" ON "file" USING btree ("vector_id");--> statement-breakpoint
CREATE INDEX "idx_file_visibility" ON "file" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "idx_file_content_type" ON "file" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX "idx_file_permissions" ON "file_permission" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "idx_user_permissions" ON "file_permission" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email_permissions" ON "file_permission" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_file_versions" ON "file_version" USING btree ("file_id","created_at");