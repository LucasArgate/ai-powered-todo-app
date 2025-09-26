import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock component for testing purposes
const Button = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button onClick={onClick} data-testid="button">
    {children}
  </button>
)

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByTestId('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByTestId('button')
    button.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
