CREATE TABLE "note" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"space_id" text,
	"organization_id" text,
	"user_id" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_space_notes" ON "note" USING btree ("space_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_organization_notes" ON "note" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_user_notes" ON "note" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_pinned_notes" ON "note" USING btree ("user_id","is_pinned","created_at");