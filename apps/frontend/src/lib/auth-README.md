# Authentication System - Frontend

## Overview

This authentication system implements a perfect auth flow for the frontend that automatically handles user creation and session management using localStorage.

## How it Works

### Perfect Auth Flow

1. **Check localStorage for userId**
   - If userId exists → Get user data from API → Set headers for requests
   - If userId doesn't exist → Create new user via API → Save to localStorage → Set headers

### Components

#### 1. AuthService (`src/lib/auth.ts`)
- Singleton service that manages authentication state
- Handles localStorage operations
- Provides headers for API requests (`Authorization: Bearer <user-id>`)
- Manages user data and authentication status

#### 2. useAuth Hook (`src/hooks/useAuth.ts`)
- React hook that provides authentication state and methods
- Automatically initializes authentication on mount
- Implements the perfect auth flow
- Provides methods for user updates and logout

#### 3. AuthProvider (`src/components/providers/AuthProvider.tsx`)
- React context provider for app-wide authentication state
- Wraps the entire application in `layout.tsx`

#### 4. Updated API Client (`src/lib/api.ts`)
- Uses AuthService for headers
- Correctly implements API endpoints:
  - `POST /users` - Create user
  - `GET /users/:id` - Get user by ID
  - `PATCH /users/:id` - Update user
  - `GET /task-lists` - Get task lists
  - `POST /task-lists` - Create task list
  - `POST /tasks` - Create task
  - `PATCH /tasks/:id` - Update task
  - `DELETE /tasks/:id` - Delete task

## Usage

### Basic Usage

```tsx
import { useAuthContext } from '@/components/providers/AuthProvider';

function MyComponent() {
  const { user, isLoading, error, isAuthenticated } = useAuthContext();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;
  
  return <div>Welcome, {user?.name || 'Anonymous'}!</div>;
}
```

### Updating User

```tsx
import { useAuthContext } from '@/components/providers/AuthProvider';

function UserSettings() {
  const { updateUser } = useAuthContext();
  
  const handleUpdate = async () => {
    await updateUser({
      name: 'John Doe',
      aiIntegrationType: 'openrouter',
      aiToken: 'your-token'
    });
  };
  
  return <button onClick={handleUpdate}>Update User</button>;
}
```

### Logout

```tsx
import { useAuthContext } from '@/components/providers/AuthProvider';

function LogoutButton() {
  const { logout } = useAuthContext();
  
  return <button onClick={logout}>Logout</button>;
}
```

## API Headers

All authenticated requests automatically include:
```
Authorization: Bearer <user-id>
```

## localStorage

The system automatically manages:
- `userId` - Stores the user ID for session persistence
- User data is cached in memory for performance

## Error Handling

- Network errors are handled gracefully
- User creation fallback if user lookup fails
- Clear error messages for debugging

## Integration with Existing Code

The `useAppState` hook has been updated to integrate with the authentication system:
- User state is automatically managed by `useAuth`
- Loading states are combined
- Error states are combined

## Example Component

See `src/components/atoms/AuthStatus.tsx` for a complete example of how to display authentication status.
