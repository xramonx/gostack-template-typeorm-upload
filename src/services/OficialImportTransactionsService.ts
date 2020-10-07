/* eslint-disable prettier/prettier */
import fs from 'fs';
import csv from 'csv-parse';

import { getCustomRepository, getRepository, In } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';


interface CSVTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    // TODO
    // import file as a vector processed
    // const results: string[] = [];

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    // let resultsCounter = 0;

    const transactions: CSVTransactionDTO[] = [];// : Transaction = [];
    const categories: string[] = [];

    const configCSVParser = {
      // delimiter(';'),//other delimiters different from default = ','
      from_line: 2, // data starts here
      trim: true, // ignore white spaces immediately around the delimiter (comma)
    };

    function parseCSVPromise(): Promise<void> {
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv(configCSVParser))
          .on('data', async row => {
            // resultsCounter += 1;
            const [title, type, value, category] = row;// =row.map((cell: string) => cell.trim());
            if (!title || !type || !value /* || !category is optional */) return;// don't continue

            categories.push(category);
            transactions.push({ title, type, value, category });
          })
          .on('error', error => {
            reject(error);
            throw new AppError('Fail to process CSV file', 500);
          })
          .on('end', () => {
            resolve();// ends the promise when CSV Parse send 'end' flag
          });
      });
    }

    // title, type, value, category
    await parseCSVPromise(); // now using the created promise - await finishing parsingCSV

    // fetch from repository (DB) all categories where the title is available In array categories
    const existentCategories = await categoriesRepository.find({ where: { title: In(categories) } });

    const existentCategoriesTitles = existentCategories.map((category: Category) => { return category.title });

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))


    /*----*/// Remove repeated items from an array like magic:
    // Explanation: in order to remove repetitions,it uses array.filter that returns a subArray
    // the first parameter of .filter is a callback function that return a (condition)
    // a condition has boolean result  <=> true or false) that decides if it will be filtered or not
    // .filter method tests, for each value of the array, if the actual index === self.indexOf(value)
    // self is the original array that originally called array.filter()
    // IndexOf(value) returns, if present, the FIRST occurrence of actual value
    // if actual index===IndexOf(value) matches (===true) then it is the first occurrence of value
    // it means that the second occurrence of the same value will not match index===IndexOf(value)
    const addCategoryTitlesWithoutRepetition = addCategoryTitles
      .filter((value, index, self) => { return (self.indexOf(value) === index); });


    const newCategories = categoriesRepository.create(
      addCategoryTitlesWithoutRepetition.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );


    await transactionsRepository.save(createdTransactions);
    fs.promises.unlink(filePath);

    // console.log(`importado ${resultsCounter}`);
    // when DB is empty, this are the results of array operations
    // categories: ['Others', 'Others', 'Food']
    // existentCategories: []
    // existentCategoriesTitles: []
    // addCategoryTitles: ['Others', 'Others', 'Food']
    // addCategoryTitlesWithoutRepetition: ['Others', 'Food']

    return createdTransactions;
  }
}

export default ImportTransactionsService;
