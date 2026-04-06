import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      let isPermissionError = false;

      try {
        const parsed = JSON.parse(this.state.error?.message || '{}');
        if (parsed.error?.includes('Missing or insufficient permissions')) {
          errorMessage = 'Erro de permissão no banco de dados. Verifique as regras de segurança.';
          isPermissionError = true;
        } else if (parsed.error?.includes('auth/admin-restricted-operation')) {
          errorMessage = 'A autenticação anônima não está ativada no Console do Firebase.';
        }
      } catch {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-sm space-y-6">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-red-900">Ops! Algo deu errado</h2>
              <p className="text-sm text-red-400 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-all"
            >
              <RefreshCw size={18} />
              Recarregar App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
