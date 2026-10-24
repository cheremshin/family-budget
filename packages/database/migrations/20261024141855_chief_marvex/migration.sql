ALTER TABLE "incomes" ADD COLUMN "monthly_budget_id" uuid;--> statement-breakpoint
ALTER TABLE "incomes" ADD COLUMN "user_id" uuid;--> statement-breakpoint

-- Перенос т.к. старая связь еще на месте
UPDATE "incomes" AS i
SET "monthly_budget_id" = p."monthly_budget_id", "user_id" = p."user_id"
FROM "planned_incomes" AS p
WHERE p."id" = i."planned_incomes_id";--> statement-breakpoint

ALTER TABLE "incomes" ALTER COLUMN "monthly_budget_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "incomes" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint

ALTER TABLE "incomes" DROP CONSTRAINT "incomes__planned_income_id_fk";--> statement-breakpoint
DROP INDEX "incomes__planned_incomes_index";--> statement-breakpoint
ALTER TABLE "incomes" DROP COLUMN "planned_incomes_id";--> statement-breakpoint

ALTER TABLE "planned_incomes" DROP CONSTRAINT "planned_incomes_pkey";--> statement-breakpoint
ALTER TABLE "planned_incomes" DROP COLUMN "id";--> statement-breakpoint
DROP INDEX "planned_incomes__single_user_monthly_plan";--> statement-breakpoint
ALTER TABLE "planned_incomes" ADD CONSTRAINT "planned_incomes_pk" PRIMARY KEY("monthly_budget_id","user_id");--> statement-breakpoint

CREATE INDEX "incomes__planned_incomes_index" ON "incomes" ("monthly_budget_id","user_id");--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes__planned_income_fk" FOREIGN KEY ("monthly_budget_id","user_id") REFERENCES "planned_incomes"("monthly_budget_id","user_id") ON DELETE CASCADE;
