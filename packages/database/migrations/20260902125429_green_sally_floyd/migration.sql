ALTER TABLE "monthly_budget_items" ADD COLUMN "category_name" varchar(128);--> statement-breakpoint
ALTER TABLE "monthly_budget_items" ADD COLUMN "category_type" "budget_category_type";--> statement-breakpoint


UPDATE "monthly_budget_items" AS i
SET "category_name" = c."name",
    "category_type" = c."type"
FROM "budget_categories" AS c
WHERE c."id" = i."budget_category_id";--> statement-breakpoint

ALTER TABLE "monthly_budget_items" ALTER COLUMN "category_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "monthly_budget_items" ALTER COLUMN "category_type" SET NOT NULL;--> statement-breakpoint

ALTER TABLE "monthly_budget_items"
    DROP CONSTRAINT "monthly_budget_items__budget_category_id_fk",
    ADD CONSTRAINT "monthly_budget_items__budget_category_id_fk"
        FOREIGN KEY ("budget_category_id") REFERENCES "budget_categories"("id");--> statement-breakpoint

ALTER TABLE "monthly_budget_items" ADD CONSTRAINT "monthly_budget_items__category_name_not_empty_check" CHECK (length(trim("category_name")) > 0);
