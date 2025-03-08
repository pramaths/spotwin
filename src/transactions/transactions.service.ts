import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    manager?: any,
  ): Promise<Transaction> {
    const transaction = manager
      ? manager.create(Transaction, createTransactionDto)
      : this.transactionRepository.create(createTransactionDto);
    return manager
      ? manager.save(transaction)
      : this.transactionRepository.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      relations: ['user', 'contest'],
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user', 'contest'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);
    Object.assign(transaction, updateTransactionDto);
    return await this.transactionRepository.save(transaction);
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.findOne(id);
    await this.transactionRepository.remove(transaction);
  }
}
