import { Button } from "flowbite-react";
import Image from "next/image";
import React from "react";

const Products = () => {
  
  const products = [
    {
      name: "Product 1",
      price: 11000,
      image:
        "https://www.akbaraslam.com/cdn/shop/files/DSC05620_400x.jpg?v=1711107560",
    },
    {
      name: "Product 2",
      price: 12000,
      image:
        "https://www.akbaraslam.com/cdn/shop/files/DSC05897_400x.jpg?v=1711108141",
    },
    {
      name: "Product 3",
      price: 13000,
      image:
        "https://www.akbaraslam.com/cdn/shop/files/DSC05758_400x.jpg?v=1711107931",
    },
    {
      name: "Product 4",
      price: 14000,
      image:
        "https://www.akbaraslam.com/cdn/shop/files/DSC05953_400x.jpg?v=1711108394",
    },
    {
      name: "Product 5",
      price: 15000,
      image:
        "https://www.akbaraslam.com/cdn/shop/files/DSC05168_400x.jpg?v=1711109975",
    },
    {
      name: "Product 6",
      price: 16000,
      image:
        "https://www.akbaraslam.com/cdn/shop/files/DSC06069_400x.jpg?v=1711109551",
    },
  ];
  return (
    <section className="mx-4 sm:mx-12 my-10 md:my-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <div key={index}>
            <div>
              <Image
                src={
                  `${product.image}`
                }
                alt="product"
                width={300}
                height={250}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="py-2">
              <h3 className="font-semibold">{product.name}</h3>
              <p>${product.price}</p>
            </div>
            <div>
              <Button
                color="dark"
                outline
                pill
                size="sm"
                className="w-full text-white"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Products;
