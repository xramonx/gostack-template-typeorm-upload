import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<Transaction> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const existingTransaction = await transactionsRepository.findOne({
      where: { id },
    });

    if (existingTransaction === undefined) {
      throw new AppError('Transaction unavailable, delete not possible', 400);
    }

    await transactionsRepository.delete(existingTransaction.id);

    return existingTransaction;
  }
}

export default DeleteTransactionService;
