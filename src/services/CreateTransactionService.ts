import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction, { TransactionType } from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: TransactionType;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionRepository = getCustomRepository(TransactionRepository);
    const { total } = await transactionRepository.getBalance();
    if (type === TransactionType.outcome && value > total) {
      throw new AppError('No cash balance available');
    }
    const categoryRepository = getRepository(Category);
    let transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(transactionCategory);
    }
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
