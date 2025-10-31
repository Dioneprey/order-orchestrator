import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';
import { OrderItem } from './order-item';
import { Currency } from 'src/core/types/currency';

export type OrderKey = 'id' | 'externalId' | 'idempotencyKey';

export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  PROCESSING_ENRICHMENT = 'PROCESSING_ENRICHMENT',
  COMPLETED_ENRICHMENT = 'COMPLETED_ENRICHMENT',
  FAILED_ENRICHMENT = 'FAILED_ENRICHMENT',
}

export interface OrderProps {
  externalId: string;
  customerEmail: string;
  customerName: string;
  items?: OrderItem[];
  currency: Currency;
  idempotencyKey: string;
  status: OrderStatus;

  baseAmount: number;
  convertedAmount?: number | null;
  exchangeRate?: number | null;
  convertedCurrency?: Currency | null;

  createdAt: Date;
  updatedAt?: Date | null;
}

export class Order extends Entity<OrderProps> {
  get externalId() {
    return this.props.externalId;
  }

  get customerEmail() {
    return this.props.customerEmail;
  }

  get customerName() {
    return this.props.customerName;
  }

  get items() {
    return this.props.items;
  }

  set items(items: OrderItem[] | undefined) {
    this.props.items = items;
    this.touch();
  }

  get currency() {
    return this.props.currency;
  }

  set currency(currency: Currency) {
    this.props.currency = currency;
    this.touch();
  }

  get idempotencyKey() {
    return this.props.idempotencyKey;
  }

  get status() {
    return this.props.status;
  }

  set status(status: OrderStatus) {
    this.props.status = status;
    this.touch();
  }

  get baseAmount() {
    return this.props.baseAmount;
  }

  set baseAmount(amount: number) {
    this.props.baseAmount = amount;
    this.touch();
  }

  get convertedAmount() {
    return this.props.convertedAmount;
  }

  set convertedAmount(amount: number | null | undefined) {
    this.props.convertedAmount = amount ?? null;
    this.touch();
  }

  get exchangeRate() {
    return this.props.exchangeRate;
  }

  set exchangeRate(rate: number | null | undefined) {
    this.props.exchangeRate = rate ?? null;
    this.touch();
  }

  get convertedCurrency() {
    return this.props.convertedCurrency;
  }

  set convertedCurrency(currency: Currency | null | undefined) {
    this.props.convertedCurrency = currency ?? null;
    this.touch();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<OrderProps, 'createdAt' | 'status'>,
    id?: UniqueEntityID,
  ) {
    const order = new Order(
      {
        ...props,
        status: props.status ?? OrderStatus.RECEIVED,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return order;
  }
}
