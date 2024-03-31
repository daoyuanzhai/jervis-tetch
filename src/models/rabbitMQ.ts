export interface Exchange {
    name: string;
    type: string;
    durable: boolean;
    auto_delete?: boolean;
    arguments?: any;
}

export interface Queue {
    name: string;
    durable: boolean;
    arguments?: any;
}

export interface Binding {
    exchange: string;
    queue: string;
    routing_key: string;
    arguments?: any;
}

export interface Config {
    exchanges: Exchange[];
    queues: Queue[];
    bindings: Binding[];
}