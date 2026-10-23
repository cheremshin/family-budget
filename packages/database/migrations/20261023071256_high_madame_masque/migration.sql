CREATE TABLE "monthly_budget_contributions" (
	"monthly_budget_id" uuid,
	"member_id" uuid,
	"category_id" uuid,
	"amount" numeric(12,2) NOT NULL,
	CONSTRAINT "monthly_budget_contributions__pk" PRIMARY KEY("monthly_budget_id","member_id","category_id"),
	CONSTRAINT "monthly_budget_contributions__amount_non_negative_check" CHECK ("amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "monthly_budget_remainders" (
	"monthly_budget_id" uuid,
	"member_id" uuid,
	"member_name" varchar(128) NOT NULL,
	"own_remainder" numeric(12,2) NOT NULL,
	"personal_amount" numeric(12,2) NOT NULL,
	"settlement_amount" numeric(12,2) NOT NULL,
	CONSTRAINT "monthly_budget_remainders__pk" PRIMARY KEY("monthly_budget_id","member_id"),
	CONSTRAINT "monthly_budget_remainders__personal_amount_non_negative_check" CHECK ("personal_amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "monthly_budget" ADD COLUMN "personal_remainder_policy" "personal_remainder_policy";--> statement-breakpoint
ALTER TABLE "monthly_budget_contributions" ADD CONSTRAINT "monthly_budget_contributions__monthly_budget_id_fk" FOREIGN KEY ("monthly_budget_id") REFERENCES "monthly_budget"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monthly_budget_contributions" ADD CONSTRAINT "monthly_budget_contributions__member_id_fk" FOREIGN KEY ("member_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "monthly_budget_contributions" ADD CONSTRAINT "monthly_budget_contributions__category_id_fk" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id");--> statement-breakpoint
ALTER TABLE "monthly_budget_remainders" ADD CONSTRAINT "monthly_budget_remainders__monthly_budget_id_fk" FOREIGN KEY ("monthly_budget_id") REFERENCES "monthly_budget"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monthly_budget_remainders" ADD CONSTRAINT "monthly_budget_remainders__member_id_fk" FOREIGN KEY ("member_id") REFERENCES "users"("id");