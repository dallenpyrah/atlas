import { useQuery } from '@tanstack/react-query'
import React from 'react'
import {
  useCoordinatedUpdate,
  useOptimisticAdd,
  useOptimisticBatchUpdate,
  useOptimisticDelete,
  useOptimisticReorder,
  useOptimisticUpdate,
  useUIOptimisticMutation,
} from './optimistic-patterns'

interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  userId: string
}

interface User {
  id: string
  name: string
  email: string
  todoCount: number
}

interface CreateTodoVariables {
  title: string
  userId: string
}

interface UpdateTodoVariables {
  id: string
  title?: string
  completed?: boolean
}

interface DeleteTodoVariables {
  id: string
}

interface BatchUpdateVariables {
  ids: string[]
  update: { completed: boolean }
}

interface ReorderVariables {
  fromIndex: number
  toIndex: number
}

const API_BASE_URL = '/api'

async function createTodoApi(variables: CreateTodoVariables): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  })
  if (!response.ok) throw new Error('Failed to create todo')
  return response.json()
}

async function updateTodoApi(variables: UpdateTodoVariables): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos/${variables.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  })
  if (!response.ok) throw new Error('Failed to update todo')
  return response.json()
}

async function deleteTodoApi(variables: DeleteTodoVariables): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/todos/${variables.id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete todo')
}

async function batchUpdateTodosApi(variables: BatchUpdateVariables): Promise<Todo[]> {
  const response = await fetch(`${API_BASE_URL}/todos/batch`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  })
  if (!response.ok) throw new Error('Failed to batch update')
  return response.json()
}

