ALTER TABLE "families" ALTER COLUMN "invitation_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "families" ADD COLUMN "max_members" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "families" ADD COLUMN "members_count" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "families" DROP COLUMN "is_full";--> statement-breakpoint
ALTER TABLE "families" ADD CONSTRAINT "families__members_count_leq_max_members_check" CHECK ("families"."members_count" <= "families"."max_members");