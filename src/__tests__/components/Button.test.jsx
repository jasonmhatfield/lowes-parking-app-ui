import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Button from '../../components/Button';

describe('Button Component', () => {
  it('renders the button with the correct text', () => {
    render(<Button dataTestId="button-primary">Click Me</Button>);
    const button = screen.getByTestId('button-primary');
    expect(button).toHaveTextContent('Click Me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} dataTestId="button-click">Click Me</Button>);
    const button = screen.getByTestId('button-click');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click event when button is disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled dataTestId="button-disabled-click">Click Me</Button>);
    const button = screen.getByTestId('button-disabled-click');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not break if onClick is not provided', () => {
    render(<Button dataTestId="button-no-click">Click Me</Button>);
    const button = screen.getByTestId('button-no-click');
    fireEvent.click(button);
    // No errors should occur, and no function should be called
    expect(button).toHaveTextContent('Click Me');
  });

  it('applies the correct styles for the primary class', () => {
    render(<Button variant="primary" dataTestId="button-primary">Primary Button</Button>);
    const button = screen.getByTestId('button-primary');
    expect(button).toHaveClass('primary');
  });

  it('applies the correct styles for the secondary class', () => {
    render(<Button variant="secondary" dataTestId="button-secondary">Secondary Button</Button>);
    const button = screen.getByTestId('button-secondary');
    expect(button).toHaveClass('secondary');
  });

  it('applies the correct styles for the success class', () => {
    render(<Button variant="success" dataTestId="button-success">Success Button</Button>);
    const button = screen.getByTestId('button-success');
    expect(button).toHaveClass('success');
  });

  it('applies the correct styles for the danger class', () => {
    render(<Button variant="danger" dataTestId="button-danger">Danger Button</Button>);
    const button = screen.getByTestId('button-danger');
    expect(button).toHaveClass('danger');
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled dataTestId="button-disabled">Disabled Button</Button>);
    const button = screen.getByTestId('button-disabled');
    expect(button).toBeDisabled();
  });

  it('defaults to the primary class if no variant is provided', () => {
    render(<Button dataTestId="button-default">Default Button</Button>);
    const button = screen.getByTestId('button-default');
    expect(button).toHaveClass('primary');
  });
});
