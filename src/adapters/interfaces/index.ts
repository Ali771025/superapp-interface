export type AdapterMode = 'mock' | 'blockchain' | 'api';

export interface TransactionResult {
  txHash: string;
}

export interface ReadAdapter<T> {
  read(address: string): Promise<T>;
}

export interface WriteAdapter<TInput, TOutput extends TransactionResult = TransactionResult> {
  write(input: TInput): Promise<TOutput>;
}

export interface AdapterDescriptor {
  id: string;
  mode: AdapterMode;
  audited: boolean;
  sourceOfTruth: 'fixture' | 'chain' | 'backend';
}
