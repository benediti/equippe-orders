'use client';
// src/app/acesso-negado/page.tsx
export default function AcessoNegadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-surface p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-2xl mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Pendente</h1>
        <p className="text-gray-500 text-sm mb-6">
          Seu login foi reconhecido, mas seu acesso ainda não foi liberado.<br />
          Entre em contato com o administrador do sistema.
        </p>
        <p className="text-xs text-gray-400">
          📧 financeiro@equippe.com.br
        </p>
        <a
          href="/login"
          className="mt-6 inline-block text-sm text-primary-500 hover:underline"
        >
          ← Voltar ao login
        </a>
      </div>
    </div>
  );
}
