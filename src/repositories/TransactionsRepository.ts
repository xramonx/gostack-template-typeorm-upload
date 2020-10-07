import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO
    const transactions = await this.find();

    const income = this.calcIncome(transactions);
    const outcome = this.calcOutcome(transactions);

    const total = income - outcome;

    const balance: Balance = { income, outcome, total };

    return balance;
  }

  private calcIncome(transactions: Transaction[]): number {
    const income = transactions.reduce((total, actualElement) => {
      if (actualElement.type === 'income') {
        return total + Number(actualElement.value);
      }
      return total;
    }, 0);
    return income;
  }

  private calcOutcome(transactions: Transaction[]): number {
    const outcome = transactions.reduce((total, actualElement) => {
      if (actualElement.type === 'outcome') {
        return total + Number(actualElement.value);
      }
      return total;
    }, 0);
    return outcome;
  }
}

export default TransactionsRepository;
