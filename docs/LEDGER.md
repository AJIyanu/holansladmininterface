# Cash book — first ledger rebuild feature

Routes: /dashboard/ledger (cash book) and /dashboard/ledger/journal (read-only
paired journal). The old comprehensive ledger UI remains retired.

The cash book uses NGN, January–December years and zero initial opening balance.
It displays carried opening balance, money in/debit, money out/credit, closing
balance and dated entries with running balances. Year/date filters and pagination
are URL-driven; negative recorded cash is highlighted.

Add receipt, expense or owner capital with date, amount, description and optional
reference. Edits require a reason; deletion requires explicit confirmation and
reason. Corrections/voids generate journal reversals and preserve history. The
journal displays both accounts, equal debit/credit amounts, author/time and any
reversal reason. It is not editable.

Access uses existing formatted permissions:
ledger.cashbookentry.view/create/edit/delete and ledger.cashbookjournal.view.
Users must be staff or superusers. Navigation and server-rendered pages check
view permissions; action controls and Server Actions check the matching mutation
permission plus view. Django independently enforces all authorization. Staff
permission assignment remains in the existing administration screens.

Server Components fetch through serverFetch; browser mutations use Server Actions
with existing HTTP-only authentication. Duplicate create retries reuse a UUID;
corrections carry the saved version to reject stale updates. Decimal input is
transmitted as text, and money display avoids floating-point conversion.

Files: src/features/cash-book/, src/components/cash-book/ and
src/app/dashboard/ledger/. UI uses shared dialogs, inputs/buttons, React Hook Form,
Zod, Sonner and semantic theme tokens. Mobile uses cards; desktop uses a table.
Initial-loading, empty, validation, forbidden-access and retry states are present.

Backend contract: ../holansl_backend/docs/apps/ledger.md. New migrations 0014/0015
must be applied before use; their dependency 0013 removes the retired ledger if
still pending. Application migrations were not executed in this feature build.
No new dependencies, no restored procurement integration or additional currencies.
