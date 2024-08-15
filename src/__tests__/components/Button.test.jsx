import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Button from '../../components/Button';

describe('Button Component', () => {
  test('renders the button with the correct text', () => {
    render(<Button dataTestId="button-primary">Click Me</Button>);
    const button = screen.getByTestId('button-primary');
    expect(button).toHaveTextContent('Click Me');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} dataTestId="button-click">Click Me</Button>);
    const button = screen.getByTestId('button-click');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not trigger click event when button is disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled dataTestId="button-disabled-click">Click Me</Button>);
    const button = screen.getByTestId('button-disabled-click');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('does not break if onClick is not provided', () => {
    render(<Button dataTestId="button-no-click">Click Me</Button>);
    const button = screen.getByTestId('button-no-click');
    fireEvent.click(button);
    // No errors should occur, and no function should be called
    expect(button).toHaveTextContent('Click Me');
  });

  test('is disabled when the disabled prop is true', () => {
    render(<Button disabled dataTestId="button-disabled">Disabled Button</Button>);
    const button = screen.getByTestId('button-disabled');
    expect(button).toBeDisabled();
  });
});
