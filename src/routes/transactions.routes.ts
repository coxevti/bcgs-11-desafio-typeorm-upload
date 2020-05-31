import { Router } from 'express';
import multer from 'multer';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import storageMulter from '../configs/multer';

const transactionsRouter = Router();
const upload = multer(storageMulter);

transactionsRouter.get('/', async (request, response) => {
  // TODO
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find({
    relations: ['category'],
  });
  const balance = await transactionRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  // TODO
  const { title, value, type, category } = request.body;
  const createTransactionservice = new CreateTransactionService();
  const transaction = await createTransactionservice.execute({
    title,
    value,
    type,
    category,
  });
  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute({ id });
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO
    const filePath = request.file.path;
    const importTransactionService = new ImportTransactionsService();
    const transactions = await importTransactionService.execute({ filePath });
    return response.json(transactions);
  },
);

export default transactionsRouter;
