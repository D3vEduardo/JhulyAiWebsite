# Server Actions Documentation

This document lists all the server actions in the Jhuly AI Website project.

## 1. Onboarding Actions
**File:** `src/app/(private)/onboarding/actions.ts`

This file contains server actions used in the onboarding flow.

### Functions:

1. **OboardingAction**
   - **Purpose:** Handles the onboarding form submission and user data validation
   - **Parameters:** `formData: z.infer<typeof onboardingFormSchema>`
   - **Returns:** `Promise<ActionResponse>` where ActionResponse contains success status, error messages, and field-specific errors
   - **Description:** Validates the onboarding form data, checks API key validity, and updates user information in the database

2. **getUserData**
   - **Purpose:** Retrieves user data for the onboarding form
   - **Parameters:** None
   - **Returns:** `Promise` with user data (name, email, apiKey) or undefined
   - **Description:** Fetches the current user's data from the database to populate the onboarding form

## 2. Aside Menu Actions

**File:** `src/components/AsideMenu/getChatMessages.ts`

This file contains a server action to fetch chat messages.

### Functions:

1. **getChatMessages**
   - **Purpose:** Retrieves messages for a specific chat
   - **Parameters:** `chatId: string`
   - **Returns:** `Promise` with an array of converted chat messages
   - **Description:** Fetches chat messages from the database and converts them to the AI model format

**File:** `src/components/AsideMenu/getUserChats.ts`

This file contains a server action to fetch user chats.

### Functions:

1. **getUserChats**
   - **Purpose:** Retrieves all chats for the current user
   - **Parameters:** None
   - **Returns:** `Promise` with an array of user chats
   - **Description:** Fetches all chats belonging to the authenticated user from the database

## Files with "use server" Directive

The following files contain the "use server" directive but do not export server action functions:

1. `src/api/middlewares/admin/admin.middleware.ts`
2. `src/api/middlewares/auth/auth.middleware.ts`
3. `src/api/routes/admin/users/adminUsers.route.ts`
4. `src/api/routes/ai/stream/stream.route.ts`
5. `src/api/routes/users/me/chats/(chatId)/messages/(messageId)/userMeChatMessageById.route.ts`
6. `src/api/routes/users/me/chats/(chatId)/messages/userMeChatMessages.route.ts`
7. `src/api/routes/users/me/chats/(chatId)/userMeChatById.route.ts`
8. `src/api/routes/users/me/chats/userMeChats.route.ts`
9. `src/api/routes/users/me/messages/(messageId)/userMeMessageById.route.ts`
10. `src/api/routes/users/me/messages/userMeMessages.route.ts`
11. `src/api/routes/users/me/usersMe.route.ts`
12. `src/app/(private)/chat/[chatId]/page.tsx`
13. `src/app/(private)/login/page.tsx`
14. `src/app/(private)/onboarding/layout.tsx`
15. `src/app/(private)/onboarding/page.tsx`
16. `src/app/(public)/overview/page.tsx`
17. `src/app/api/chat/_route.ts`
18. `src/components/Accordion/Accordion.tsx`
19. `src/components/AsideMenu/AsideMenu.tsx`
20. `src/components/AsideMenu/AsideMenuChats.tsx`
21. `src/components/Button.tsx`
22. `src/components/ChatBalloon/ChatBalloon.tsx`
23. `src/components/ChatContainer/ChatContainer.tsx`
24. `src/components/ChatMessages/ChatMessages.tsx`
25. `src/components/ChatNavbar/ToggleAsideMenuButton.tsx`
26. `src/components/Loading/LoadingScreen.tsx`
27. `src/components/Loading/LoadingSpritesAnimation.tsx`
28. `src/components/OverviewNavbar/NavbarMenuContext.tsx`
29. `src/components/OverviewNavbar/OverviewNavbar.tsx`
30. `src/components/OverviewNavbar/ToggleMenuButton.tsx`
31. `src/components/PromptForm/PromptForm.tsx`
32. `src/components/PromptForm/PromptSubmitButton.tsx`
33. `src/components/PromptForm/ReasoningButton.tsx`
34. `src/components/Providers.tsx`
35. `src/components/UserAvatar.tsx`
36. `src/contexts/ChatContext/Hooks.tsx`
37. `src/contexts/ChatContext/types.ts`
38. `src/hooks/useIsClient.ts`
39. `src/lib/betterAuth/auth.ts`
40. `src/middleware.ts`
41. `src/util/convertMessageOfDbToAiModel.ts`

Note: These files contain the "use server" directive but are not exporting server action functions. They may be using the directive for other purposes or it may be residual from previous development.

## Usage Patterns

Server actions in this project are typically used for:
1. Form submissions that require server-side validation
2. Data fetching that needs to happen on the server
3. Database operations that shouldn't be exposed to the client
4. API calls that require authentication

All server actions use the `"use server"` directive at the top of the file and are exported as async functions.