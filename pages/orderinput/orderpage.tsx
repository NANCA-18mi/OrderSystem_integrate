import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../../components/header';
import Styles from '../../styles/orderInput.module.css';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { StoreList, CartItem, Product } from '../../lib/types';
import Cart from '../../components/orderinput/ProductCart';
import { ProductList } from '../../components/orderinput/ProductList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { set } from 'mongoose';


async function fetchProductList(): Promise<Product[]> {
  try {
    const response = await fetch(`/api/Utils/getStoreProductData`);
    if (!response.ok) {
      throw new Error('Failed to fetch product list');
    }

    const data: StoreList[] = await response.json();
    console.log('Fetched product list:', data);

    // 各商品の productList に storeId を追加
    const allProducts: Product[] = data.flatMap(store =>
      store.productList.map(product => ({
        ...product,
        storeId: store.storeId, // storeId を各商品に追加 
        openDay: store.openDay // storeDay を各商品に追加
      }))
    );

    console.log('All products:', allProducts);

    return allProducts;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function OrderPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [storeList, setStoreList] = useState<StoreList[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'0' | '1' | '2'>('0');

  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchProductList();
      setProductList(products);
      setStoreList(storeList);
    }
    loadProducts();
  }, []);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity } as CartItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== id));
  };

  const quantityChange = (id: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === id ? { ...item, quantity } : item
      )
    );
  };

  const filterProductDay = (day: number) => {
    return productList.filter(product => product.openDay === day);
  };

  return (
    <div>
      <Head>
        <title>注文入力</title>
      </Head>
      <Header />
      <div className={`${Styles.maincontainer} flex`}>
        <Tabs className="flex-1 overflow-auto p-4" value={activeTab} onValueChange={(value) => setActiveTab(value as '0' | '1' | '2')}>
          <TabsList>
            <TabsTrigger value="0" className={`text-lg px-4 py-2 ${activeTab === '0' ? 'border-b-2 border-blue-500' : ''} `}>すべて</TabsTrigger>
            <TabsTrigger value="1" className={`text-lg px-4 py-2 ${activeTab === '1' ? 'border-b-2 border-blue-500' : ''} `}>1日目</TabsTrigger>
            <TabsTrigger value="2" className={`text-lg px-4 py-2 ${activeTab === '2' ? 'border-b-2 border-blue-500' : ''} `}>2日目</TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-1 overflow-auto p-4">
            <TabsContent value="0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {productList.map((product) => (
                  <ProductList key={product.productId} {...product} addToCart={addToCart} />
                ))}

              </div>
            </TabsContent>
            <TabsContent value="1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filterProductDay(1).map((product) => (
                  <ProductList key={product.productId} {...product} addToCart={addToCart} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filterProductDay(2).map((product) => (
                  <ProductList key={product.productId} {...product} addToCart={addToCart} />
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        <Cart cart={cart} onRemove={removeFromCart} onQuantityChange={quantityChange} /> {/* onRemoveを渡す */}
      </div>
    </div>
  );
}

export default OrderPage;