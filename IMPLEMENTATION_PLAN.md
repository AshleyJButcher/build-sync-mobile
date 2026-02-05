# Build Sync Mobile - Implementation Plan

## Executive Summary

This document outlines the plan to create a new mobile application (`build-sync-mobile`) that combines:
- **Authentication patterns and UI components** from "Round Up Friends" (React Native/Expo mobile app)
- **Core functionality and features** from "client-builder-sync" (React web application)

The result will be a mobile-native version of the BuildSync project management platform with the proven authentication UX from Round Up Friends.

---

## 1. Project Analysis

### 1.1 Round Up Friends - Auth Patterns to Reuse

#### Architecture:
- **State Management**: Zustand store (`useAuthStore`) with AsyncStorage persistence
- **Framework**: React Native with Expo Router
- **Auth Service Layer**: `src/services/auth.ts` with Supabase integration
- **Validation**: `src/utils/validation.ts` with comprehensive form validation

#### Auth Components:
1. **LoginScreen.tsx**
   - Email/password input with validation
   - Password visibility toggle
   - Remember me checkbox
   - Social login buttons (Apple/Google)
   - Error handling with dismissible error containers
   - Green primary color theme (#4CAF50)
   - Real-time form validation
   - Dev mode test login support

2. **RegisterScreen.tsx**
   - Full name, email, password, confirm password
   - Password strength indicator
   - Real-time validation
   - Social signup options

3. **ForgotPasswordScreen.tsx**
   - Email input for password reset
   - Success confirmation screen

4. **ResetPasswordScreen.tsx**
   - New password and confirm password inputs
   - Password visibility toggles
   - Success state with auto-redirect

5. **VerifyEmailScreen.tsx**
   - Email verification instructions
   - Resend verification email functionality

6. **AuthLoadingScreen.tsx**
   - Loading state during auth checks

#### Key Patterns:
- **Form Validation**: Real-time validation with touched state tracking
- **Error Handling**: Server errors vs validation errors with clear distinction
- **Email Confirmation Flow**: Handles email verification requirements
- **Session Management**: Automatic session checking on app start
- **Test Mode**: Development-friendly test login capabilities

### 1.2 Client-Builder-Sync - Functionality to Port

#### Core Features:
1. **Project Management**
   - Multiple projects support
   - Project selection/switching
   - Project invitations
   - Team member management

2. **Products Management**
   - Add/edit products
   - Product categories
   - Product cards and list views
   - Paint color selection

3. **Drawings**
   - Drawing management
   - File uploads/viewing

4. **Milestones**
   - Timeline view
   - Add/edit milestones
   - Progress tracking

5. **Decisions**
   - Decision cards
   - Decision tracking
   - Approval workflows

6. **Cost/Time Changes**
   - Cost change tracking
   - Budget management
   - Currency formatting

7. **Chat**
   - Real-time messaging
   - Photo sharing
   - Comments on items

8. **Schedule**
   - Calendar view
   - Schedule management

9. **Remedial Works**
   - Issue tracking
   - Remedial work items

10. **Feedback**
    - Feedback submission
    - Feature requests
    - Bug reports

11. **Onboarding**
    - New user onboarding flow

12. **Super Admin**
    - Admin dashboard
    - User management

#### Technical Stack:
- **Auth**: React Context (`AuthProvider`) with Supabase
- **Routing**: React Router with protected routes
- **Data Fetching**: TanStack Query
- **UI**: shadcn/ui components (web)
- **State**: React hooks + Context

#### Role-Based Access:
- Roles: builder, client, sub-contractor, architect-designer, administrator, super_admin, other
- Permission system with granular access control

---

## 2. Implementation Strategy

### 2.1 Project Setup

#### Phase 1: Initialize Mobile App Structure
1. **Create Expo/React Native project**
   - Use Expo SDK (matching Round Up Friends version ~54)
   - Set up TypeScript configuration
   - Configure Supabase client

2. **Install Core Dependencies**
   ```json
   {
     "expo": "~54.0.30",
     "react-native": "0.81.5",
     "@supabase/supabase-js": "^2.52.1",
     "zustand": "^4.5.1",
     "@react-native-async-storage/async-storage": "2.2.0",
     "expo-router": "~6.0.21",
     "@tanstack/react-query": "^5.83.0"
   }
   ```

3. **Project Structure**
   ```
   build-sync-mobile/
   ├── app/                    # Expo Router pages
   │   ├── (auth)/            # Auth routes
   │   │   ├── login.tsx
   │   │   ├── register.tsx
   │   │   ├── forgot-password.tsx
   │   │   ├── reset-password.tsx
   │   │   └── verify-email.tsx
   │   ├── (tabs)/            # Main app tabs
   │   │   ├── index.tsx       # Dashboard/Overview
   │   │   ├── projects.tsx
   │   │   ├── chat.tsx
   │   │   └── schedule.tsx
   │   └── _layout.tsx
   ├── src/
   │   ├── components/
   │   │   ├── auth/          # Auth components (from Round Up Friends)
   │   │   ├── projects/      # Project components (adapted from client-builder-sync)
   │   │   ├── dashboard/     # Dashboard components
   │   │   └── ui/           # Reusable UI components
   │   ├── hooks/
   │   │   ├── useAuth.tsx    # Auth hook (combine patterns)
   │   │   ├── useProjects.ts
   │   │   └── ...
   │   ├── services/
   │   │   ├── auth.ts        # Auth service (from Round Up Friends)
   │   │   └── supabase.ts    # Supabase client
   │   ├── store/
   │   │   ├── useAuthStore.ts  # Zustand auth store (from Round Up Friends)
   │   │   └── useProjectStore.ts
   │   ├── utils/
   │   │   └── validation.ts  # Validation utilities (from Round Up Friends)
   │   └── theme/
   │       └── index.ts        # Theme configuration
   └── supabase/
       └── migrations/        # Database migrations (from client-builder-sync)
   ```

### 2.2 Authentication Implementation

#### Step 1: Port Auth Infrastructure
1. **Copy from Round Up Friends:**
   - `src/store/useAuthStore.ts` - Zustand store with persistence
   - `src/services/auth.ts` - Auth service functions
   - `src/utils/validation.ts` - Form validation utilities
   - `src/lib/supabase.ts` - Supabase client configuration

2. **Adapt for BuildSync:**
   - Update Supabase configuration to match client-builder-sync
   - Integrate role fetching (from client-builder-sync pattern)
   - Maintain Round Up Friends UX patterns

#### Step 2: Port Auth Screens
1. **Create auth screens** (copy from Round Up Friends):
   - `app/(auth)/login.tsx` - Based on LoginScreen.tsx
   - `app/(auth)/register.tsx` - Based on RegisterScreen.tsx
   - `app/(auth)/forgot-password.tsx` - Based on ForgotPasswordScreen.tsx
   - `app/(auth)/reset-password.tsx` - Based on ResetPasswordScreen.tsx
   - `app/(auth)/verify-email.tsx` - Based on VerifyEmailScreen.tsx

2. **Adaptations:**
   - Update branding from "Round Up Friends" to "BuildSync"
   - Keep green primary color or adapt to BuildSync brand
   - Maintain validation and error handling patterns
   - Add role selection during registration (from client-builder-sync)

#### Step 3: Create Auth Hook
1. **Combine patterns:**
   - Use Zustand store (Round Up Friends pattern)
   - Add role management (client-builder-sync pattern)
   - Create `useAuth` hook that wraps store and provides role info

### 2.3 Core Functionality Implementation

#### Phase 1: Project Management
1. **Port project-related hooks:**
   - `useProjects` - Project fetching and management
   - `useProjectMembers` - Team member management
   - `useProjectInvitations` - Invitation handling

2. **Create mobile-optimized components:**
   - Project list view (mobile-friendly)
   - Project selection screen
   - Project details screen

#### Phase 2: Dashboard/Overview
1. **Port dashboard components:**
   - Stats cards
   - Product cards
   - Milestone timeline
   - Decision cards
   - Cost change items

2. **Adapt for mobile:**
   - Responsive layouts
   - Touch-friendly interactions
   - Mobile navigation patterns

#### Phase 3: Feature Modules
1. **Products:**
   - Product list/card views
   - Add/edit product screens
   - Category filtering
   - Paint color picker

2. **Drawings:**
   - Drawing list
   - Drawing upload/view
   - File management

3. **Milestones:**
   - Timeline view
   - Add/edit milestone screens
   - Progress indicators

4. **Decisions:**
   - Decision list
   - Decision detail screen
   - Approval actions

5. **Cost Changes:**
   - Cost change list
   - Add/edit cost change screens
   - Currency formatting

6. **Chat:**
   - Chat list
   - Chat conversation screen
   - Photo sharing
   - Real-time updates

7. **Schedule:**
   - Calendar view
   - Schedule item management

8. **Remedial Works:**
   - Issue list
   - Issue detail screen
   - Status management

#### Phase 4: Navigation & Layout
1. **Create navigation structure:**
   - Tab navigation for main sections
   - Stack navigation for detail screens
   - Auth flow navigation

2. **Create layout components:**
   - Header component
   - Sidebar (drawer for mobile)
   - Project selector

### 2.4 Data Layer

#### Supabase Integration
1. **Port database schema:**
   - Copy migrations from client-builder-sync
   - Ensure compatibility with existing data

2. **Create data hooks:**
   - Use TanStack Query for data fetching
   - Create hooks for each feature area
   - Implement optimistic updates

3. **Real-time subscriptions:**
   - Chat messages
   - Project updates
   - Notifications

### 2.5 UI/UX Adaptation

#### Design System
1. **Create theme:**
   - Base on Round Up Friends theme structure
   - Adapt colors to BuildSync brand
   - Define typography scale
   - Component styles

2. **Component Library:**
   - Create mobile-native components
   - Adapt web components from client-builder-sync
   - Maintain consistency with Round Up Friends patterns

#### Mobile Optimizations
1. **Touch interactions:**
   - Swipe gestures
   - Pull-to-refresh
   - Long-press actions

2. **Performance:**
   - Image optimization
   - Lazy loading
   - Efficient list rendering

3. **Offline support:**
   - Cache critical data
   - Queue actions when offline
   - Sync when back online

---

## 3. Detailed Implementation Steps

### Step 1: Project Initialization (Week 1)
- [x] Initialize Expo project
- [x] Set up TypeScript
- [x] Configure Supabase client
- [x] Set up project structure
- [x] Install core dependencies
- [x] Configure Expo Router

### Step 2: Auth Foundation (Week 1-2)
- [x] Port `useAuthStore` from Round Up Friends
- [x] Port `auth.ts` service
- [x] Port validation utilities
- [x] Set up Supabase client
- [x] Create auth hook with role support
- [x] Test auth flow

### Step 3: Auth Screens (Week 2)
- [x] Port LoginScreen → `app/(auth)/login.tsx`
- [x] Port RegisterScreen → `app/(auth)/register.tsx`
- [x] Add role selection to registration
- [x] Port ForgotPasswordScreen
- [x] Port ResetPasswordScreen
- [x] Port VerifyEmailScreen
- [x] Create AuthLoadingScreen (auth check + loading in root layout)
- [x] Test all auth flows

### Step 4: Navigation & Layout (Week 2-3)
- [x] Set up Expo Router structure
- [x] Create root layout with auth check
- [x] Create tab navigation
- [x] Create protected route wrapper
- [x] Set up project selector

### Step 5: Project Management (Week 3-4)
- [x] Port project hooks
- [x] Create project list screen
- [ ] Create project detail screen
- [x] Create project selector component
- [x] Implement project switching
- [x] Port invitation system (team members screen, invite by email)

### Step 6: Dashboard (Week 4-5)
- [x] Port dashboard components
- [x] Create mobile-optimized layout
- [x] Implement stats cards
- [x] Create product cards/list
- [x] Implement milestone timeline
- [x] Add decision cards
- [x] Add cost change items

### Step 7: Feature Modules (Week 5-8)
- [x] Products module
- [x] Drawings module
- [x] Milestones module
- [x] Decisions module
- [x] Cost Changes module
- [x] Chat module
- [x] Schedule module
- [x] Remedial Works module

### Step 8: Polish & Testing (Week 8-9)
- [x] Error handling (Error Boundary, consistent Alert.alert for mutations)
- [x] Loading states (LoadingScreen component, spinners on list screens)
- [x] Offline support (persisted query cache, OfflineBanner, retry)
- [x] Performance optimization (FlatList initialNumToRender, windowSize, removeClippedSubviews)
- [ ] Testing on iOS/Android (see TESTING.md)
- [ ] Bug fixes (ongoing)

---

## 4. Key Decisions & Considerations

### 4.1 Architecture Decisions

1. **State Management:**
   - Use Zustand for auth (from Round Up Friends)
   - Use TanStack Query for server state (from client-builder-sync)
   - Use React Context for UI state where needed

2. **Navigation:**
   - Expo Router for file-based routing
   - Tab navigation for main sections
   - Stack navigation for detail screens

3. **Styling:**
   - Use Restyle (from Round Up Friends) or React Native StyleSheet
   - Create reusable component library
   - Maintain design consistency

### 4.2 Technical Considerations

1. **Supabase Configuration:**
   - Use same Supabase project as client-builder-sync
   - Ensure RLS policies work for mobile
   - Handle deep linking for auth callbacks

2. **Image Handling:**
   - Use Expo Image for optimized images
   - Implement image upload for chat/photos
   - Cache images appropriately

3. **Real-time Features:**
   - Use Supabase real-time subscriptions
   - Handle connection state
   - Implement reconnection logic

4. **Offline Support:**
   - Cache project data
   - Queue mutations when offline
   - Sync on reconnect

### 4.3 UX Considerations

1. **Mobile-First Design:**
   - Touch-friendly targets
   - Swipe gestures
   - Pull-to-refresh
   - Bottom sheet modals

2. **Performance:**
   - Optimize list rendering
   - Lazy load images
   - Debounce search inputs
   - Efficient data fetching

3. **Accessibility:**
   - Screen reader support
   - Proper labels
   - Keyboard navigation
   - Color contrast

---

## 5. Migration Checklist

### Auth Components (from Round Up Friends)
- [x] LoginScreen → login.tsx
- [x] RegisterScreen → register.tsx
- [x] ForgotPasswordScreen → forgot-password.tsx
- [x] ResetPasswordScreen → reset-password.tsx
- [x] VerifyEmailScreen → verify-email.tsx
- [x] AuthLoadingScreen (auth check in root layout)
- [x] useAuthStore → useAuthStore.ts
- [x] auth.ts service → auth.ts
- [x] validation.ts → validation.ts

### Core Functionality (from client-builder-sync)
- [x] Project management hooks
- [x] Project components (list, selector, side menu, create modal, team members)
- [x] Dashboard components
- [x] Product components
- [x] Drawing components
- [x] Milestone components
- [x] Decision components
- [x] Cost change components
- [x] Chat components
- [x] Schedule components
- [x] Remedial works components
- [ ] Feedback components
- [ ] Onboarding flow
- [ ] Super admin features

### Infrastructure
- [x] Supabase client setup
- [ ] Database migrations
- [x] Type definitions
- [x] Error handling
- [ ] Logging
- [ ] Analytics (if needed)

---

## 6. Success Criteria

1. **Authentication:**
   - ✅ Users can register with role selection
   - ✅ Users can login/logout
   - ✅ Password reset flow works
   - ✅ Email verification works
   - ✅ Session persistence works
   - ✅ Role-based access works

2. **Core Features:**
   - ✅ Users can view/manage projects
   - ✅ All feature modules functional
   - ✅ Real-time updates work
   - ✅ Offline support works
   - ✅ Performance is acceptable

3. **UX:**
   - ✅ Mobile-optimized layouts
   - ✅ Smooth navigation
   - ✅ Intuitive interactions
   - ✅ Error handling is clear
   - ✅ Loading states are appropriate

---

## 7. Risk Mitigation

### Potential Risks:
1. **Supabase compatibility** - Ensure mobile client works with existing schema
2. **Performance** - Large lists may need optimization
3. **Offline sync** - Complex conflict resolution
4. **Real-time** - Connection management complexity

### Mitigation Strategies:
1. Test Supabase integration early
2. Implement virtualization for lists
3. Use optimistic updates with rollback
4. Implement robust reconnection logic

---

## 8. Next Steps

1. **Review and approve this plan**
2. **Set up development environment**
3. **Initialize project structure**
4. **Begin with Step 1: Project Initialization**
5. **Iterate through implementation steps**

---

## Notes

- This plan assumes familiarity with both codebases
- Adapt timelines based on team size and priorities
- Consider phased rollout (MVP first, then full features)
- Maintain code quality through code reviews and testing