async function reorderTodosApi(variables: ReorderVariables): Promise<Todo[]> {
  const response = await fetch(`${API_BASE_URL}/todos/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  })
  if (!response.ok) throw new Error('Failed to reorder')
  return response.json()
}

export function TodoListExample() {
  const todosQuery = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/todos`)
      if (!response.ok) throw new Error('Failed to fetch todos')
      return response.json()
    },
  })

  const addTodoMutation = useOptimisticAdd<Todo, CreateTodoVariables>({
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

  const updateTodoMutation = useOptimisticUpdate<Todo, UpdateTodoVariables>({
    queryKey: (id) => ['todos', id],
    mutationFn: updateTodoApi,
  })

  const deleteTodoMutation = useOptimisticDelete<Todo, DeleteTodoVariables>({
    queryKey: ['todos'],
    mutationFn: deleteTodoApi,
  })

  const batchUpdateMutation = useOptimisticBatchUpdate<Todo, BatchUpdateVariables>({
    queryKey: ['todos'],
    mutationFn: batchUpdateTodosApi,
  })

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

  const handleAddTodo = (title: string) => {
    addTodoMutation.mutate({
      title,
      userId: 'current-user-id',
    })
  }

  const handleToggleTodo = (todo: Todo) => {
    updateTodoMutation.mutate({
      id: todo.id,
      completed: !todo.completed,
    })
  }

  const handleDeleteTodo = (id: string) => {
    deleteTodoMutation.mutate({ id })
  }

  const handleCompleteAll = () => {
    const incompleteTodoIds =
      todosQuery.data?.filter((todo) => !todo.completed).map((todo) => todo.id) || []

    if (incompleteTodoIds.length > 0) {
      batchUpdateMutation.mutate({
        ids: incompleteTodoIds,
        update: { completed: true },
      })
    }
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    reorderMutation.mutate({ fromIndex, toIndex })
  }

  if (todosQuery.isLoading) return <div>Loading...</div>
  if (todosQuery.error) return <div>Error loading todos</div>

  return (
    <div>
      <button onClick={() => handleAddTodo('New Todo')}>Add Todo</button>
      <button onClick={handleCompleteAll}>Complete All</button>

      {todosQuery.data?.map((todo, index) => (
        <div key={todo.id}>
          <input type="checkbox" checked={todo.completed} onChange={() => handleToggleTodo(todo)} />
          <span>{todo.title}</span>
          <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
          {index > 0 && <button onClick={() => handleReorder(index, index - 1)}>↑</button>}
          {index < todosQuery.data.length - 1 && (
            <button onClick={() => handleReorder(index, index + 1)}>↓</button>
          )}
        </div>
      ))}
    </div>
  )
}

export function CoordinatedUpdateExample() {
  const createTodoWithUserUpdateMutation = useCoordinatedUpdate<Todo, CreateTodoVariables>({
    mutationFn: createTodoApi,
    mutations: [
      {
        queryKey: ['todos'],
        updater: (oldTodos: Todo[] | undefined, variables, result) => {
          if (result) {
            return [...(oldTodos || []), result]
          }
          const tempTodo: Todo = {
            id: `temp_${Date.now()}`,
            title: variables.title,
            completed: false,
            createdAt: new Date(),
            userId: variables.userId,
          }
          return [...(oldTodos || []), tempTodo]
        },
      },
      {
        queryKey: ['users', 'current-user-id'],
        updater: (oldUser: User | undefined) => {
          if (!oldUser) return oldUser
          return {
            ...oldUser,
            todoCount: oldUser.todoCount + 1,
          }
        },
      },
    ],
  })

  const handleCreateTodo = (title: string) => {
    createTodoWithUserUpdateMutation.mutate({
      title,
      userId: 'current-user-id',
    })
  }

  return (
    <button onClick={() => handleCreateTodo('New Todo')}>Create Todo (Updates User Count)</button>
  )
}

export function UIOptimisticExample() {
  const todosQuery = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/todos`)
      if (!response.ok) throw new Error('Failed to fetch todos')
      return response.json()
    },
  })

  const addTodoMutation = useUIOptimisticMutation<Todo, CreateTodoVariables>({
    mutationFn: createTodoApi,
    invalidateKeys: [['todos'], ['users', 'current-user-id']],
  })

  const isAddingTodo = addTodoMutation.isPending
  const optimisticTitle = addTodoMutation.variables?.title

  return (
    <div>
      <button
        onClick={() =>
          addTodoMutation.mutate({
            title: 'New Todo',
            userId: 'current-user-id',
          })
        }
        disabled={isAddingTodo}
      >
        Add Todo
      </button>

      {todosQuery.data?.map((todo) => (
        <div key={todo.id}>{todo.title}</div>
      ))}

      {isAddingTodo && optimisticTitle && (
        <div style={{ opacity: 0.5 }}>{optimisticTitle} (Adding...)</div>
      )}
    </div>
  )
}

interface PaginatedTodos {
  items: Todo[]
  totalCount: number
  page: number
  pageSize: number
}

export function PaginatedListExample() {
  const paginatedQuery = useQuery<PaginatedTodos>({
    queryKey: ['todos', 'paginated', { page: 1 }],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/todos?page=1&size=10`)
      if (!response.ok) throw new Error('Failed to fetch todos')
      return response.json()
    },
  })

  const addTodoMutation = useOptimisticAdd<Todo, CreateTodoVariables>({
    queryKey: ['todos', 'paginated', { page: 1 }],
    mutationFn: createTodoApi,
    createOptimisticItem: (variables, tempId) => ({
      id: tempId,
      title: variables.title,
      completed: false,
      createdAt: new Date(),
      userId: variables.userId,
    }),
  })

  const deleteTodoMutation = useOptimisticDelete<Todo, DeleteTodoVariables>({
    queryKey: ['todos', 'paginated', { page: 1 }],
    mutationFn: deleteTodoApi,
  })

  if (paginatedQuery.isLoading) return <div>Loading...</div>
  if (paginatedQuery.error) return <div>Error loading todos</div>

  return (
    <div>
      <button
        onClick={() =>
          addTodoMutation.mutate({
            title: 'New Todo',
            userId: 'current-user-id',
          })
        }
      >
        Add Todo
      </button>

      {paginatedQuery.data?.items.map((todo) => (
        <div key={todo.id}>
          <span>{todo.title}</span>
          <button onClick={() => deleteTodoMutation.mutate({ id: todo.id })}>Delete</button>
        </div>
      ))}

      <div>
        Total: {paginatedQuery.data?.totalCount} | Page: {paginatedQuery.data?.page} /
        {Math.ceil((paginatedQuery.data?.totalCount || 0) / 10)}
      </div>
    </div>
  )
}
