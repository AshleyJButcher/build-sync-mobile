# Build Sync Mobile – Testing

## Quick checks

Before committing or deploying, run:

```bash
# TypeScript
npm run type-check

# Lint
npm run lint
```

## Running the app

### Development server

```bash
npm start
```

Then:

- **iOS simulator:** Press `i` in the terminal, or run `npm run ios`
- **Android emulator:** Press `a` in the terminal, or run `npm run android`
- **Physical device:** Scan the QR code with Expo Go (iOS/Android)

### iOS (simulator)

```bash
npm run ios
```

Requires Xcode and an iOS simulator. Uses the default simulator unless you specify one, e.g.:

```bash
npx expo run:ios --device "iPhone 16"
```

### Android (emulator)

```bash
npm run android
```

Requires Android Studio and an emulator, or a device with USB debugging enabled.

## What to test

### Authentication

- [ ] Login with valid/invalid credentials
- [ ] Register (including role selection)
- [ ] Forgot password flow
- [ ] Reset password (from email link)
- [ ] Verify email
- [ ] Logout and session persistence after app restart

### Core flows

- [ ] Select project and switch between projects
- [ ] Create project (as builder/administrator)
- [ ] Dashboard: stats and navigation to Products, Milestones, Decisions, Cost Changes
- [ ] Products: list, add, edit, delete, detail
- [ ] Milestones: list, add, edit, delete, detail, progress update
- [ ] Decisions: list, add, edit, delete, detail, approve/reject
- [ ] Cost changes: list, add, edit, delete, detail, approve/reject
- [ ] Schedule: list, add, edit, delete, detail
- [ ] Remedial: list, add, edit, delete, detail
- [ ] Chat: open from side menu, send message, edit/delete own message

### Polish (Step 8)

- [ ] **Error boundary:** Trigger an error (e.g. force throw in a screen); “Something went wrong” screen with Try again / Go home
- [ ] **Offline:** Turn off network; offline banner appears; cached data still visible; turn network back on and pull-to-refresh
- [ ] **Loading:** All list screens show loading spinner and “Loading…” (or similar) while fetching
- [ ] **Lists:** Long lists (e.g. many products/milestones) scroll smoothly (FlatList virtualization)

### Devices

- [ ] Test on at least one iOS version (simulator or device)
- [ ] Test on at least one Android version (emulator or device)

## Environment

Ensure `.env` (or EAS secrets) has:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_ANON_KEY`

Without these, the app may fail when calling Supabase.
