# Miraai

Client Workdesk starter

A starter desktop app for managing:

- client details
- staff details
- catalogue or work entries
- invoice and payment tracking
- file and image attachments

## Stack

- Electron
- React
- Vite
- Browser local storage for starter persistence

## Current MVP

- Dashboard with basic counts
- Client management
- Staff management
- Work tracking with catalogue name, status, dates, notes and attachments
- Invoice tracking with payment status

## Run

```bash
npm install
npm run electron:dev
```

## Suggested next upgrades

1. Replace local storage with SQLite
2. Add edit/delete actions
3. Add search and filters
4. Add file copy into app-managed folders
5. Add report export and print invoice
