# Family Chores

Family Chores is a mobile-first shared chore and rewards app.

Features:
- Supabase email/password accounts
- Parent creates a family and receives an 8-character family code
- Children join with the family code
- Shared online chores and rewards
- Parent/child roles enforced in PostgreSQL
- Chore completion -> parent approval -> points
- Reward requests -> parent approval -> points deducted
- Row Level Security isolates each family's data
- GitHub Pages deployment through GitHub Actions

Security:
- The browser contains only the Supabase publishable key.
- No service-role key or database password is included in frontend code.
- Authorization is enforced with Supabase Auth, PostgreSQL RLS, and server-side RPC functions.

Backend project: family-chores in us-east-1.

To use the app, open the GitHub Pages site, create a parent account, create a family, and share the displayed family code with child accounts.
