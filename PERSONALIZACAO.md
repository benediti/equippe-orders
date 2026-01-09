# 🎨 Guia de Personalização de Cores - Equippe Pedidos

Este guia explica como personalizar as cores do seu aplicativo de forma simples e rápida.

## 📍 Onde Alterar as Cores

Todas as cores do tema estão configuradas em um único arquivo:
**`src/app/globals.css`**

## 🎨 Cores Atuais

### Cor Principal (Azul Equippe)
```css
--primary: #0066FF;        /* Azul principal */
--primary-dark: #0052CC;   /* Azul escuro para hover */
--primary-light: #4D94FF;  /* Azul claro para backgrounds */
```

### Cor de Destaque (Vermelho)
```css
--accent: #ab1a1a;         /* Vermelho para destaques */
--accent-dark: #8a1515;    /* Vermelho escuro para hover */
```

## 🔧 Como Mudar as Cores

### Opção 1: Alterar Cores Manualmente

1. Abra o arquivo `src/app/globals.css`
2. Procure a seção `:root` no início do arquivo
3. Altere os valores hexadecimais das cores:

```css
:root {
  /* Sua nova cor principal */
  --primary: #SEU_CODIGO_AQUI;
  --primary-dark: #VERSAO_ESCURA;
  --primary-light: #VERSAO_CLARA;

  /* Sua nova cor de destaque */
  --accent: #SEU_CODIGO_AQUI;
  --accent-dark: #VERSAO_ESCURA;
}
```

### Opção 2: Usar Paleta de Cores Predefinida

Você também pode atualizar a paleta completa no `@theme inline`. Por exemplo:

**Para Azul:**
```css
--color-primary-500: #0066FF;  /* Tom principal */
--color-primary-600: #0052CC;  /* Tom escuro */
--color-primary-400: #60a5fa;  /* Tom claro */
```

**Para Verde:**
```css
--color-primary-500: #10b981;
--color-primary-600: #059669;
--color-primary-400: #34d399;
```

**Para Roxo:**
```css
--color-primary-500: #7c3aed;
--color-primary-600: #6d28d9;
--color-primary-400: #a78bfa;
```

## 🌈 Sugestões de Paletas de Cores

### Paleta Profissional (Azul Corporativo)
- **Principal**: `#0066FF`
- **Destaque**: `#ab1a1a`

### Paleta Moderna (Verde e Azul)
- **Principal**: `#10b981`
- **Destaque**: `#06b6d4`

### Paleta Criativa (Roxo e Rosa)
- **Principal**: `#7c3aed`
- **Destaque**: `#ec4899`

### Paleta Energética (Laranja e Amarelo)
- **Principal**: `#f97316`
- **Destaque**: `#fbbf24`

## 🛠️ Ferramentas para Escolher Cores

- **Coolors.co** - https://coolors.co/
  Gerador de paletas de cores

- **Adobe Color** - https://color.adobe.com/
  Criar esquemas de cores harmoniosos

- **Color Hunt** - https://colorhunt.co/
  Paletas de cores prontas e modernas

## 📱 Testando as Mudanças

Após alterar as cores:

1. Salve o arquivo `globals.css`
2. O Next.js recarregará automaticamente
3. Verifique todas as páginas:
   - Login
   - Dashboard Admin
   - Dashboard Supervisor
   - Dashboard Aprovador
   - Dashboard Compras

## 💡 Dicas de Design

1. **Contraste**: Certifique-se de que o texto seja legível sobre os backgrounds
2. **Consistência**: Use as variáveis CSS em todo o projeto
3. **Acessibilidade**: Teste as cores com ferramentas de contraste (WCAG)
4. **Dark Mode**: As cores se ajustam automaticamente no modo escuro

## 🎯 Onde as Cores São Usadas

- **primary-500**: Botões principais, links, ícones de ação
- **primary-100**: Backgrounds sutis, hover states
- **accent-500**: Alertas, badges importantes, botão de sair
- **accent-100**: Backgrounds de erro/aviso
- **success** (#10b981): Confirmações, status "ativo"
- **warning** (#f59e0b): Avisos
- **error** (#ef4444): Erros

## 📝 Exemplo Completo de Customização

```css
:root {
  /* Cores da sua empresa */
  --primary: #1a73e8;        /* Azul Google-like */
  --primary-dark: #1557b0;
  --primary-light: #4285f4;
  --accent: #ea4335;         /* Vermelho Google-like */
  --accent-dark: #c5221f;

  /* Mantém as cores neutras */
  --background: #ffffff;
  --surface: #f8fafc;
  --foreground: #0f172a;
  --foreground-muted: #64748b;

  /* Cores de feedback */
  --success: #34a853;        /* Verde Google-like */
  --warning: #fbbc04;        /* Amarelo Google-like */
  --error: #ea4335;
  --info: #4285f4;
}
```

---

🎨 **Divirta-se personalizando seu app!**
