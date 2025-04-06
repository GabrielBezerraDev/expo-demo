export interface OrderInterface {
    clientName: string;
    tableNumber: number;
    descriptionOrder: string;    
    food: number;
}

export interface OrderInterfaceGet extends OrderInterface{
    id: number;
    createdAt: string;
    finishOrder: boolean;
}

export interface OrderInterfacePost extends OrderInterface{}