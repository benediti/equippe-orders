
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// Variável de controle para garantir que a inicialização ocorra apenas uma vez
let isInitialized = false;

export async function initAdmin() {
  if (isInitialized) {
    return;
  }

  // A configuração do SDK Admin é mais segura usando variáveis de ambiente
  // que são definidas no seu ambiente de hospedagem (ex: Vercel, Netlify, Firebase Functions).
  // O Next.js permite o uso de variáveis de ambiente prefixadas com NEXT_PUBLIC_ para o cliente
  // e variáveis sem prefixo para o servidor (que é o nosso caso aqui).
  //
  // No seu arquivo .env.local (que NÃO deve ser enviado para o repositório git), você teria:
  // FIREBASE_PROJECT_ID=seu-project-id
  // FIREBASE_CLIENT_EMAIL=seu-client-email
  // FIREBASE_PRIVATE_KEY="sua-private-key-com-quebras-de-linha-substituidas-por-\n"

  // Para o IDX/Firebase Studio, podemos definir essas variáveis no `.idx/dev.nix`
  // ou usar o service account JSON diretamente, mas é menos seguro.
  // Vamos simular as variáveis de ambiente aqui por enquanto.

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0921435570',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL, // Isso precisará ser configurado corretamente
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // E isso também
  };

  // Se as variáveis de ambiente não estiverem configuradas, o SDK pode tentar
  // encontrá-las automaticamente em ambientes do Google Cloud.
  // Para desenvolvimento local, o ideal é ter o arquivo JSON da conta de serviço
  // e apontar para ele com a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS.
  //
  // Vamos tentar inicializar com as credenciais que temos.
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
    });
    isInitialized = true;
    console.log('Firebase Admin SDK inicializado com sucesso.');
  } catch (error: any) {
    // Se o erro for que o app já existe, não é um problema real em dev com HMR
    if (error.code === 'app/duplicate-app') {
      isInitialized = true;
    } else {
      console.error("Erro ao inicializar Firebase Admin SDK:", error.message);
      // Em um app de produção, você pode querer lançar o erro
      // throw error;
    }
  }
}
