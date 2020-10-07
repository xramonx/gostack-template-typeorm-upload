import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    // TODO

    if (value <= 0) {
      throw new AppError('Wrong value sent - not allowed');
    }
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    let existingCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (existingCategory === undefined) {
      // criar nova categoria, pois não foi encontrada
      existingCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(existingCategory);
    }

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (balance.total - value < 0) {
        throw new AppError(
          'Transaction denied: Not enough money for complete transaction',
          400,
        );
      }
    }

    const newTransaction = transactionsRepository.create({
      title,
      value,
      type,
      category: existingCategory,
      category_id: existingCategory.id,
    });

    await transactionsRepository.save(newTransaction);
    return newTransaction;
  }
}

export default CreateTransactionService;
