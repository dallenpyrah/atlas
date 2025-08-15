# TanStack Query v5 Optimistic Update Patterns

## Overview

This module provides production-ready, type-safe patterns for implementing optimistic updates in TanStack Query v5. These patterns handle:

- Proper TypeScript typing for context
- Automatic rollback on errors
- List operations (add, update, delete)
- Temporary ID management
- Coordinated multi-query updates

## Available Patterns

### 1. useOptimisticAdd
Adds an item optimistically with a temporary ID, then replaces with server response.

```typescript
const addMutation = useOptimisticAdd<Todo, CreateTodoVariables>({
  queryKey: ['todos'],
  mutationFn: createTodoApi,
  createOptimisticItem: (variables, tempId) => ({
    id: tempId,
    title: variables.title,
    completed: false,
    createdAt: new Date(),
    userId: variables.userId,
  }),
})
```

### 2. useOptimisticUpdate
Updates an existing item optimistically with rollback on error.

```typescript
const updateMutation = useOptimisticUpdate<Todo, UpdateTodoVariables>({
  queryKey: (id) => ['todos', id],
  mutationFn: updateTodoApi,
})
```

### 3. useOptimisticDelete
Removes an item optimistically from a list with restoration on error.

```typescript
const deleteMutation = useOptimisticDelete<Todo, DeleteTodoVariables>({
  queryKey: ['todos'],
  mutationFn: deleteTodoApi,
})
```

### 4. useOptimisticBatchUpdate
Updates multiple items at once with rollback capability.

```typescript
const batchUpdateMutation = useOptimisticBatchUpdate<Todo, BatchUpdateVariables>({
  queryKey: ['todos'],
  mutationFn: batchUpdateTodosApi,
})
```

### 5. useOptimisticReorder
Reorders items in a list optimistically.

```typescript
const reorderMutation = useOptimisticReorder<Todo, ReorderVariables>({
  queryKey: ['todos'],
  mutationFn: reorderTodosApi,
  reorderFn: (items, variables) => {
    const newItems = [...items]
    const [movedItem] = newItems.splice(variables.fromIndex, 1)
    newItems.splice(variables.toIndex, 0, movedItem)
    return newItems
  },
})
```

### 6. useCoordinatedUpdate
Updates multiple related queries optimistically.

```typescript
const coordinatedMutation = useCoordinatedUpdate<Todo, CreateTodoVariables>({
  mutationFn: createTodoApi,
  mutations: [
    {
      queryKey: ['todos'],
      updater: (oldTodos, variables, result) => {
        if (result) return [...oldTodos, result]
        const tempTodo = createTempTodo(variables)
        return [...oldTodos, tempTodo]
      },
    },
    {
      queryKey: ['users', userId],
      updater: (oldUser) => ({
        ...oldUser,
        todoCount: oldUser.todoCount + 1,
      }),
    },
  ],
})
```

### 7. useUIOptimisticMutation
Simplified v5 approach using mutation variables for UI updates.

```typescript
const mutation = useUIOptimisticMutation<Todo, CreateTodoVariables>({
  mutationFn: createTodoApi,
  invalidateKeys: [['todos'], ['users', userId]],
})

// In UI:
{mutation.isPending && (
  <div style={{ opacity: 0.5 }}>
    {mutation.variables.title} (Adding...)
  </div>
)}
```

## Key Features

### TypeScript Support
All patterns are fully typed with generics for:
- `TItem`: The resource type (must extend `Identifiable`)
- `TVariables`: The mutation input type
- `TError`: The error type (defaults to `Error`)
- `TContext`: The rollback context type

### Automatic Query Cancellation
All patterns automatically cancel outgoing refetches before applying optimistic updates to prevent race conditions.

### Snapshot & Rollback
Each pattern captures the previous state and provides automatic rollback on error.

### List Data Handling
Patterns support both array and paginated data structures:
```typescript
type ListData<T> = T[] | { items: T[]; [key: string]: any }
```

### Temporary ID Generation
For adding new items, temporary IDs are generated with:
- Timestamp prefix for uniqueness
- Random suffix for collision prevention
- Format: `temp_${timestamp}_${randomString}`

## Best Practices

1. **Always provide proper TypeScript types** for type safety and better IDE support.

2. **Use the appropriate pattern** for your use case:
   - Single item updates: `useOptimisticUpdate`
   - List additions: `useOptimisticAdd`
   - Multiple related queries: `useCoordinatedUpdate`
   - Simple UI feedback: `useUIOptimisticMutation`

3. **Handle loading states** in your UI to provide feedback during mutations.

4. **Consider error boundaries** for handling unexpected errors.

5. **Test rollback scenarios** to ensure data consistency.

## Migration from Traditional Approach

### Before (Manual Implementation)
```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries(['todos'])
    const previousTodos = queryClient.getQueryData(['todos'])
    queryClient.setQueryData(['todos'], old => [...old, newTodo])
    return { previousTodos }
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos)
  },
  onSettled: () => {
    queryClient.invalidateQueries(['todos'])
  },
})
```

### After (Using Patterns)
```typescript
const mutation = useOptimisticAdd({
  queryKey: ['todos'],
  mutationFn: createTodo,
  createOptimisticItem: (variables, tempId) => ({
    ...variables,
    id: tempId,
  }),
})
```

## Performance Considerations

1. **Query Cancellation**: Prevents unnecessary network requests
2. **Selective Invalidation**: Only invalidates affected queries
3. **Immutable Updates**: Ensures React can detect changes efficiently
4. **Batch Operations**: Reduces re-renders for multiple updates

## Error Handling

All patterns provide consistent error handling:
- Automatic rollback to previous state
- Preservation of error callbacks
- Query invalidation after settlement
- Support for custom error handlers

## Examples

See `optimistic-examples.tsx` for complete working examples including:
- Todo list with CRUD operations
- Paginated data handling
- Coordinated updates across multiple resources
- UI-based optimistic updates