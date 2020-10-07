import { Router, Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';

import uploadConfig from '../config/uploads';
// import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/BKPImportTransactionsService';
import ImportTransactionsService from '../services/OficialImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  // TODO
  //   GET /transactions: Essa rota deve retornar uma listagem com todas as transações que você
  // cadastrou até agora, junto com o valor da soma de entradas, retiradas e total de crédito. Essa
  // rota deve retornar um objeto o seguinte formato:
  // {
  //   "transactions": [
  //     {
  //       "id": "uuid",
  //       "title": "Salário",
  //       "value": 4000,
  //       "type": "income",
  //       "category": {
  //         "id": "uuid",
  //         "title": "Salary",
  //         "created_at": "2020-04-20T00:00:49.620Z",
  //         "updated_at": "2020-04-20T00:00:49.620Z"
  //       },
  //       "created_at": "2020-04-20T00:00:49.620Z",
  //       "updated_at": "2020-04-20T00:00:49.620Z"
  //     },
  //     {
  //       "id": "uuid",
  //       "title": "Free_la",
  //       "value": 2000,
  //       "type": "income",
  //       "category": {
  //         "id": "uuid",
  //         "title": "Others",
  //         "created_at": "2020-04-20T00:00:49.620Z",
  //         "updated_at": "2020-04-20T00:00:49.620Z"
  //       },
  //       "created_at": "2020-04-20T00:00:49.620Z",
  //       "updated_at": "2020-04-20T00:00:49.620Z"
  //     },
  //     {
  //       "id": "uuid",
  //       "title": "Pagamento da fatura",
  //       "value": 4000,
  //       "type": "outcome",
  //       "category": {
  //         "id": "uuid",
  //         "title": "Others",
  //         "created_at": "2020-04-20T00:00:49.620Z",
  //         "updated_at": "2020-04-20T00:00:49.620Z"
  //       },
  //       "created_at": "2020-04-20T00:00:49.620Z",
  //       "updated_at": "2020-04-20T00:00:49.620Z"
  //     },
  //     {
  //       "id": "uuid",
  //       "title": "Cadeira Gamer",
  //       "value": 1200,
  //       "type": "outcome",
  //       "category": {
  //         "id": "uuid",
  //         "title": "Recreation",
  //         "created_at": "2020-04-20T00:00:49.620Z",
  //         "updated_at": "2020-04-20T00:00:49.620Z"
  //       },
  //       "created_at": "2020-04-20T00:00:49.620Z",
  //       "updated_at": "2020-04-20T00:00:49.620Z"
  //     }
  //   ],
  //   "balance": {
  //     "income": 6000,
  //     "outcome": 5200,
  //     "total": 800
  //   }
  // }
  // Dica: Dentro de balance, o income é a soma de todos os valores das transações com type income. O outcome é a soma de todos os valores das transações com type outcome, e o total é o valor de income - outcome.
  // Dica 2: Para fazer a soma dos valores, você pode usar a função reduce para agrupar as transações pela propriedade type, assim você irá conseguir somar todos os valores com facilidade e obter o retorno do balance.
  //
  // try {
  //   // TODO
  //   const transactions = transactionsRepository.all();
  //   const balance = transactionsRepository.getBalance();
  //   return response.status(200).json({ transactions, balance });
  // } catch (err) {
  //   return response.status(400).json({ error: err.message });
  // }
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  // TODO
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();
  const newTransaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  //   POST /transactions: A rota deve receber title, value, type, e category dentro do corpo da requisição, sendo o type o tipo da transação, que deve ser income para entradas (depósitos) e outcome para saídas (retiradas). Ao cadastrar uma nova transação, ela deve ser armazenada dentro do seu banco de dados, possuindo os campos id, title, value, type, category_id, created_at, updated_at.
  // Dica: Para a categoria, você deve criar uma nova tabela, que terá os campos id, title, created_at, updated_at.
  // Dica 2: Antes de criar uma nova categoria, sempre verifique se já existe uma categoria com o mesmo título. Caso ela exista, use o id já existente no banco de dados.
  // {
  //   "id": "uuid",
  //   "title": "Salário",
  //   "value": 3000,
  //   "type": "income",
  //   "category": "Alimentação"
  // }
  return response.json(newTransaction); // { okPOST: { title, value, type, category } });
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  // DELETE /transactions/:id: A rota deve deletar uma transação com o id presente nos parâmetros da rota
  const { id } = request.params;
  // console.log(id);
  const deleteTransaction = new DeleteTransactionService();

  // try {
  const deletedTransaction = await deleteTransaction.execute(id);

  return response.json({ deleted: deletedTransaction });
});

transactionsRouter.post(
  '/import', // route name
  // multer({ dest: './tmp' }).single('file'), // middleware to download one file (csv)
  multer(uploadConfig).single('file'), // file
  // my last middleware with CSV processing ()=>{}
  async (request: Request, response: Response) => {
    // my last middleware with CSV processing with arrow function
    const filePath = request.file.path;

    const importTransactions = new ImportTransactionsService();
    const newTransactions = await importTransactions.execute(filePath);
    // continue processing results and send it to dataBase...

    // console.log({ resultsCounter, results }); // For testing
    return response.json({ newTransactions }); // For testing, I'm returning the response
    // POST /transactions/import: A rota deve permitir a importação de um arquivo com formato .csv contendo as mesmas informações necessárias para criação de uma transação id, title, value, type, category_id, created_at, updated_at, onde cada linha do arquivo CSV deve ser um novo registro para o banco de dados, e por fim retorne todas as transactions que foram importadas para seu banco de dados. O arquivo csv, deve seguir o seguinte modelo
    // return next(); //
  },
);

export default transactionsRouter;
