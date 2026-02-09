import { render, screen, fireEvent } from '@testing-library/react'
import TodoItem from '../../components/TodoItem'

// Mock the heroicons
jest.mock('@heroicons/react/outline', () => ({
  TrashIcon: ({ className }) => <span className={className}>🗑️</span>,
  PencilIcon: ({ className }) => <span className={className}>✏️</span>,
  CheckIcon: ({ className }) => <span className={className}>✅</span>,
  XIcon: ({ className }) => <span className={className}>❌</span>
}))

describe('TodoItem Component', () => {
  const mockTodo = {
    id: '1',
    title: 'Test Todo',
    completed: false
  }

  const mockOnUpdate = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders todo item correctly', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  test('calls onUpdate when checkbox is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(mockOnUpdate).toHaveBeenCalledWith(mockTodo.id, mockTodo.title, true)
  })

  test('enters edit mode when pencil icon is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const editButton = screen.getByRole('button', { name: /pencil/i })
    fireEvent.click(editButton)

    const input = screen.getByDisplayValue('Test Todo')
    expect(input).toBeInTheDocument()
  })

  test('saves edited todo when check icon is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /pencil/i })
    fireEvent.click(editButton)

    // Change text
    const input = screen.getByDisplayValue('Test Todo')
    fireEvent.change(input, { target: { value: 'Edited Todo' } })

    // Click save
    const saveButton = screen.getByRole('button', { name: /check/i })
    fireEvent.click(saveButton)

    expect(mockOnUpdate).toHaveBeenCalledWith(mockTodo.id, 'Edited Todo')
  })

  test('cancels edit when x icon is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /pencil/i })
    fireEvent.click(editButton)

    // Change text
    const input = screen.getByDisplayValue('Test Todo')
    fireEvent.change(input, { target: { value: 'Changed Text' } })

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /x/i })
    fireEvent.click(cancelButton)

    // Check that the input is gone and original text is back
    expect(() => screen.getByDisplayValue('Changed Text')).toThrow()
    expect(screen.getByText('Test Todo')).toBeInTheDocument()
  })

  test('calls onDelete when trash icon is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /trash/i })
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockTodo.id)
  })
})