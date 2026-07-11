CREATE TYPE "budget_category_type" AS ENUM('expense', 'savings');--> statement-breakpoint
CREATE TYPE "budget_division_type" AS ENUM('in_half', 'in_proportion');--> statement-breakpoint
CREATE TYPE "calculation_mode" AS ENUM('absolute', 'relative');--> statement-breakpoint
CREATE TABLE "budget_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"family_id" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"type" "budget_category_type" NOT NULL,
	"calculation_mode" "calculation_mode" NOT NULL,
	"target_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budget_categories__name_format_check" CHECK (length(trim("name")) > 0),
	CONSTRAINT "budget_categories__system_not_archived_check" CHECK ((NOT "is_system") OR (NOT "archived")),
	CONSTRAINT "budget_categories__target_amount_consistency_check" CHECK (
            ("calculation_mode" = 'relative' AND "target_amount" BETWEEN 0 AND 100)
            OR
            ("calculation_mode" = 'absolute' AND "target_amount" >= 0)
        ),
	CONSTRAINT "budget_categories__archived_at_consistency_check" CHECK (
                ("archived" = false AND "archived_at" IS NULL)
                OR
                ("archived" = true
                    AND "archived_at" IS NOT NULL
                    AND "archived_at" <= CURRENT_TIMESTAMP
                )
            ),
	CONSTRAINT "budget_categories__created_at_not_in_future_check" CHECK ("created_at" <= CURRENT_TIMESTAMP),
	CONSTRAINT "budget_categories__updated_at_not_in_future_check" CHECK ("updated_at" <= CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE "families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(128) NOT NULL,
	"invitation_code" varchar(8) NOT NULL,
	"max_members" integer DEFAULT 2 NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "families__max_members_check" CHECK ("max_members" >= 1),
	CONSTRAINT "families__name_format_check" CHECK (length(trim("name")) > 0),
	CONSTRAINT "families__invitation_code_format_check" CHECK ("invitation_code" = upper("invitation_code")),
	CONSTRAINT "families__created_at_not_in_future_check" CHECK ("created_at" <= CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE "family_settings" (
	"family_id" uuid PRIMARY KEY,
	"budget_division_type" "budget_division_type" DEFAULT 'in_proportion'::"budget_division_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"planned_incomes_id" uuid NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "incomes__amount_non_negative_check" CHECK ("amount" >= 0),
	CONSTRAINT "incomes__received_at_not_in_future_check" CHECK ("received_at" <= CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE "monthly_budget_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"monthly_budget_id" uuid NOT NULL,
	"budget_category_id" uuid NOT NULL,
	"calculation_mode" "calculation_mode" NOT NULL,
	"target_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "monthly_budget_items__target_amount_consistency_check" CHECK (
            ("calculation_mode" = 'relative' AND "target_amount" BETWEEN 0 AND 100)
            OR
            ("calculation_mode" = 'absolute' AND "target_amount" >= 0)
        )
);
--> statement-breakpoint
CREATE TABLE "monthly_budget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"family_id" uuid NOT NULL,
	"period" date NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "monthly_budget__created_at_not_in_future_check" CHECK ("created_at" <= CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE "planned_incomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"monthly_budget_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"planned_amount" numeric(12,2) NOT NULL,
	CONSTRAINT "planned_incomes__planned_amount_non_negative_check" CHECK ("planned_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" varchar(128) NOT NULL,
	"password_hash" varchar(128) NOT NULL,
	"family_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users__username_format_check" CHECK ((length(trim("username")) > 0) AND (lower("username") = "username")),
	CONSTRAINT "users__created_at_not_in_future_check" CHECK ("created_at" <= CURRENT_TIMESTAMP),
	CONSTRAINT "users__updated_at_not_in_future_check" CHECK ("updated_at" <= CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "budget_categories__family_name_active_unique_index" ON "budget_categories" ("family_id","name") WHERE "archived" = false;--> statement-breakpoint
CREATE INDEX "budget_categories__family_id" ON "budget_categories" ("family_id");--> statement-breakpoint
CREATE UNIQUE INDEX "families__invitation_code_unique_index" ON "families" ("invitation_code");--> statement-breakpoint
CREATE INDEX "families__owner_id_index" ON "families" ("owner_id");--> statement-breakpoint
CREATE INDEX "incomes__planned_incomes_index" ON "incomes" ("planned_incomes_id");--> statement-breakpoint
CREATE UNIQUE INDEX "monthly_budget_items__budget_category_unique_index" ON "monthly_budget_items" ("monthly_budget_id","budget_category_id");--> statement-breakpoint
CREATE INDEX "monthly_budget_items__budget_category_index" ON "monthly_budget_items" ("budget_category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "monthly_budget__family_period_unique_index" ON "monthly_budget" ("family_id","period");--> statement-breakpoint
CREATE UNIQUE INDEX "planned_incomes__single_user_monthly_plan" ON "planned_incomes" ("monthly_budget_id","user_id");--> statement-breakpoint
CREATE INDEX "planned_incomes__monthly_budget_index" ON "planned_incomes" ("monthly_budget_id");--> statement-breakpoint
CREATE INDEX "planned_incomes__user_index" ON "planned_incomes" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users__username_unique_index" ON "users" ("username");--> statement-breakpoint
CREATE INDEX "users__family_id_index" ON "users" ("family_id");--> statement-breakpoint
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories__family_id_fk" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "families" ADD CONSTRAINT "families__owner_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "family_settings" ADD CONSTRAINT "family_settings__family_fk" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes__planned_income_id_fk" FOREIGN KEY ("planned_incomes_id") REFERENCES "planned_incomes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monthly_budget_items" ADD CONSTRAINT "monthly_budget_items__monthly_budget_id_fk" FOREIGN KEY ("monthly_budget_id") REFERENCES "monthly_budget"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monthly_budget_items" ADD CONSTRAINT "monthly_budget_items__budget_category_id_fk" FOREIGN KEY ("budget_category_id") REFERENCES "budget_categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monthly_budget" ADD CONSTRAINT "monthly_budget__family_id_fk" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "planned_incomes" ADD CONSTRAINT "planned_incomes__monthly_budget_id_fk" FOREIGN KEY ("monthly_budget_id") REFERENCES "monthly_budget"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "planned_incomes" ADD CONSTRAINT "planned_incomes_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users__family_id_fk" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL;