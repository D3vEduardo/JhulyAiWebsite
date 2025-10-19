# Prompt Suggestions Bug Investigation

## Problem Statement

When users click on a prompt suggestion from `@src/components/ChatMessages/PromptSuggestions.tsx`, the following issues occur:
1. Prompts appear duplicated in the frontend
2. If the model activates reasoning, reasoning balloons get duplicated
3. Prompt balloons' heights start reducing until they become invisible
4. The entire chat interface begins to freeze

## Root Cause Analysis

### 1. Event Handling Mechanism

The `PromptSuggestions.tsx` component uses a custom event (`prompt-suggestion-selected`) to trigger message sending:

```typescript
// In PromptSuggestions.tsx
const handleSuggestionClick = ({ suggestion }: { suggestion: string }) => {
  if (status === "ready") {
    window.dispatchEvent(
      new CustomEvent<{ prompt: string }>("prompt-suggestion-selected", {
        detail: {
          prompt: suggestion,
        },
      })
    );
  }
};
```

### 2. Event Listener in PromptForm

The event is intercepted by an event listener in `PromptForm.tsx`:

```typescript
// In PromptForm.tsx
useEffect(() => {
  const handlePromptSuggestionSelected = (
    e: CustomEvent<{ prompt: string }>
  ) => {
    if (formRef.current && inputRef.current) {
      const { prompt } = e.detail;

      inputRef.current.value = prompt;
      formRef.current.requestSubmit();
    }
  };
  window.addEventListener(
    "prompt-suggestion-selected",
    handlePromptSuggestionSelected as EventListener
  );
}, [formRef]); // <- PROBLEM: Missing dependency!
}, []);
```

### 3. The Critical Bug

The main issue is in the `useEffect` dependency array in `PromptForm.tsx`. The current implementation has:

```typescript
useEffect(() => { ... }, [formRef]); 
```

This creates a new event listener every time `formRef` changes, but more importantly, the effect doesn't have the proper dependencies. Since `formRef` is a ref object, it doesn't actually change between renders, but the effect might still run multiple times under certain conditions.

### 4. Race Condition and State Management

The bug occurs due to multiple interactions:

1. User clicks a suggestion
2. Custom event is dispatched
3. Multiple event listeners might be registered (due to useEffect dependencies)
4. Each listener triggers `formRef.current.requestSubmit()`
5. Multiple `sendMessage` calls are made simultaneously
6. This causes duplicated messages and UI inconsistencies

### 5. Chat Context Message Handling

In `ChatContext/Provider.tsx`, the `onFinish` callback updates the query cache:

```typescript
const onFinish = useCallback(
  ({ message }: { message: UIMessage }) => {
    // ...
    queryClient.setQueryData([\"chat\", `chat_${chatId}`], (oldData) => {
      const prev = (oldData as UIMessage[]) ?? [];
      return [...prev, message];
    });
  },
  [chatId, isNewChat, queryClient]
);
```

When multiple messages are sent simultaneously due to the event duplication, this creates race conditions that corrupt the message state.

### 6. Reasoning Balloon Duplication

The reasoning balloons get duplicated because:
- When the API response includes reasoning parts, multiple responses might be processed due to multiple simultaneous submissions
- The ChatMessages component renders reasoning accordions using the message parts:
  
  ```typescript
  {message.parts?.find((part) => part.type === "reasoning")
    ?.text && (
    <div className="mb-2 w-full ml-auto mr-auto">
      <Accordion
        title="Reasoning"
        content={
          message.parts.find((part) => part.type === "reasoning")
            ?.text
        }
      />
    </div>
  )}
  ```

- With multiple simultaneous API requests, multiple reasoning parts might be created
- The message parts array might contain multiple reasoning entries in a single response
- The Accordion component renders for each reasoning part found

### 8. Height Reduction Issue

The height reduction in prompt balloons is likely due to:
- Multiple simultaneous renders causing React to miscalculate layout
- The `motion` components receiving conflicting layout updates
- DOM elements being rapidly created and modified without proper cleanup
- Potential CSS conflicts when multiple balloons are rendered simultaneously
- The layout animation system getting confused with multiple simultaneous messages
- The `motion` component's `layout` prop causing unexpected size changes during animation
- Multiple `MemoChatBalloon` components with the same ID causing reconciliation issues

## Comparison with PromptInput

### PromptInput Implementation (Working Correctly)
- Direct form submission using `formRef.current.requestSubmit()`
- No custom events involved
- Single, predictable control flow from user input to submission
- Simple interaction: user types → user presses Enter → form submits
- No useEffect dependency issues

### PromptSuggestions Implementation (Buggy)
- Uses custom events to communicate between components (`prompt-suggestion-selected`)
- Multiple event listeners might be registered due to incorrect useEffect dependencies
- Indirect communication between components
- Potential for multiple simultaneous submissions when event listener is registered multiple times
- The useEffect in PromptForm has incorrect dependencies: `[formRef]` instead of `[]` or proper dependencies

### Key Differences
1. **Communication Pattern**: Direct vs. Event-based
2. **Component Coupling**: Loose coupling with events vs. tight integration
3. **State Management**: Single submission vs. potential multiple submissions
4. **Effect Dependencies**: Proper vs. improper useEffect dependencies

The PromptSuggestions approach introduces complexity that isn't handled properly, leading to the multiple submission issue.

## Message Handling Flow Analysis

### Normal Flow (Working)
1. User types in PromptInput
2. User presses Enter or clicks submit
3. Form handles the submission with `chat.sendMessage()`
4. ChatContext processes the message via `useChat` hook
5. API endpoint receives request and processes it
6. Response flows back and updates the UI

### Problematic Flow (With PromptSuggestions)
1. User clicks prompt suggestion
2. Custom event `prompt-suggestion-selected` is dispatched
3. PromptForm event listener receives the event
4. If useEffect ran multiple times, multiple listeners might trigger
5. Multiple `formRef.current.requestSubmit()` might execute
6. Multiple `chat.sendMessage()` calls initiated simultaneously
7. Race conditions in ChatContext's onFinish callback
8. Multiple API requests may be sent for the same message
9. Multiple responses updating the UI simultaneously
10. UI becomes inconsistent with duplicated messages and visual artifacts

### The useEffect Issue in Detail
In `PromptForm.tsx`:
```typescript
useEffect(() => {
  // ... event listener setup
  window.addEventListener(/* ... */);
}, [formRef]);  // This dependency is problematic
```

The issue is that when the component re-renders for other reasons, this useEffect may run again, potentially adding duplicate event listeners. The ideal would be:

```typescript
useEffect(() => {
  // ... event listener setup
  window.addEventListener(/* ... */);
  
  return () => {
    // Proper cleanup
    window.removeEventListener(/* ... */);
  };
}, []); // Empty dependency array to run only once
```

But because the dependency array includes `formRef`, and there might be other state changes happening, the effect runs multiple times, creating multiple event listeners.

## Recommendations

### Immediate Fix
1. Update the useEffect in `PromptForm.tsx` to have proper cleanup and dependencies:

```typescript
useEffect(() => {
  const handlePromptSuggestionSelected = (
    e: CustomEvent<{ prompt: string }>
  ) => {
    if (formRef.current && inputRef.current) {
      const { prompt } = e.detail;

      // Prevent multiple submissions if one is already in progress
      if (!isLoading && inputRef.current.value.trim() === '') {
        inputRef.current.value = prompt;
        formRef.current.requestSubmit();
      }
    }
  };

  window.addEventListener(
    "prompt-suggestion-selected",
    handlePromptSuggestionSelected as EventListener
  );

  // Proper cleanup function
  return () => {
    window.removeEventListener(
      "prompt-suggestion-selected",
      handlePromptSuggestionSelected as EventListener
    );
  };
}, [formRef, inputRef, isLoading]); // Proper dependencies
```

### Alternative Approach
Instead of custom events, consider passing a callback from ChatContainer down to PromptSuggestions through props or context. This would eliminate the event-based communication and potential for multiple listeners.

### Additional Improvements
1. Add message deduplication logic in the ChatContext
2. Implement request debouncing to prevent multiple simultaneous submissions
3. Add loading states to prevent duplicate submissions
4. Improve keying strategy in ChatMessages to prevent reconciliation issues
5. Consider using React's useEvent hook (when available) for consistent event handler references

The `PromptInput.tsx` works correctly because:
1. It uses a direct form submission without custom events
2. No event listeners that can multiply
3. Direct control flow from input to submit
4. Single, predictable message sending flow

## Solution

The bug can be fixed by:
1. Adding proper dependencies to the useEffect in `PromptForm.tsx`
2. Preventing multiple event listeners from being registered
3. Adding checks to ensure only one message is sent at a time
4. Using a more robust event handling mechanism

Here's a suggested fix:

```typescript
useEffect(() => {
  const handlePromptSuggestionSelected = (
    e: CustomEvent<{ prompt: string }>
  ) => {
    if (formRef.current && inputRef.current) {
      const { prompt } = e.detail;

      // Prevent multiple submissions while one is ongoing
      if (inputRef.current.value.trim() === '') {
        inputRef.current.value = prompt;
        formRef.current.requestSubmit();
      }
    }
  };

  window.addEventListener(
    "prompt-suggestion-selected",
    handlePromptSuggestionSelected as EventListener
  );

  // Cleanup function to remove event listener
  return () => {
    window.removeEventListener(
      "prompt-suggestion-selected",
      handlePromptSuggestionSelected as EventListener
    );
  };
}, [formRef, inputRef]); // Proper dependencies
```

## Impact of the Bug

This bug affects:
1. User experience with duplicated and disappearing UI elements
2. Performance with multiple API calls for a single prompt
3. Data consistency with potential message duplication in the database
4. Application stability with UI freezing

## Files Affected

- `src/components/ChatMessages/PromptSuggestions.tsx` - Source of custom event
- `src/components/PromptForm/PromptForm.tsx` - Event listener with buggy useEffect
- `src/contexts/ChatContext/Provider.tsx` - Message state management
- `src/components/ChatMessages/ChatMessages.tsx` - Message rendering
- `src/components/ChatBalloon/ChatBalloon.tsx` - Individual message display