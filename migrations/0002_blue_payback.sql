CREATE TABLE "task" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"type" text NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"chat_id" text,
	"trigger_task_id" text,
	"trigger_run_id" text,
	"stream_id" text,
	"prompt" text,
	"input" jsonb,
	"output" jsonb,
	"messages" jsonb,
	"error" jsonb,
	"metadata" jsonb,
	"retry" jsonb,
	"priority" text DEFAULT 'normal',
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_stream" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"stream_id" text NOT NULL,
	"parts" jsonb NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_stream" ADD CONSTRAINT "task_stream_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_space_tasks" ON "task" USING btree ("space_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_user_tasks" ON "task" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_task_status" ON "task" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_trigger_task" ON "task" USING btree ("trigger_task_id");--> statement-breakpoint
CREATE INDEX "idx_task_streams" ON "task_stream" USING btree ("task_id","created_at");