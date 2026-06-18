CREATE TABLE "families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"invitation_code" varchar(8),
	"is_full" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"planned_incomes_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "incomes__amount_non_negative_check" CHECK ("incomes"."amount" >= 0),
	CONSTRAINT "incomes__received_at_non_in_future_check" CHECK ("incomes"."received_at" <= CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE "monthly_budget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"period" date NOT NULL,
	"savings_rate" numeric(5, 2) DEFAULT '5.0' NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"amount" numeric(10, 2),
	CONSTRAINT "monthly__budget_savings_rate_non_negative_check" CHECK ("monthly_budget"."savings_rate" >= 0),
	CONSTRAINT "monthly__budget_amount_non_negative_check" CHECK ("monthly_budget"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "planned_incomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"period" date NOT NULL,
	CONSTRAINT "planned_incomes__amount_non_negative_check" CHECK ("planned_incomes"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(128) NOT NULL,
	"password_hash" varchar(128) NOT NULL,
	"family_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users__username_format_check" CHECK ((length(trim("users"."username")) > 0) AND (lower("users"."username") = "users"."username")),
	CONSTRAINT "users__created_at_not_in_future_check" CHECK ("users"."created_at" <= CURRENT_TIMESTAMP),
	CONSTRAINT "users__updated_at_not_in_future_check" CHECK ("users"."updated_at" <= CURRENT_TIMESTAMP)
);
--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "planned_incomes_income" FOREIGN KEY ("planned_incomes_id") REFERENCES "public"."planned_incomes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_budget" ADD CONSTRAINT "family_monthly_budget" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planned_incomes" ADD CONSTRAINT "user_planned_incomes" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "user_family_id" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "families__invitation_code_unique_index" ON "families" USING btree ("invitation_code");--> statement-breakpoint
CREATE UNIQUE INDEX "monthly__budget_family_period_unique_index" ON "monthly_budget" USING btree ("family_id","period");--> statement-breakpoint
CREATE UNIQUE INDEX "users__username_unique_index" ON "users" USING btree ("username");