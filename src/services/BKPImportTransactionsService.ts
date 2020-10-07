/* eslint-disable prettier/prettier */
import csv from 'csv-parse';
import fs from 'fs';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

// used on option 2
interface CSVTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    // TODO

    // let rowCounter = 0;
    const results: string[] = [];// option 1
    const newTransactions: CSVTransactionDTO[] = [];// option 2
    // const categories = [];

    function parseCSVPromise(): Promise<void> {
      return new Promise((resolve, reject) => {
        const ConfigCSV = {
          // delimiter: ',',// other delimiters different from default = ','
          from_line: 2, // data starts here
          trim: true, // ignore white spaces immediately around the delimiter (comma)
        };

        fs.createReadStream(filePath)
          .pipe(csv(ConfigCSV))
          .on('data', /* async */ row => {
            rowCounter += 1;// counter of how many rows were processed
            // console.log(data); // just test
            results.push(row); // Option1 - The simplest way is to push a complete row

            const [title, type, value, category] = row;// Option2, process it as an object
            newTransactions.push({title, type, value, category});// Option2, process it as an object
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


    await parseCSVPromise(); // now using the created promise - await finishing parsingCSV
    console.log('option1', results);// option1
    console.log('option2',newTransactions);// option2

    await fs.promises.unlink(filePath);
    // return {rowCounter, newTransactions};

    // const createTransaction = new CreateTransactionService();

    // results.map(async (result,index) => {
    //   const title = result[0] as string;
    //   const type = result[1] as 'income' | 'outcome';
    //   const value = Number(result[2]);
    //   const category = result[3] as string;
    //   newTransactions[index] = await createTransaction.execute({ title, type, value, category });

    // });
    // // await fs.promises.unlink(filePath);

    // // console.log(newTransactions[0]);
    // fs.promises.unlink(filePath);
    // return newTransactions;
  }
}

export default ImportTransactionsService;
