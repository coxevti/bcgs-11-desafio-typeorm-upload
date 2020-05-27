import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Transaction, { TransactionType } from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  filePath: string;
}

interface TransactionCSV {
  title: string;
  type: TransactionType;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filePath }: Request): Promise<Transaction[]> {
    // TODO
    const readCSVStream = fs.createReadStream(filePath);
    const parseStream = csvParse({ from_line: 2, ltrim: true, rtrim: true });
    const parseCSV = readCSVStream.pipe(parseStream);
    const transactionsCsv: TransactionCSV[] = [];
    let categories: string[] = [];
    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      transactionsCsv.push({ title, type, value, category });
      categories.push(category);
    });
    await new Promise(resolve => parseCSV.on('end', resolve));
    categories = categories.filter(
      (elem, index, self) => index === self.indexOf(elem),
    );
    const categoryRepository = getRepository(Category);
    let existedCategory = await categoryRepository.find({
      where: { title: In(categories) },
    });
    if (existedCategory.length !== categories.length) {
      if (existedCategory.length === 0) {
        existedCategory = categoryRepository.create(
          categories.map(category => ({ title: category })),
        );
        await categoryRepository.save(existedCategory);
      } else {
        const findCategory = categories.filter(category => {
          const title = existedCategory.map(item => item.title);
          return !title.includes(category);
        });
        const createCategory = categoryRepository.create(
          findCategory.map(category => ({ title: category })),
        );
        await categoryRepository.save(createCategory);
        existedCategory = [...existedCategory, ...createCategory];
      }
    }
    const transactionRepository = getRepository(Transaction);
    const transactions = transactionRepository.create(
      transactionsCsv.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: existedCategory.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionRepository.save(transactions);
    await fs.promises.unlink(filePath);
    return transactions;
  }
}

export default ImportTransactionsService;
