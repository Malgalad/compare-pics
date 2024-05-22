import * as React from 'react';

type ErrorBoundaryProps = React.PropsWithChildren<{
  message?: React.ReactNode;
}>;

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null | undefined;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error: error };
  }

  render() {
    const { children, message = 'Something has gone wrong' } = this.props;

    return this.state.hasError ? message : children;
  }
}

export default ErrorBoundary;
