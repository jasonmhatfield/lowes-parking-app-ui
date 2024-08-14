import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Button from '../../components/Button';

describe('Button Component', () => {
  it('renders the button with the correct text', () => {
    render(<Button testId="button-primary">Click Me</Button>);
    const button = screen.getByTestId('button-primary');
    expect(button).toHaveTextContent('Click Me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} testId="button-click">Click Me</Button>);
    const button = screen.getByTestId('button-click');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct styles for the primary class', () => {
    render(<Button className="primary" testId="button-primary">Primary Button</Button>);
    const button = screen.getByTestId('button-primary');
    expect(button).toHaveClass('primary');
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled testId="button-disabled">Disabled Button</Button>);
    const button = screen.getByTestId('button-disabled');
    expect(button).toBeDisabled();
  });
});
