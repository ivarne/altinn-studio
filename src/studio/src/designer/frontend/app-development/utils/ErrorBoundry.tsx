import * as React from 'react';
import ErrorPage from '../layout/ErrorPage';

type State = {
  hasError: boolean;
}
type Props = {}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props:Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  // TODO: log frontend errors to ApplicationInsights
  // componentDidCatch(error, errorInfo) {
  //   // You can also log the error to an error reporting service
  // }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    return this.props.children;
  }
}
