# Controle Financeiro Mensal

Aplicativo web simples para controlar suas contas mensais (água, luz, internet, telefone etc.) e suas receitas (salário, freelance, vendas...), mês a mês.

## Funcionalidades

- Cadastro de contas com nome, categoria e valor
- Marcação de conta como paga/pendente
- Cadastro de receitas com descrição/origem e valor
- Resumo automático: total de receitas, total de contas e saldo do mês
- Navegação entre meses (12 meses anteriores até 3 meses à frente)
- Dados salvos localmente no navegador (`localStorage`) — não precisa de internet nem de servidor
- Pronto para instalar como PWA (funciona offline, ícone na tela inicial)

## Estrutura do projeto

```
controle-financeiro/
├── index.html          # estrutura da página
├── style.css            # estilos (cinza nardo + cinza claro)
├── script.js             # lógica do app
├── manifest.json         # configuração do PWA
├── service-worker.js     # cache offline
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

## Como usar no GitHub Pages

1. Suba esta pasta para um repositório no GitHub.
2. Vá em **Settings → Pages**.
3. Em **Source**, selecione a branch `main` e a pasta `/root` (ou `/docs`, se você mover os arquivos para lá).
4. Salve. O GitHub vai gerar um link tipo `https://seu-usuario.github.io/nome-do-repositorio/`.
5. Abra esse link no celular (Chrome/Safari) e use a opção **"Adicionar à tela inicial"** para instalar como app (PWA).

## Observação importante

Os dados ficam salvos no navegador de cada dispositivo (`localStorage`). Isso significa que:
- Os dados **não sincronizam** automaticamente entre computador e celular.
- Se limpar os dados de navegação/cache do navegador, as contas cadastradas são apagadas.

Se no futuro você quiser sincronizar entre dispositivos, será necessário adicionar um banco de dados (ex: Firebase, Supabase) — posso te ajudar com isso quando quiser evoluir o projeto.
