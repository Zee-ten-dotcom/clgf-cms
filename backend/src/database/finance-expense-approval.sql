
ALTER TABLE finance_transactions
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20)
    NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE finance_transactions
  DROP CONSTRAINT IF EXISTS finance_approval_status_check;

ALTER TABLE finance_transactions
  ADD CONSTRAINT finance_approval_status_check
  CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED'));
