export interface Product {
    _id: string,                 // 商品ID
    storeId: string,            // 屋台ID
    productName: string,        // 商品名
    productImageURL: string,    // 商品画像
    price: number,             // 値段
    cookTime: number,          // 調理時間
    stock: number,             // 在庫数
}

export interface CartItem extends Product {
    quantity: number
}