import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Currency } from 'src/core/types/currency';
import { Optional } from 'src/core/types/optional';

export type OrderItemKey = 'id';

export interface OrderItemProps {
  orderId: UniqueEntityID;
  sku: string;
  qty: number;
  currency: Currency;
  unitPrice: number;
  convertedUnitPrice?: number | null;
  convertedCurrency?: Currency | null;
  exchangeRate?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class OrderItem extends Entity<OrderItemProps> {
  get orderId() {
    return this.props.orderId;
  }

  get sku() {
    return this.props.sku;
  }
  set sku(sku: string) {
    this.props.sku = sku;
    this.touch();
  }

  get qty() {
    return this.props.qty;
  }
  set qty(qty: number) {
    this.props.qty = qty;
    this.touch();
  }

  get unitPrice() {
    return this.props.unitPrice;
  }
  set unitPrice(price: number) {
    this.props.unitPrice = price;
    this.touch();
  }

  get currency() {
    return this.props.currency;
  }
  set currency(currency: Currency) {
    this.props.currency = currency;
    this.touch();
  }

  get convertedUnitPrice() {
    return this.props.convertedUnitPrice;
  }
  set convertedUnitPrice(convertedUnitPrice: number | null | undefined) {
    this.props.convertedUnitPrice = convertedUnitPrice ?? null;
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
    props: Optional<OrderItemProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const item = new OrderItem(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return item;
  }
}
