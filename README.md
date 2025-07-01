# Sistema de Gerenciamento de Sinistros - Seguros Zurich

Sistema web desenvolvido em Angular 2 para gerenciamento de sinistros de seguros.

## Funcionalidades

- **Autenticação**: Sistema de login com validação de email e senha
- **Listagem de Sinistros**: Visualização de todos os sinistros cadastrados
- **Cadastro de Sinistros**: Formulário para adicionar novos sinistros
- **Edição de Sinistros**: Atualização de informações de sinistros existentes
- **Exclusão de Sinistros**: Remoção de sinistros com confirmação

## Estrutura do Projeto

```
Seguros Zurich/
  - app/                      # Código-fonte da aplicação
    - models/                 # Modelos de dados
    - services/               # Serviços para comunicação com API
      - auth-service.ts       # Serviço de autenticação
      - claim-service.ts      # Serviço de gerenciamento de sinistros
      - login-service.ts      # Serviço de login
    - validators/             # Validadores personalizados
    - views/                  # Templates HTML
  - index.html                # Página principal
  - package.json              # Dependências do projeto
  - tsconfig.json             # Configuração do TypeScript
```

## Tecnologias Utilizadas

- **Angular 2**: Framework para desenvolvimento frontend
- **TypeScript**: Linguagem de programação
- **Bootstrap**: Framework CSS para interface responsiva
- **JWT**: Autenticação baseada em tokens

## Pré-requisitos

- Node.js (versão 22 ou superior)
- npm (gerenciador de pacotes do Node.js)

## Instalação

1. Clone o repositório:
```
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências:
```
npm install
```

3. Execute o run do TypeScript:
```
npm run tsc
```

4. Inicie o servidor de desenvolvimento:
```
npm start
```

4. Acesse a aplicação em `http://localhost:3000` ou `https://extracta.azurewebsites.net`

## Fluxo de Trabalho

1. Faça login com suas credenciais
2. Na tela principal, visualize a lista de sinistros cadastrados
3. Para adicionar um novo sinistro, clique no botão "Novo Sinistro"
4. Para editar ou excluir, utilize os botões disponíveis em cada registro

## Autores

- VICTOR GABRIEL RODRIGUES LIMA