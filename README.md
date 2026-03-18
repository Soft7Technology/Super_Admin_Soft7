# Super_Admin_Soft7

## Support Ticket Reply Email Setup

Reply actions on `/user/support-tickets` now:

- Persist replies in the database (`support_ticket_replies`)
- Keep replies visible after refresh in the Super Admin frontend
- Send reply emails to the ticket sender

Add these variables in your `.env` for SMTP delivery:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER` (optional if your SMTP allows unauthenticated relay)
- `SMTP_PASS` (required when `SMTP_USER` is set)
- `SMTP_FROM` (sender address shown to users)
- `SMTP_REPLY_TO` (optional)
- `SMTP_SECURE` (`true` for SMTPS, usually port 465; otherwise `false`)

If SMTP is not configured or delivery fails, replies are still saved and shown in the ticket thread, and the UI displays a warning.
